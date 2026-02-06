'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login, loginWithEmail, logout, user, authorized, loading } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError('');
        try {
            await login();
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión con Google');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoggingIn(true);
        setError('');
        try {
            await loginWithEmail(email, password);
        } catch (err: any) {
            setError('Credenciales inválidas o correo no autorizado');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 px-4">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full" />

            <div className="relative z-10 w-full max-w-[440px]">
                {/* Logo & Branding */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/30 mb-6 rotate-3">
                        <KeyRound className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">Estrumetal</h1>
                    <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] mt-3 uppercase opacity-60">CRM Central de Operaciones</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

                    {user && !authorized ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldAlert size={32} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-3">ACCESO DENEGADO</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                                Tu correo <span className="text-slate-200 font-bold">({user.email})</span> no está en la lista de personal autorizado.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => logout()}
                                    className="w-full py-4 px-6 rounded-2xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                                >
                                    Cerrar sesión e intentar localmente
                                </button>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full py-4 px-6 rounded-2xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[2px] hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Probar con otra cuenta Google
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-white mb-2">BIENVENIDO</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Gestiona con inteligencia tu planta</p>
                            </div>

                            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            placeholder="CORREO ELECTRÓNICO"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            placeholder="CONTRASEÑA"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-[9px] font-black uppercase tracking-tighter text-center mt-2">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-[2px] transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : 'Iniciar Sesión'}
                                </button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[9px]">
                                    <span className="bg-[#0b1121] px-4 text-slate-500 font-black uppercase tracking-widest">O TAMBIÉN</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoggingIn}
                                className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google Login
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <LogIn size={12} />
                    <span>Sistema Seguro Estrumetal</span>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]">
                        v2.4.0 • Build 2026-02-05
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
