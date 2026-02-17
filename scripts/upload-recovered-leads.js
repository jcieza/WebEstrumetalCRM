const admin = require('firebase-admin');
const fs = require('fs');

// Configuración
const serviceAccountPath = 'c:/Users/BENJI/Downloads/estrumetalonline-firebase-adminsdk-fbsvc-19ea620739.json';
const leadsPath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/estrumetal-app/scripts/stitched_leads.json';

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function uploadLeads() {
    console.log('--- INICIANDO CARGA DE LEADS RECUPERADOS ---');

    const rawData = fs.readFileSync(leadsPath, 'utf8');
    const leads = JSON.parse(rawData);

    console.log(`Cargando ${leads.length} leads a Firestore...`);

    let batch = db.batch();
    let count = 0;
    const now = new Date().toISOString();

    for (const lead of leads) {
        // Generar un ID basado en el nombre o RUC para evitar duplicados si se corre de nuevo
        const idBase = lead.detected_ruc || lead.detected_phone || lead.potential_name;
        const safeId = idBase.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const docRef = db.collection('recovered_leads').doc(safeId);

        const data = {
            ...lead,
            status: 'pending_enrichment',
            source: 'data_archaeology',
            createdAt: now,
            updatedAt: now
        };

        batch.set(docRef, data, { merge: true });
        count++;

        if (count % 400 === 0) {
            await batch.commit();
            batch = db.batch();
            console.log(`Cargados ${count}/${leads.length}...`);
        }
    }

    if (count % 400 !== 0) {
        await batch.commit();
    }

    console.log(`--- CARGA COMPLETADA: ${count} LEADS EN 'recovered_leads' ---`);
}

uploadLeads()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error en la carga:', err);
        process.exit(1);
    });
