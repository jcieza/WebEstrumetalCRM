import * as admin from 'firebase-admin';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Firebase Admin
const firebaseAdminConfig = {
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
    });
}

const db = admin.firestore();
const sqlitePath = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/Playgraund/CRM-PRODUCTION/server/crm.db';
const sqliteDb = new sqlite3.Database(sqlitePath);

const dbRun = promisify(sqliteDb.run.bind(sqliteDb));
const dbAll = promisify(sqliteDb.all.bind(sqliteDb));

async function migrateTable(tableName: string, collectionName: string) {
    console.log(`Migrating ${tableName} to ${collectionName}...`);
    try {
        const rows = await dbAll(`SELECT * FROM ${tableName}`);
        console.log(`Found ${rows.length} rows in ${tableName}`);

        const batch = db.batch();
        for (const row of rows) {
            const docRef = db.collection(collectionName).doc(String((row as any).id || (row as any).code));
            batch.set(docRef, {
                ...row,
                migratedAt: new Date().toISOString()
            }, { merge: true });
        }

        await batch.commit();
        console.log(`Successfully migrated ${tableName}`);
    } catch (error) {
        console.error(`Error migrating ${tableName}:`, error);
    }
}

async function runMigration() {
    await migrateTable('clients', 'clients');
    await migrateTable('contacts', 'contacts');
    await migrateTable('production_orders', 'production_orders');
    await migrateTable('inventory_items', 'inventory_items');
    await migrateTable('cash_receipts', 'cash_receipts');
    await migrateTable('suppliers', 'suppliers');
    await migrateTable('employees', 'employees');
    await migrateTable('purchases', 'purchases');
    await migrateTable('quotations', 'quotations');

    console.log('Migration completed!');
    sqliteDb.close();
}

runMigration().catch(console.error);
