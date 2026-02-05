const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
console.log('Private Key starts with:', privateKeyRaw ? privateKeyRaw.substring(0, 20) : 'undefined');
const privateKey = privateKeyRaw ? privateKeyRaw.replace(/\\n/g, '\n').replace(/^"/, '').replace(/"$/, '') : undefined;

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });

    const db = admin.firestore();
    console.log('Attempting to list collections...');
    db.listCollections()
        .then(collections => {
            console.log('Success! Found collections:', collections.length);
            process.exit(0);
        })
        .catch(err => {
            console.error('Firestore Error:', err.message);
            if (err.details) console.error('Details:', err.details);
            if (err.code) console.error('Code:', err.code);
            process.exit(1);
        });
} catch (err) {
    console.error('Initialization Error:', err.message);
    process.exit(1);
}
