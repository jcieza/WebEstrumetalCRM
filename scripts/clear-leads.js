const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = 'c:/Users/BENJI/Downloads/estrumetalonline-firebase-adminsdk-fbsvc-19ea620739.json';
console.log('Cargando credenciales desde:', serviceAccountPath);

let serviceAccount;
try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
    console.error('ERROR CRÍTICO: No se pudo leer el archivo de credenciales.', e.message);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

console.log('Iniciando limpieza de recovered_leads...');
deleteCollection('recovered_leads', 500)
    .then(() => {
        console.log('Colección recovered_leads eliminada con éxito.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error al eliminar la colección:', err);
        process.exit(1);
    });
