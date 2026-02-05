'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Whitelist of authorized users (can be email or UID for extra security)
const AUTHORIZED_USERS = [
    'jciezalujan@gmail.com',
    's7Mtyvp9mOc6aQUT2XxZcrgajZl1' // Benjamin's Specific UID
];

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
                const isAuthorized = AUTHORIZED_USERS.includes(user.email || '') ||
                    AUTHORIZED_USERS.includes(user.uid);
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

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, authorized, login, logout }}>
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
