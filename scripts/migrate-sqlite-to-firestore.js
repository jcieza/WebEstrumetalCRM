const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Firebase Admin
const firebaseAdminConfig = {
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"/, '').replace(/"$/, ''),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
});

const db = admin.firestore();
const sqlitePath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/Playgraund/CRM-PRODUCTION/server/data/crm.db';
const sqliteDb = new sqlite3.Database(sqlitePath);

const TABLES = [
    { table: 'inventory_items', collection: 'inventory' },
    { table: 'cash_receipts', collection: 'cash' },
    { table: 'internal_guides', collection: 'guides' },
    { table: 'employees', collection: 'employees' },
    { table: 'purchases', collection: 'purchases' },
    { table: 'leads', collection: 'leads' }
];

async function migrateTable(tableInfo) {
    return new Promise((resolve, reject) => {
        console.log(`Migrating table ${tableInfo.table} to collection ${tableInfo.collection}...`);

        sqliteDb.all(`SELECT * FROM ${tableInfo.table}`, [], async (err, rows) => {
            if (err) {
                console.error(`Error reading table ${tableInfo.table}:`, err.message);
                return reject(err);
            }

            console.log(`  Read ${rows.length} rows.`);
            let batch = db.batch();
            let count = 0;

            for (const row of rows) {
                // Simple transform: use 'id' if exists, otherwise generate or use a predictable one
                const docId = String(row.id || row.ID || row.ID_ITEM || Math.random().toString(36).substr(2, 9));
                const docRef = db.collection(tableInfo.collection).doc(docId);

                // Add updatedAt
                const data = { ...row, updatedAt: new Date().toISOString() };

                batch.set(docRef, data, { merge: true });
                count++;

                if (count % 400 === 0) {
                    await batch.commit();
                    batch = db.batch();
                    console.log(`    Uploaded ${count}/${rows.length}...`);
                }
            }

            if (count % 400 !== 0) {
                await batch.commit();
            }

            console.log(`  Completed ${tableInfo.collection}: ${count} docs.`);
            resolve();
        });
    });
}

async function run() {
    try {
        for (const tableInfo of TABLES) {
            await migrateTable(tableInfo);
        }
        console.log('--- SQLITE MIGRATION COMPLETED ---');
        sqliteDb.close();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

run();
