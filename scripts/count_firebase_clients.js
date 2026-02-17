const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('c:/Users/BENJI/Downloads/estrumetalonline-firebase-adminsdk-fbsvc-19ea620739.json', 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function countClients() {
    const snapshot = await db.collection('clients').get();
    console.log('Total clients in Firebase:', snapshot.size);
    process.exit(0);
}

countClients().catch(err => {
    console.error('Error counting clients:', err);
    process.exit(1);
});
