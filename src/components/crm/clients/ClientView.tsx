'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, AlertCircle, CheckCircle, FileText, Zap, BarChart, ShieldCheck } from 'lucide-react';
import { Client } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientViewProps {
    clientId: string;
    onBack: () => void;
}

const ClientView: React.FC<ClientViewProps> = ({ clientId, onBack }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'sales'>('overview');

    useEffect(() => {
        const fetchClientDetail = async () => {
            try {
                const res = await fetch(`/api/clients/${clientId}`);
                const data = await res.json();

                // Ensure DNA exists for UI
                setClient({
                    ...data,
                    dna: data.dna || {
                        segment: 'Nuevo Prospecto',
                        preferences: ['Análisis en proceso por IA']
                    },
                    alert: data.alert || {
                        type: 'success',
                        message: 'Cliente en buen estado operativo.'
                    }
                });
            } catch (error) {
                console.error("Error fetching client detail:", error);
            }
        };

        fetchClientDetail();
    }, [clientId]);

    if (!client) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compilando Perfil 360°...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-green-700 hover:border-green-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-tight">{client.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">RUC: {client.ruc}</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-400 uppercase truncate max-w-[300px]">{client.address}</span>
                        </div>
                    </div>
                </div>

                {client.alert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`px-8 py-4 rounded-3xl flex items-center gap-4 border shadow-xl ${client.alert.type === 'danger' ? 'bg-red-50 border-red-100 text-red-600 shadow-red-100/20' : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/20'}`}
                    >
                        {client.alert.type === 'danger' ? <AlertCircle size={24} className="animate-pulse" /> : <CheckCircle size={24} />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Acción Requerida</p>
                            <p className="text-sm font-bold tracking-tight">{client.alert.message}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-gray-100 p-1">
                {['overview', 'contacts', 'sales'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-green-700 text-white shadow-xl shadow-green-700/20 translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        {tab === 'overview' ? 'Resumen & DNA IA' : tab === 'contacts' ? 'Contactos Clave' : 'Historial Comercial'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
                        >
                            <div className="glass-card p-10 bg-white border-none shadow-sm flex flex-col gap-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                                        <BarChart size={24} className="text-green-700" />
                                        ADN del Proyecto
                                    </h3>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase border border-blue-100">
                                        Segmento: {client.dna.segment}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Preferencias Técnicas Detectadas</label>
                                        <div className="flex flex-wrap gap-3">
                                            {client.dna.preferences.map((pref, i) => (
                                                <span key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                                                    {pref}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-green-50/30 rounded-3xl border border-green-100">
                                        <div className="flex items-center gap-3 text-green-800 font-bold text-sm mb-2">
                                            <ShieldCheck size={20} />
                                            Certificación de Confianza
                                        </div>
                                        <p className="text-xs text-green-700 font-medium leading-relaxed">Este cliente ha completado 12 proyectos exitosos con nosotros. Su nivel de solvencia técnica es de 9.5/10.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-10 bg-white border-none shadow-sm flex flex-col gap-8">
                                <h3 className="text-xl font-black text-orange-600 uppercase tracking-tighter flex items-center gap-3">
                                    <Zap size={24} />
                                    Acciones Sugeridas
                                </h3>
                                {client.alert?.type === 'danger' ? (
                                    <div className="p-8 border-2 border-dashed border-orange-200 rounded-[2rem] bg-orange-50/20 text-center flex flex-col items-center gap-6">
                                        <p className="text-sm font-bold text-gray-600 max-w-xs leading-relaxed">
                                            La IA ha detectado una caída en el engagement. Sugerimos una llamada de seguimiento técnico para el proyecto pendiente.
                                        </p>
                                        <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200 hover:scale-105 transition-all active:scale-95">
                                            Reactivar con IA Gemini
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
                                        <CheckCircle size={40} className="text-gray-200" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay acciones críticas pendientes</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'contacts' && (
                        <motion.div
                            key="contacts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {client.contacts.map((contact, i) => (
                                <div key={i} className="glass-card p-8 bg-white border-none shadow-sm group hover:ring-2 ring-green-100 transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900 tracking-tight leading-none">{contact.name || 'Sin Identificar'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{contact.dni ? `DNI: ${contact.dni}` : 'Contacto Corporativo'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-green-700 transition-colors">
                                            <Phone size={16} className="text-gray-300" /> {contact.phone || 'N/A'}
                                        </a>
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-green-700 transition-colors">
                                            <Mail size={16} className="text-gray-300" /> {contact.email || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'sales' && (
                        <motion.div
                            key="sales"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[2px]">ID Cotización</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[2px]">Fecha Emisión</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[2px]">Resumen IA</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[2px]">Estado</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[2px] text-right">Documentos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {client.sales.map((sale, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5 font-black text-gray-900">{sale.ID_COTIZACION}</td>
                                            <td className="px-8 py-5 font-bold text-gray-500">{sale.FECHA_EMISION}</td>
                                            <td className="px-8 py-5 font-medium text-gray-600">{sale.RESUMEN_MARKETING}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sale.ESTADO_PROBABLE === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                    {sale.ESTADO_PROBABLE}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-700 hover:text-white transition-all">
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ClientView;
