
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// NOTA: Para correr esto necesitamos los credenciales de Admin
// Pero como estamos en el entorno local, quizás podamos usar las del proyecto.
// Sin embargo, para no complicar con llaves privadas, intentaré usar el SDK de cliente si puedo, 
// pero en Node es mejor Firebase Admin.

// Intentaré simplemente leer el archivo de la Cloud Function si está accesible para ver la estructura.

const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'estrumetalonline'
    });
}

const db = admin.firestore();

async function checkMessages() {
    console.log('--- BUSCANDO MENSAJES REGISTRADOS ---');
    const snapshot = await db.collection('incoming_messages').orderBy('receivedAt', 'desc').limit(5).get();

    if (snapshot.empty) {
        console.log('No hay mensajes.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`From: ${data.from}`);
        console.log(`Subject: ${data.subject}`);
        console.log(`Has Attachments field: ${!!data.attachments}`);
        if (data.attachments) {
            console.log(`Attachments count: ${data.attachments.length}`);
            console.log(`First attachment keys: ${Object.keys(data.attachments[0] || {})}`);
            console.log(`First attachment URL: ${data.attachments[0]?.url}`);
        }
        console.log('---');
    });
}

checkMessages().catch(console.error);
