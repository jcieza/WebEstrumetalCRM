const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Configuración
const serviceAccountPath = 'c:/Users/BENJI/Downloads/estrumetalonline-firebase-adminsdk-fbsvc-19ea620739.json';
const sqlitePath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/Playgraund/CRM-PRODUCTION/server/data/crm.db';

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const sqliteDb = new sqlite3.Database(sqlitePath);

async function syncClients() {
    console.log('--- INICIANDO SINCRONIZACIÓN DE CLIENTES ---');

    return new Promise((resolve, reject) => {
        sqliteDb.all('SELECT * FROM clients', [], async (err, rows) => {
            if (err) {
                console.error('Error leyendo SQLite:', err);
                return reject(err);
            }

            console.log(`Leídos ${rows.length} clientes de SQLite.`);

            let batch = db.batch();
            let count = 0;
            const now = new Date().toISOString();

            for (const row of rows) {
                const docRef = db.collection('clients').doc(String(row.id));

                const data = {
                    id: row.id,
                    name: row.name,
                    ruc: row.ruc || '',
                    address: row.address || '',
                    type: 'MASTER',
                    updatedAt: now
                };

                batch.set(docRef, data, { merge: true });
                count++;

                if (count % 400 === 0) {
                    await batch.commit();
                    batch = db.batch();
                    console.log(`Sincronizados ${count}/${rows.length}...`);
                }
            }

            if (count % 400 !== 0) {
                await batch.commit();
            }

            console.log(`--- SINCRONIZACIÓN COMPLETADA: ${count} CLIENTES ---`);
            sqliteDb.close();
            resolve();
        });
    });
}

syncClients()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error en la sincronización:', err);
        process.exit(1);
    });
