'use client';

import React, { useState, useEffect } from 'react';
import {
    Mail, Factory, Package, Users, AlertTriangle, Clock,
    ArrowRight, Inbox, ChevronRight, BarChart3, Globe,
    MessageSquare, Settings as SettingsIcon
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';

interface DashboardProps {
    onNavigate: (tab: string, clientId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        unreadEmails: 0,
        urgentOps: 0,
        lowStock: 0,
        totalClients: 0,
    });
    const [recentEmails, setRecentEmails] = useState<any[]>([]);
    const [recentOps, setRecentOps] = useState<any[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStats(),
                fetchRecentEmails(),
                fetchRecentOps(),
            ]);
        } catch (e) {
            console.error('Dashboard error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Correos sin leer
            const emailsQ = query(
                collection(db, 'incoming_messages'),
                where('status', '==', 'NEW')
            );
            const emailSnap = await getCountFromServer(emailsQ);
            const unread = emailSnap.data().count;

            // OPs urgentes
            let urgent = 0;
            try {
                const resProd = await fetch('/api/production');
                const orders = await resProd.json();
                urgent = Array.isArray(orders)
                    ? orders.filter((o: any) => o.priority === 'ALTA' && o.status !== 'ENTREGADO').length
                    : 0;
            } catch { /* API might not exist yet */ }

            // Stock bajo mínimo
            let low = 0;
            try {
                const resInv = await fetch('/api/inventory');
                const items = await resInv.json();
                low = Array.isArray(items)
                    ? items.filter((i: any) => i.stock < (i.min_stock || 10)).length
                    : 0;
            } catch { /* API might not exist yet */ }

            // Total clientes
            const clientsSnap = await getCountFromServer(collection(db, 'clients'));
            const totalClients = clientsSnap.data().count;

            setStats({ unreadEmails: unread, urgentOps: urgent, lowStock: low, totalClients });
        } catch (e) {
            console.error('Stats error:', e);
        }
    };

    const fetchRecentEmails = async () => {
        try {
            const q = query(
                collection(db, 'incoming_messages'),
                orderBy('receivedAt', 'desc'),
                limit(5)
            );
            const snap = await getDocs(q);
            setRecentEmails(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error('Recent emails error:', e);
        }
    };

    const fetchRecentOps = async () => {
        try {
            const res = await fetch('/api/production');
            const orders = await res.json();
            if (Array.isArray(orders)) {
                setRecentOps(orders.slice(0, 3));
            }
        } catch { /* Production API might fail */ }
    };

    const quickLinks = [
        { id: 'emails', label: 'Centro de Correos', icon: Mail, color: '#10B981', desc: 'Bandeja de entrada' },
        { id: 'production', label: 'Producción (OP)', icon: Factory, color: '#6366F1', desc: 'Tablero de órdenes' },
        { id: 'inventory', label: 'Inventario', icon: Package, color: '#F97316', desc: 'Control de stock' },
        { id: 'clients', label: 'Clientes 360', icon: Users, color: '#8B5CF6', desc: 'Base de contactos' },
        { id: 'market-intelligence', label: 'Intel. Comercial', icon: Globe, color: '#0EA5E9', desc: 'Investigación de mercado' },
        { id: 'cost-structure', label: 'Estructura Costos', icon: BarChart3, color: '#1A1D21', desc: 'Análisis de costos' },
        { id: 'messages', label: 'WhatsApp CRM', icon: MessageSquare, color: '#22C55E', desc: 'Mensajería directa' },
        { id: 'settings', label: 'Configuración', icon: SettingsIcon, color: '#64748B', desc: 'Ajustes del sistema' },
    ];

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 60) return `hace ${diffMin}m`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `hace ${diffH}h`;
        const diffD = Math.floor(diffH / 24);
        return `hace ${diffD}d`;
    };

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-black tracking-tight text-gray-800 uppercase">Dashboard Central</h1>
                <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium opacity-70">Operaciones Estrumetal</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => onNavigate('emails')} className="bg-white p-5 flex flex-col gap-2 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Correos sin leer</span>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <Inbox size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 tracking-tight">{loading ? '...' : stats.unreadEmails}</div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">Bandeja de entrada <ArrowRight size={10} /></div>
                </button>

                <button onClick={() => onNavigate('production')} className="bg-white p-5 flex flex-col gap-2 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">OPs urgentes</span>
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 tracking-tight">{loading ? '...' : stats.urgentOps}</div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">Prioridad alta <ArrowRight size={10} /></div>
                </button>

                <button onClick={() => onNavigate('inventory')} className="bg-white p-5 flex flex-col gap-2 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left group">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Alertas stock</span>
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 tracking-tight">{loading ? '...' : stats.lowStock}</div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">Bajo mínimo <ArrowRight size={10} /></div>
                </button>

                <button onClick={() => onNavigate('clients')} className="bg-white p-5 flex flex-col gap-2 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all text-left group">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total clientes</span>
                        <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 tracking-tight">{loading ? '...' : stats.totalClients}</div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">Base de datos <ArrowRight size={10} /></div>
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actividad Reciente */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Ultimos Correos */}
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                <Mail size={16} className="text-emerald-600" /> Últimos correos
                            </h3>
                            <button onClick={() => onNavigate('emails')} className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-bold hover:bg-gray-200 transition-colors uppercase tracking-tighter">
                                Ver todos
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <p className="py-8 text-center text-[10px] font-bold text-gray-300 uppercase italic">Cargando actividad...</p>
                            ) : recentEmails.length === 0 ? (
                                <p className="py-8 text-center text-[10px] font-bold text-gray-300 uppercase italic">No hay correos recientes</p>
                            ) : recentEmails.map(email => (
                                <div key={email.id} className="py-3 flex items-center gap-3 group">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${email.status === 'NEW' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs truncate ${email.status === 'NEW' ? 'font-bold text-gray-800' : 'font-medium text-gray-500'}`}>
                                            {email.subject || '(Sin asunto)'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 truncate">
                                            {email.from?.split('<')[0]?.trim() || email.from}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{formatTime(email.receivedAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ultimas OPs */}
                    {recentOps.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                    <Factory size={16} className="text-indigo-600" /> Órdenes de Producción
                                </h3>
                                <button onClick={() => onNavigate('production')} className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-bold hover:bg-gray-200 transition-colors uppercase tracking-tighter">
                                    Ver tablero
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {recentOps.map((op: any) => (
                                    <div key={op.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${op.priority === 'ALTA' ? 'bg-red-500' : op.priority === 'MEDIA' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                            <div>
                                                <p className="text-xs font-bold text-gray-700">{op.product || op.id}</p>
                                                <p className="text-[10px] text-gray-400">{op.client || 'Sin cliente'} -- {op.quantity || 0} uds</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${op.status === 'ENTREGADO' ? 'bg-green-50 text-green-700' :
                                                op.status === 'EN PRODUCCION' ? 'bg-blue-50 text-blue-700' :
                                                    op.status === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-gray-50 text-gray-500'
                                            }`}>{op.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Accesos Rápidos */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-5 border-b border-gray-50 pb-4">Módulos</h3>
                    <div className="flex flex-col gap-1.5">
                        {quickLinks.map(link => {
                            const Icon = link.icon;
                            const badge = link.id === 'emails' ? stats.unreadEmails :
                                link.id === 'production' ? stats.urgentOps :
                                    link.id === 'inventory' ? stats.lowStock : 0;
                            return (
                                <button
                                    key={link.id}
                                    onClick={() => onNavigate(link.id)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group text-left w-full"
                                >
                                    <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: `${link.color}10`, color: link.color }}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{link.label}</p>
                                        <p className="text-[10px] text-gray-400">{link.desc}</p>
                                    </div>
                                    {badge > 0 && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
                                            {badge}
                                        </span>
                                    )}
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
