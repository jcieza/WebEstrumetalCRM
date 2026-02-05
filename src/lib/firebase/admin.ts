import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseAdminConfig),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export { admin };
