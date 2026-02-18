'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Bell, Palette, Shield,
    MessageSquare, Server, Database, Save, Zap, Check, Smartphone, Lock, Trash2, Edit2, Plus, DownloadCloud, RefreshCw, X, Clock, User, Activity, Monitor, Info
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { updateProfile, updatePassword } from 'firebase/auth';

import WhatsAppIntegration from './WhatsAppIntegration';

const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean, onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${enabled ? 'bg-green-800' : 'bg-gray-300'}`}
    >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${enabled ? 'left-6.5' : 'left-0.5'}`} />
    </button>
);

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState({
        showGeminiChat: true,
        autoSave: true,
        fastInventory: true,
        notifications: true,
    });

    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
    });

    useEffect(() => {
        if (auth.currentUser) {
            setProfile({
                displayName: auth.currentUser.displayName || '',
                email: auth.currentUser.email || '',
            });
        }
    }, [auth.currentUser]);

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    const [metrics, setMetrics] = useState<any>(null);
    const [fetchingMetrics, setFetchingMetrics] = useState(false);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateProfile = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            await updateProfile(auth.currentUser, { displayName: profile.displayName });
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!auth.currentUser) return;
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        setSaving(true);
        try {
            await updatePassword(auth.currentUser, passwords.new);
            setMessage({ type: 'success', text: 'Contraseña actualizada' });
            setPasswords({ new: '', confirm: '' });
        } catch (e: any) {
            setMessage({ type: 'error', text: 'Error: ' + e.message });
        } finally {
            setSaving(false);
        }
    };

    const fetchMetrics = async () => {
        setFetchingMetrics(true);
        try {
            const res = await fetch('/api/system/metrics');
            const data = await res.json();
            setMetrics(data);
        } catch (e) {
            console.error('Failed to fetch metrics:', e);
        } finally {
            setFetchingMetrics(false);
        }
    };

    const sections = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'appearance', label: 'Apariencia', icon: Palette },
        { id: 'integrations', label: 'Integraciones', icon: Server },
        { id: 'monitoring', label: 'Monitoreo', icon: Activity },
        { id: 'database', label: 'Base de Datos', icon: Database },
        { id: 'security', label: 'Seguridad', icon: Shield },
    ];

    const renderHeader = (label: string, icon: any) => {
        const Icon = icon;
        return (
            <div className="flex items-center gap-3 mb-6">
                <Icon className="text-green-800" size={24} />
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{label}</h2>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                    <SettingsIcon size={28} className="text-green-800" /> Configuración del Sistema
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Panel de control técnico y preferencias</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeSection === section.id ? 'bg-green-800 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <section.icon size={18} />
                            <span className="text-[11px] font-black uppercase tracking-tight">{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeSection === 'general' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Ajustes Generales', SettingsIcon)}

                            <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800 uppercase">Gemini Chat AI</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Habilitar asistente inteligente en sidebar</div>
                                    </div>
                                </div>
                                <ToggleSwitch enabled={settings.showGeminiChat} onToggle={() => setSettings({ ...settings, showGeminiChat: !settings.showGeminiChat })} />
                            </div>

                            <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
                                        <Save size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800 uppercase">Auto-guardado</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sincronizar cambios automáticamente en Firestore</div>
                                    </div>
                                </div>
                                <ToggleSwitch enabled={settings.autoSave} onToggle={() => setSettings({ ...settings, autoSave: !settings.autoSave })} />
                            </div>

                            <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-700">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800 uppercase">Inventario Veloz</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Captura rápida con IA en almacén</div>
                                    </div>
                                </div>
                                <ToggleSwitch enabled={settings.fastInventory} onToggle={() => setSettings({ ...settings, fastInventory: !settings.fastInventory })} />
                            </div>
                        </div>
                    )}

                    {activeSection === 'profile' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Perfil de Usuario', User)}
                            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                        className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all"
                                        placeholder="Tu Nombre"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 opacity-50">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Correo Institucional (Solo Lectura)</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="bg-gray-100 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="self-start px-8 py-3 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-green-900 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'integrations' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Integraciones y API', Server)}
                            <WhatsAppIntegration />
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Apariencia y UI', Palette)}
                            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Temas Industriales</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['CLARO', 'OSCURO', 'SISTEMA'].map(theme => (
                                        <button key={theme} className={`p-4 rounded-lg border text-[10px] font-black tracking-widest transition-all ${theme === 'CLARO' ? 'border-green-800 bg-green-50 text-green-800' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'monitoring' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Estado de Infraestructura', Activity)}

                            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Servidores & App Hosting</h3>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-1 italic">Consulta bajo demanda para optimización de recursos</p>
                                    </div>
                                    <button
                                        onClick={fetchMetrics}
                                        disabled={fetchingMetrics}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-[9px] font-black uppercase hover:bg-black transition-all shadow-sm"
                                    >
                                        <RefreshCw size={12} className={fetchingMetrics ? 'animate-spin' : ''} />
                                        {fetchingMetrics ? 'Consultando...' : 'Actualizar Estado'}
                                    </button>
                                </div>

                                {metrics ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="text-[8px] font-black text-gray-400 uppercase mb-2">Uptime del Servidor</div>
                                            <div className="text-sm font-black text-green-800 font-mono">{metrics.uptime.human}</div>
                                            <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase italic tracking-tighter">Desde el último despliegue</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="text-[8px] font-black text-gray-400 uppercase mb-2">Memoria RAM (Heap Used)</div>
                                            <div className="text-sm font-black text-blue-800 font-mono">{metrics.memory.heapUsed}</div>
                                            <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase italic tracking-tighter">Total asignado: {metrics.memory.heapTotal}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="text-[8px] font-black text-gray-400 uppercase mb-2">Node.js Version</div>
                                            <div className="text-sm font-black text-orange-800 font-mono">{metrics.environment.node}</div>
                                            <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase italic tracking-tighter">Platform: {metrics.environment.platform}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl lg:col-span-3 flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${metrics.services.firestore === 'connected' ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                    <span className="text-[9px] font-black uppercase text-gray-700">Firestore {metrics.services.firestore}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${metrics.services.gemini === 'active' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                                    <span className="text-[9px] font-black uppercase text-gray-700">Gemini 1.5 Flash {metrics.services.gemini}</span>
                                                </div>
                                            </div>
                                            <div className="text-[8px] font-bold text-gray-300 uppercase italic">Última revisión: {new Date(metrics.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300">
                                        <Activity size={48} className="mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Métricas no consultadas todavía</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-lg flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 flex-shrink-0">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-yellow-900 mb-1">Nota de Optimización</h4>
                                    <p className="text-[10px] font-bold text-yellow-700 leading-relaxed uppercase tracking-tight">
                                        Para optimizar el consumo de RAM en Firebase App Hosting, considera implementar caching progresivo en los endpoints de inteligencia y reducir el tamaño de los bundles de cliente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="flex flex-col gap-4">
                            {renderHeader('Seguridad de Planta', Shield)}

                            <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm flex flex-col gap-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actualizar Contraseña</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={saving || !passwords.new}
                                    className="self-start px-8 py-3 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-green-900 disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Procesando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm space-y-4 opacity-50">
                                {[
                                    { label: 'Autenticación en Dos Pasos', icon: Smartphone },
                                    { label: 'Auditoría de Sesiones', icon: Clock }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={16} className="text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <button className="text-[9px] font-black text-green-800 uppercase hover:underline">Configurar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300 ${message.type === 'success' ? 'bg-green-800 text-white' : 'bg-red-600 text-white'}`}>
                            {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                            <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                            <button onClick={() => setMessage(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
