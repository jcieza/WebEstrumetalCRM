import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

import { getStorage, FirebaseStorage } from "firebase/storage";
import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";

// Initialize Firebase
let app;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key") {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
} else {
    console.warn("Firebase API Key is missing. Check your .env.local file.");
    db = {} as any;
    auth = {} as any;
    storage = {} as any;
    googleProvider = {} as any;
}

export { app, db, auth, storage, googleProvider };
