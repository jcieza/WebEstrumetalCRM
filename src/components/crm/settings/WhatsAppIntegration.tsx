'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Link as LinkIcon, QrCode, RefreshCw, X, Shield, Server, Key, Terminal } from 'lucide-react';

interface WhatsAppIntegrationProps {
    onStatusChange?: (status: boolean) => void;
}

const WhatsAppIntegration: React.FC<WhatsAppIntegrationProps> = ({ onStatusChange }) => {
    const [config, setConfig] = useState({
        apiUrl: '',
        apiKey: '',
        instanceId: ''
    });
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('whatsapp_config');
        if (saved) {
            const data = JSON.parse(saved);
            setConfig(data);
            if (data.apiUrl && data.apiKey && data.instanceId) {
                // In a real app, we'd check status via API
                setIsConnected(localStorage.getItem('whatsapp_connected') === 'true');
            }
        }
    }, []);

    const saveConfig = (newConfig: typeof config) => {
        setConfig(newConfig);
        localStorage.setItem('whatsapp_config', JSON.stringify(newConfig));
    };

    const handleConnect = async () => {
        if (!config.apiUrl || !config.apiKey || !config.instanceId) {
            alert('Por favor, completa todos los campos técnicos.');
            return;
        }

        setIsConnecting(true);
        // Simulating Evolution API connection
        setTimeout(() => {
            setShowQRModal(true);
            setIsConnecting(false);
        }, 1500);
    };

    const confirmConnection = () => {
        setIsConnected(true);
        localStorage.setItem('whatsapp_connected', 'true');
        setShowQRModal(false);
        if (onStatusChange) onStatusChange(true);
    };

    const handleDisconnect = () => {
        if (confirm('¿Estás seguro de desconectar WhatsApp? Se perderá la sincronización en tiempo real.')) {
            setIsConnected(false);
            localStorage.setItem('whatsapp_connected', 'false');
            if (onStatusChange) onStatusChange(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Evolución API (WhatsApp Business)</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {isConnected ? 'Sincronización Activa' : 'Desconectado'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {isConnected && (
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase hover:bg-red-100 transition-all"
                        >
                            Desvincular
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                            <Server size={10} /> Endpoint URL (Evolution API)
                        </label>
                        <input
                            type="text"
                            value={config.apiUrl}
                            onChange={(e) => saveConfig({ ...config, apiUrl: e.target.value })}
                            placeholder="https://api.tu-servidor.com"
                            className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                            <Terminal size={10} /> Nombre de Instancia
                        </label>
                        <input
                            type="text"
                            value={config.instanceId}
                            onChange={(e) => saveConfig({ ...config, instanceId: e.target.value })}
                            placeholder="Ej: Estrumetal_CRM"
                            className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10"
                        />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                            <Key size={10} /> API Key / Global Token
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={config.apiKey}
                                onChange={(e) => saveConfig({ ...config, apiKey: e.target.value })}
                                placeholder="********************************"
                                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10"
                            />
                        </div>
                    </div>
                </div>

                {!isConnected && (
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full mt-6 py-4 bg-green-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-900/20 hover:bg-green-900 transition-all flex items-center justify-center gap-3"
                    >
                        {isConnecting ? <RefreshCw size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                        {isConnecting ? 'Validando Credenciales...' : 'Iniciar Vinculación con WhatsApp'}
                    </button>
                )}
            </div>

            {/* Instruction Card */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-3">
                <Shield className="text-amber-600 flex-shrink-0" size={18} />
                <div>
                    <span className="text-[10px] font-black text-amber-900 uppercase">Seguridad de la Conexión</span>
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed mt-1 uppercase tracking-tight">
                        La API de Evolution se utiliza para puentear WhatsApp Business. Asegúrate de que el servidor sea privado y use SSL (HTTPS) para proteger los tokens de sesión.
                    </p>
                </div>
            </div>

            {/* QR Modal Placeholder */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Escanea para Conectar</h4>
                            <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="bg-gray-50 border-4 border-gray-100 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center mb-6 group">
                            <div className="relative">
                                <QrCode size={180} className="opacity-80 group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 border border-white/60 rounded-xl backdrop-blur-sm">
                                    <span className="text-[8px] font-black uppercase bg-green-800 text-white px-2 py-1 rounded">QR DINÁMICO</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            Abre WhatsApp en tu teléfono {'>'} Menú {'>'} Dispositivos vinculados {'>'} Vincular un dispositivo
                        </p>

                        <button
                            onClick={confirmConnection}
                            className="w-full py-4 bg-[#1A1D21] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                        >
                            He Escaneado el Código
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppIntegration;
