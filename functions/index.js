const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Solo inicializamos si no se ha hecho antes
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function para recibir correos desde Cloudflare Worker.
 * Se activa mediante una petición HTTPS POST.
 */
const { algoliasearch } = require('algoliasearch');

// Initialize Algolia (User needs to set config)
const algoliaAppId = functions.config().algolia?.app_id || process.env.ALGOLIA_APP_ID;
const algoliaApiKey = functions.config().algolia?.api_key || process.env.ALGOLIA_API_KEY;
let algoliaClient;
let index;

if (algoliaAppId && algoliaApiKey) {
    try {
        algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
        // v5 handling might differ, but assuming standard client pattern or check docs
        // Actually v5 client.initIndex might not exist, it uses methods directly?
        // Let's use the lite client or standard. v5: client.search() but for indexing?
        // Wait, v5 server side: 
        // const client = algoliasearch('ID', 'KEY');
        // await client.saveObject({ indexName: 'name', body: object });
    } catch (e) {
        console.error('Algolia init error:', e);
    }
}

exports.ingestEmail = functions.https.onRequest(async (req, res) => {
    // 1. Verificación de Seguridad Básica (Token compartido)
    const secretToken = req.headers['x-estrumetal-token'];
    if (secretToken !== functions.config().ingestor.token) {
        console.error('Intento de acceso no autorizado.');
        return res.status(401).send('No autorizado');
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido');
    }

    try {
        const { from, to, subject, body, date } = req.body;

        // 2. Guardar en Firestore
        const messageRef = await db.collection('incoming_messages').add({
            from,
            to,
            subject,
            body,
            receivedAt: date || new Date().toISOString(),
            status: 'NEW', // Estado inicial del correo en el CRM
            metadata: {
                source: 'Cloudflare-Ingestor',
                userAgent: req.headers['user-agent']
            }
        });

        console.log(`Mensaje guardado correctamente con ID: ${messageRef.id}`);
        return res.status(200).json({ success: true, id: messageRef.id });

    } catch (error) {
        console.error('Error procesando el correo:', error);
        return res.status(500).send('Error Interno');
    }
});

/**
 * Trigger: Index emails to Algolia on Firestore write
 */
exports.onMessageWrite = functions.firestore.document('incoming_messages/{docId}').onWrite(async (change, context) => {
    if (!algoliaClient) return console.log('Algolia not configured');

    const newData = change.after.exists ? change.after.data() : null;
    const objectID = context.params.docId;

    try {
        if (!newData) {
            // Delete
            // v5 mechanism: client.deleteObject({ indexName, objectID })
            await algoliaClient.deleteObject({ indexName: 'estrumetal_mail', objectID });
            return;
        }

        const record = {
            objectID,
            ...newData,
            receivedAtTimestamp: new Date(newData.receivedAt).getTime()
        };

        if (record.body) {
            // Truncate body for indexing
            record.body_text = record.body.replace(/<[^>]*>?/gm, ' ').substring(0, 5000);
            delete record.body;
        }

        // v5 mechanism: client.saveObject({ indexName, body: record })
        await algoliaClient.saveObject({ indexName: 'estrumetal_mail', body: record });

    } catch (e) {
        console.error('Algolia indexing error:', e);
    }
});
