import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const isConfigComplete = firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey;

if (!admin.apps.length) {
    if (isConfigComplete) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig as any),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } catch (error) {
            console.error('Firebase admin initialization error:', error);
        }
    } else {
        console.warn('Firebase Admin credentials not fully configured. This is expected during build if secrets are not available.');
    }
}

// Export initialized services or null/proxy if not configured
export const adminDb = isConfigComplete ? admin.firestore() : null as any;
export const adminAuth = isConfigComplete ? admin.auth() : null as any;
export const adminStorage = isConfigComplete ? admin.storage() : null as any;
export { admin };
