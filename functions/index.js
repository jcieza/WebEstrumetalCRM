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
