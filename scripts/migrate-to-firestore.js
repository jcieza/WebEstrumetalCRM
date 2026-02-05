const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('Error: Credentials not found in .env.local');
    process.exit(1);
}

// Setup Firebase Admin
const firebaseAdminConfig = {
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
});

const db = admin.firestore();
const sqlitePath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/Playgraund/CRM-PRODUCTION/server/crm.db';
const sqliteDb = new sqlite3.Database(sqlitePath);

function migrateTable(tableName, collectionName) {
    return new Promise((resolve, reject) => {
        console.log(`Migrating ${tableName} to ${collectionName}...`);
        sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
            if (err) {
                console.error(`Error reading ${tableName}:`, err);
                return reject(err);
            }

            console.log(`Found ${rows.length} rows in ${tableName}`);
            if (rows.length === 0) return resolve();

            const batchSize = 400; // Firestore batch limit is 500
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = db.batch();
                const chunk = rows.slice(i, i + batchSize);

                chunk.forEach(row => {
                    const id = String(row.id || row.code || Math.random().toString(36).substr(2, 9));
                    const docRef = db.collection(collectionName).doc(id);
                    batch.set(docRef, {
                        ...row,
                        migratedAt: new Date().toISOString()
                    }, { merge: true });
                });

                await batch.commit();
                console.log(`  Processed ${Math.min(i + batchSize, rows.length)}/${rows.length}...`);
            }

            console.log(`Successfully migrated ${tableName}`);
            resolve();
        });
    });
}

async function runMigration() {
    try {
        const tables = [
            ['clients', 'clients'],
            ['contacts', 'contacts'],
            ['production_orders', 'production_orders'],
            ['inventory_items', 'inventory_items'],
            ['cash_receipts', 'cash_receipts'],
            ['suppliers', 'suppliers'],
            ['employees', 'employees'],
            ['purchases', 'purchases'],
            ['quotations', 'quotations']
        ];

        for (const [sqlTab, fsCol] of tables) {
            await migrateTable(sqlTab, fsCol);
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        sqliteDb.close();
    }
}

runMigration();
