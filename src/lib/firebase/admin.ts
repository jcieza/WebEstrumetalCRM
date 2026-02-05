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
            console.log('Firebase Admin initialized successfully in production.');
        } catch (error) {
            console.error('Firebase admin initialization error:', error);
        }
    } else {
        const missing = [];
        if (!firebaseAdminConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        if (!firebaseAdminConfig.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
        if (!firebaseAdminConfig.privateKey) missing.push('FIREBASE_PRIVATE_KEY');

        console.warn(`Firebase Admin credentials incomplete. Missing: ${missing.join(', ')}`);
        console.warn('Check App Hosting environment variables and secrets configuration.');
    }
}

// Export initialized services or null/proxy if not configured
export const adminDb = isConfigComplete ? admin.firestore() : null as any;
export const adminAuth = isConfigComplete ? admin.auth() : null as any;
export const adminStorage = isConfigComplete ? admin.storage() : null as any;
export { admin };
