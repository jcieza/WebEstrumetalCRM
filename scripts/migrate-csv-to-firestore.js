const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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
const DATA_DIR = 'c:/Users/BENJI/Documents/Obsidian Estrumetal/Playgraund/CRM-PRODUCTION/server';

const MAPPINGS = [
    {
        file: 'BD_CLIENTES_MASTER.csv',
        collection: 'clients',
        idField: 'ID_CLIENTE',
        transform: (row) => ({
            id: row.ID_CLIENTE,
            name: row.RAZON_SOCIAL,
            ruc: row.RUC || '',
            address: row.UBICACION || '',
            type: 'MASTER',
            updatedAt: new Date().toISOString()
        })
    },
    {
        file: 'BD_CONTACTOS.csv',
        collection: 'contacts',
        idField: 'ID_CONTACTO',
        transform: (row) => ({
            id: row.ID_CONTACTO,
            clientId: row.ID_CLIENTE,
            name: row.NOMBRE_CONTACTO,
            phone: row.TELEFONO || '',
            email: row.EMAIL || '',
            updatedAt: new Date().toISOString()
        })
    },
    {
        file: 'BD_ORDENES_PRODUCCION.csv',
        collection: 'production_orders',
        idField: 'ID_OP',
        transform: (row) => {
            let items = [];
            try {
                if (row.ITEMS_JSON) items = JSON.parse(row.ITEMS_JSON);
            } catch (e) { }

            return {
                id: row.ID_OP,
                clientId: row.ID_CLIENTE,
                clientName: row.CLIENTE_NOMBRE,
                deliveryDate: row.FECHA_ENTREGA,
                priority: row.PRIORIDAD,
                status: row.ESTADO,
                deliveredDate: row.FECHA_ENTREGADO || null,
                items: items,
                issueDate: row.FECHA_EMISION,
                quotationId: row.ID_COTIZACION || '',
                totalItems: parseInt(row.TOTAL_ITEMS) || 0,
                updatedAt: new Date().toISOString()
            };
        }
    },
    {
        file: 'HISTORIAL_VENTAS_MARKETING.csv',
        collection: 'quotations',
        idField: 'ID_COTIZACION',
        transform: (row) => ({
            id: row.ID_COTIZACION,
            issueDate: row.FECHA_EMISION,
            clientId: row.ID_CLIENTE,
            summary: row.RESUMEN_MARKETING,
            totalAmount: parseFloat(row.MONTO_TOTAL_VENTA) || 0,
            status: row.ESTADO_PROBABLE,
            updatedAt: new Date().toISOString()
        })
    },
    {
        file: 'BD_ARCHIVOS.csv',
        collection: 'files',
        idField: 'ORIGINAL_ID',
        transform: (row) => ({
            id: row.ORIGINAL_ID,
            canonicalId: row.CANONICAL_ID,
            filename: row.FILENAME,
            relativePath: row.RELATIVE_PATH,
            type: row.FILENAME.toLowerCase().endsWith('.pdf') ? 'pdf' :
                row.FILENAME.toLowerCase().endsWith('.xlsx') || row.FILENAME.toLowerCase().endsWith('.xls') ? 'excel' : 'other',
            updatedAt: new Date().toISOString()
        })
    }
];

async function migrateFile(mapping) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_DIR, mapping.file);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return resolve();
        }

        console.log(`Migrating ${mapping.file} to ${mapping.collection}...`);
        let count = 0;
        let batch = db.batch();
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ header }) => header.replace(/^\ufeff/, '').trim()
            }))
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                console.log(`  Read ${rows.length} rows. Uploading...`);
                for (let i = 0; i < rows.length; i++) {
                    const data = mapping.transform(rows[i]);

                    // Ensure we have a valid ID for Firestore
                    const rawId = data.id || rows[i][mapping.idField];
                    if (!rawId) {
                        // Check for potential mapping issues due to headers
                        console.warn(`      Skipping row ${i} in ${mapping.file}: No ID found (${mapping.idField}). Available keys: ${Object.keys(rows[i]).join(', ')}`);
                        continue;
                    }

                    const docId = String(rawId).trim();
                    if (!docId) {
                        console.warn(`      Skipping row ${i} in ${mapping.file}: Blank ID`);
                        continue;
                    }

                    const docRef = db.collection(mapping.collection).doc(docId);

                    // Remove the temporary 'id' from data as it's the document ID
                    const uploadData = { ...data };
                    // Keep the ID if you want it inside the document too, but let's be safe

                    batch.set(docRef, uploadData, { merge: true });
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

                console.log(`  Completed ${mapping.collection}: ${count} docs.`);
                resolve();
            })
            .on('error', reject);
    });
}

async function run() {
    try {
        for (const mapping of MAPPINGS) {
            await migrateFile(mapping);
        }
        console.log('--- ALL MIGRATIONS COMPLETED ---');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

run();
