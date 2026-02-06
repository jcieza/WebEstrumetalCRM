'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    authorized: boolean;
    login: () => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Whitelist of authorized users (can be email or UID for extra security)
const AUTHORIZED_USERS = [
    'jciezalujan@gmail.com',
    'josepuma158@gmail.com',
    's7Mtyvp9mOc6aQUT2XxZcrgajZl1' // Benjamin's Specific UID
];

const ALLOWED_DOMAINS = ['ciaestrumetal.com', 'ciaestrumetal.online'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!auth || typeof auth.onAuthStateChanged !== 'function') {
            console.error("Auth is not properly initialized. Check Firebase config.");
            setLoading(false);
            return;
        }

        // Ensure persistence
        try {
            setPersistence(auth, browserLocalPersistence);
        } catch (err) {
            console.error("Failed to set persistence:", err);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                const email = user.email || '';
                const domain = email.split('@')[1];
                const isAuthorized = AUTHORIZED_USERS.includes(email) ||
                    AUTHORIZED_USERS.includes(user.uid) ||
                    ALLOWED_DOMAINS.includes(domain);
                setAuthorized(isAuthorized);
            } else {
                setUser(null);
                setAuthorized(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Email Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, authorized, login, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
