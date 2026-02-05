'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import { Loader2 } from 'lucide-react';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, authorized } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-green-500" size={40} />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                        Verificando Credenciales...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || !authorized) {
        return <LoginPage />;
    }

    return <>{children}</>;
};

export default AuthGuard;
