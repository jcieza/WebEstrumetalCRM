import * as admin from 'firebase-admin';

const getParsedValue = (value: string, field: string) => {
    if (!value) return '';
    try {
        const parsed = JSON.parse(value);
        return parsed[field] || value;
    } catch (e) {
        if (field === 'private_key') {
            return value.replace(/\\n/g, '\n').replace(/"/g, '');
        }
        return value.replace(/"/g, '');
    }
};

const firebaseAdminConfig = {
    privateKey: getParsedValue(process.env.FIREBASE_PRIVATE_KEY || '', 'private_key'),
    clientEmail: getParsedValue(process.env.FIREBASE_CLIENT_EMAIL || '', 'client_email'),
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
            console.log('Firebase Admin initialized successfully.');
        } catch (error) {
            console.error('Firebase admin initialization error:', error);
        }
    } else {
        console.warn(`Firebase Admin incomplete. Missing fields in production environment.`);
    }
}

// Export initialized services or null/proxy if not configured
export const adminDb = isConfigComplete ? admin.firestore() : null as any;
export const adminAuth = isConfigComplete ? admin.auth() : null as any;
export const adminStorage = isConfigComplete ? admin.storage() : null as any;
export { admin };
