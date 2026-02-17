'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import {
    Search, Filter, Upload, MapPin, Phone, AlertCircle, CheckCircle, TrendingUp,
    RefreshCw, Smartphone, Target, Users, DollarSign, Mail, Calendar, FileText,
    Download, BarChart3, Zap, Globe, Building2, Star, ArrowRight, Eye, Send,
    PieChart, Briefcase, Award, TrendingDown, Clock, UserPlus, Share2
} from 'lucide-react';
import WhatsAppOutreach from './WhatsAppOutreach';

const IntelligenceCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon size={24} style={{ color }} />
        </div>
        <div>
            <div className="text-2xl font-black text-gray-800 tracking-tight">{value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
        </div>
    </div>
);

const MarketIntelligencePage = () => {
    const [activeTab, setActiveTab] = useState('leads');
    const [recoveredLeads, setRecoveredLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showOutreach, setShowOutreach] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'recovery') {
            fetchRecoveredLeads();
        }
    }, [activeTab]);

    const fetchRecoveredLeads = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'recovered_leads'),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            const leads = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecoveredLeads(leads);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'leads', label: 'Leads B2B (Scraping)', icon: Building2 },
        { id: 'prospector', label: 'Prospector IA', icon: Zap },
        { id: 'recovery', label: 'Reactivación', icon: TrendingUp },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <Target size={28} className="text-green-800" /> Inteligencia Comercial
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Centro de prospección B2B y reactivación estratégica</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all">
                        <RefreshCw size={14} /> Sincronizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md">
                        <Download size={14} /> Exportar
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <IntelligenceCard label="Leads B2B" value="1,248" icon={Building2} color="#42A5F5" />
                <IntelligenceCard label="Alto Potencial" value="42" icon={Star} color="#66BB6A" />
                <IntelligenceCard label="A Revivir" value="18" icon={TrendingUp} color="#EF5350" />
                <IntelligenceCard label="Frecuentes" value="86" icon={Award} color="#AB47BC" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 mb-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-green-800 text-green-800 bg-green-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === 'leads' && (
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="BUSCAR EMPRESA EN EL DATASET..."
                                className="w-100 p-2.5 pl-10 bg-gray-50 border border-gray-100 rounded-md text-[11px] font-bold uppercase outline-none focus:border-green-800 transition-all"
                            />
                        </div>
                        <button className="px-6 py-2 bg-gray-800 text-white rounded-md text-[10px] font-black uppercase shadow-sm">Filtrar</button>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left border-b border-gray-100">
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Empresa</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoría</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Score</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Acción Recomendada</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: 'CONSTRUCTORA ALPHA SAC', category: 'INDUSTRIAL', score: 4.8, action: 'Enviar Brochure Plantas Industriales' },
                                    { name: 'METAL MECÁNICA LÓPEZ', category: 'LOGÍSTICA', score: 3.5, action: 'Llamada de Prospección' },
                                    { name: 'ALMACENES DEL PERÚ', category: 'INDUSTRIAL', score: 4.2, action: 'Visita Técnica a Planta' },
                                ].map((lead, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{lead.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5"><MapPin size={10} /> Lima, Perú</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md tracking-tighter">{lead.category}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-[11px] font-black text-green-800">{lead.score} / 5</span>
                                        </td>
                                        <td className="p-4 text-[11px] font-bold text-gray-600 uppercase tracking-tight italic">
                                            {lead.action}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-all"><Eye size={16} /></button>
                                                <button className="p-1.5 hover:bg-green-50 text-green-600 rounded-md transition-all"><Smartphone size={16} /></button>
                                                <button className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-md transition-all"><UserPlus size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'prospector' && (
                <div className="bg-white border border-gray-100 rounded-lg p-10 shadow-sm flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-800 shadow-inner">
                        <Zap size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Prospector IA Gemini 1.5</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2 max-w-md">Buscador inteligente con Grounding de Google para encontrar empresas RUC 20 en distritos específicos.</p>
                    </div>
                    <div className="flex gap-2 w-full max-w-lg mt-4">
                        <input
                            type="text"
                            placeholder="EJ: VILLA EL SALVADOR, LURÍN, ATE..."
                            className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-black uppercase outline-none focus:border-green-800 transition-all shadow-inner"
                        />
                        <button className="px-8 py-3 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md flex items-center gap-2">
                            <Search size={14} /> Prospectar
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'recovery' && (
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp size={18} className="text-red-600" /> Reactivación de Leads (Arqueología)
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Mostrando leads detectados en archivos históricos de Estrumetal.
                        </p>
                    </div>

                    <div className="flex justify-end pr-2">
                        <button
                            onClick={() => {
                                setSelectedLeads(recoveredLeads.slice(0, 10)); // Demo: primeros 10
                                setShowOutreach(true);
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md"
                        >
                            <Share2 size={14} /> Iniciar Campaña WhatsApp
                        </button>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left border-b border-gray-100">
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lead Detectado</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Identificador</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Fuente (Archivo)</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-xs font-bold text-gray-400 uppercase animate-pulse">Cargando cementerio de datos...</td>
                                    </tr>
                                ) : recoveredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-xs font-bold text-gray-400 uppercase">No se encontraron leads para reactivar.</td>
                                    </tr>
                                ) : recoveredLeads.map((lead, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="text-[11px] font-black text-gray-800 uppercase tracking-tight">
                                                {lead.potential_name || 'SIN NOMBRE'}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                <AlertCircle size={10} className="text-amber-500" /> Pendiente de Enriquecimiento
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                {lead.detected_ruc && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded w-fit">RUC: {lead.detected_ruc}</span>
                                                )}
                                                {lead.detected_phone && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded w-fit"><Phone size={8} className="inline mr-1" /> {lead.detected_phone}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-[200px] truncate">
                                            <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                                <FileText size={12} /> {lead.filename}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-800 text-white rounded text-[9px] font-black uppercase hover:bg-green-900 transition-all shadow-sm">
                                                    <Zap size={12} /> Enriquecer
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-md transition-all">
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showOutreach && (
                <WhatsAppOutreach
                    leads={selectedLeads.length > 0 ? selectedLeads : recoveredLeads.slice(0, 10)}
                    onClose={() => setShowOutreach(false)}
                />
            )}
        </div>
    );
};

export default MarketIntelligencePage;
