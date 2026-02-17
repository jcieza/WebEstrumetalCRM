'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import {
    Search, Filter, Upload, MapPin, Phone, AlertCircle, CheckCircle, TrendingUp,
    RefreshCw, Smartphone, Target, Users, DollarSign, Mail, Calendar, FileText,
    Download, BarChart3, Zap, Globe, Building2, Star, ArrowRight, Eye, Send,
    PieChart, Briefcase, Award, TrendingDown, Clock, UserPlus, Share2, Camera,
    FileSearch, Info, Plus
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
    const [showPhysicalUpload, setShowPhysicalUpload] = useState(false);
    const [rawSnippet, setRawSnippet] = useState('');
    const [campaigns, setCampaigns] = useState<{ id: string, name: string, leadIds: string[] }[]>([
        { id: 'camp_1', name: 'Campaña General 2024', leadIds: [] }
    ]);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [leadToAddToCampaign, setLeadToAddToCampaign] = useState<string | null>(null);

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

    const handleInvestigate = async (leadId: string, text: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/intelligence/investigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();

            // Simular actualización en Firestore para la UI inmediata
            setRecoveredLeads(prev => prev.map(l => l.id === leadId ? {
                ...l,
                potential_name: data.full_name || l.potential_name,
                detected_ruc: data.ruc || l.detected_ruc,
                category: data.category,
                inquiry_state: data.inquiry_state,
                summary: data.summary
            } : l));

            // Si es un lead nuevo de entrada manual, lo agregamos al inicio
            if (leadId.startsWith('manual_')) {
                setRecoveredLeads(prev => [{
                    id: leadId,
                    potential_name: data.full_name || 'Nuevo Lead Investigado',
                    detected_ruc: data.ruc,
                    category: data.category,
                    inquiry_state: data.inquiry_state,
                    summary: data.summary,
                    outreach_tip: data.outreach_tip,
                    missing_data: data.missing_data,
                    source: 'manual_snippet'
                }, ...prev]);
            }

            alert(`Investigación completada para: ${data.full_name || 'el fragmento ingresado'}`);
        } catch (error) {
            console.error("Investigation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhysicalUpload = async (file: File) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('text', 'Digitalización de documento físico');

            const response = await fetch('/api/intelligence/investigate', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // En un flujo real, crearíamos un nuevo lead en Firestore
            setRecoveredLeads(prev => [{
                id: `new_${Date.now()}`,
                potential_name: data.full_name,
                detected_ruc: data.ruc,
                category: data.category,
                inquiry_state: data.inquiry_state,
                filename: file.name,
                source: 'physical_ingestion'
            }, ...prev]);

            setShowPhysicalUpload(false);
            alert(`Nuevo lead registrado desde físico: ${data.full_name}`);
        } catch (error) {
            console.error("Physical upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCampaign = (campaignId: string) => {
        if (!leadToAddToCampaign) return;
        setCampaigns(prev => prev.map(c =>
            c.id === campaignId
                ? { ...c, leadIds: [...c.leadIds, leadToAddToCampaign] }
                : c
        ));
        setLeadToAddToCampaign(null);
        setShowCampaignModal(false);
        alert('Lead agregado a la campaña correctamente.');
    };

    const handleCreateCampaign = () => {
        if (!newCampaignName.trim()) return;
        const newCampaign = { id: `camp_${Date.now()}`, name: newCampaignName, leadIds: [] };
        setCampaigns(prev => [...prev, newCampaign]);
        setNewCampaignName('');
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
                            Mostrando leads detectados en archivos históricos y documentación física de Estrumetal.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pr-2">
                        <button
                            onClick={() => setShowPhysicalUpload(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-800 text-gray-800 rounded-lg text-[10px] font-black uppercase hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Camera size={14} /> Digitalizar Físico (OCR)
                        </button>
                        <select
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-[10px] font-bold uppercase"
                            onChange={(e) => {
                                const campaign = campaigns.find(c => c.id === e.target.value);
                                if (campaign) {
                                    const campaignLeads = recoveredLeads.filter(l => campaign.leadIds.includes(l.id));
                                    setSelectedLeads(campaignLeads);
                                    if (campaignLeads.length > 0) setShowOutreach(true);
                                    else alert('Esta campaña no tiene leads asignados aún.');
                                }
                            }}
                        >
                            <option value="">Seleccionar Campaña para Outreach...</option>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.leadIds.length})</option>)}
                        </select>
                    </div>

                    {showCampaignModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-in zoom-in duration-200">
                                <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Agregar Lead a Campaña</h3>
                                <div className="flex flex-col gap-2 mb-4">
                                    {campaigns.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleAddToCampaign(c.id)}
                                            className="p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg text-xs font-bold text-gray-700 transition-all border border-gray-100 hover:border-blue-200"
                                        >
                                            {c.name} ({c.leadIds.length} leads)
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nueva Campaña..."
                                        className="flex-1 p-2 text-xs border border-gray-200 rounded-md"
                                        value={newCampaignName}
                                        onChange={(e) => setNewCampaignName(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCreateCampaign}
                                        className="px-3 py-2 bg-gray-800 text-white rounded-md text-[10px] font-black uppercase"
                                    >
                                        Crear
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowCampaignModal(false)}
                                    className="w-full mt-4 p-2 text-xs font-bold text-gray-500 hover:text-gray-800 uppercase"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {showPhysicalUpload && (
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg flex flex-col items-center gap-4 animate-in slide-in-from-top duration-300">
                            <div className="text-center w-full max-w-xl">
                                <h4 className="text-xs font-black text-blue-900 uppercase tracking-tight">Ingesta Agencial (Foto o Texto)</h4>
                                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest mt-1 mb-4">Ciclón de Gemini Vision habilitado para OCR, Investigación y Clasificación</p>

                                <textarea
                                    value={rawSnippet}
                                    onChange={(e) => setRawSnippet(e.target.value)}
                                    placeholder="Pega aquí cualquier dato: 'RUC 20...', 'Empresa Talleres SAC', 'Telf: 998...', o notas al azar."
                                    className="w-full h-24 bg-white border-2 border-blue-100 rounded-lg p-3 text-[10px] font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all mb-4"
                                />

                                <div className="flex gap-2 justify-center">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="physical-upload"
                                        onChange={(e) => e.target.files?.[0] && handlePhysicalUpload(e.target.files[0])}
                                    />
                                    <label htmlFor="physical-upload" className="cursor-pointer px-8 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg text-[10px] font-black uppercase hover:bg-blue-50 shadow-sm flex items-center gap-2">
                                        <Camera size={14} /> Subir Foto
                                    </label>

                                    <button
                                        onClick={() => {
                                            if (rawSnippet) {
                                                handleInvestigate(`manual_${Date.now()}`, rawSnippet);
                                                setRawSnippet('');
                                                setShowPhysicalUpload(false);
                                            }
                                        }}
                                        disabled={!rawSnippet || loading}
                                        className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 shadow-md disabled:bg-blue-300 flex items-center gap-2"
                                    >
                                        <Zap size={14} /> Procesar Texto
                                    </button>

                                    <button onClick={() => setShowPhysicalUpload(false)} className="px-4 py-2 text-[10px] font-black uppercase text-blue-500">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            <div className="flex items-center gap-2 mt-1">
                                                {lead.inquiry_state === 'FALTA_INFO' ? (
                                                    <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                                                        <Info size={10} /> Falta Info
                                                    </span>
                                                ) : lead.inquiry_state === 'ENRIQUECIDO' ? (
                                                    <span className="text-[8px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                                                        <CheckCircle size={10} /> Enriquecido
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                                                        <Clock size={10} /> Sin Indagar
                                                    </span>
                                                )}
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
                                                <button
                                                    onClick={() => handleInvestigate(lead.id, lead.potential_name || lead.filename)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-800 text-white rounded text-[9px] font-black uppercase hover:bg-green-900 transition-all shadow-sm"
                                                >
                                                    <Zap size={12} /> Enriquecer
                                                </button>
                                                {lead.summary && (
                                                    <button
                                                        onClick={() => alert(`RESUMEN ESTRATÉGICO:\n${lead.summary}\n\nTIP DE CONTACTO:\n${lead.outreach_tip}`)}
                                                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-all tooltip"
                                                        title="Ver Análisis IA"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-md transition-all">
                                                    <ArrowRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setLeadToAddToCampaign(lead.id);
                                                        setShowCampaignModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-md transition-all tooltip"
                                                    title="Agregar a Campaña"
                                                >
                                                    <Plus size={16} />
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
