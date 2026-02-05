'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';

interface DashboardProps {
    onNavigate: (tab: string, clientId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        closingProb: '0%',
        pipeline: 'S/ 0',
        lowStock: 0,
        urgentOps: 0
    });

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch production orders for urgent count
            const resProd = await fetch('/api/production');
            const orders = await resProd.json();
            const urgent = orders.filter((o: any) => o.priority === 'ALTA' && o.status !== 'ENTREGADO').length;

            // Fetch quotations for pipeline
            const resQuot = await fetch('/api/quotations');
            const quots = await resQuot.json();
            const totalPipeline = quots
                .filter((q: any) => q.status === 'PENDIENTE' || q.status === 'EN SEGUIMIENTO')
                .reduce((acc: number, q: any) => acc + (q.totalAmount || 0), 0);

            // Average probability (demo logic or derived)
            const prob = quots.length > 0 ? '75%' : '0%';

            // Fetch inventory for low stock
            const resInv = await fetch('/api/inventory');
            const items = await resInv.json();
            const low = items.filter((i: any) => i.stock < (i.min_stock || 10)).length;

            setStats({
                closingProb: prob,
                pipeline: `S/ ${(totalPipeline / 1000).toFixed(0)}k`,
                lowStock: low,
                urgentOps: urgent
            });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    const fetchClients = async (search = '') => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            const clientsData = await res.json();
            setClients(clientsData.slice(0, 10)); // Top 10 for dashboard
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Implement debounced search here
    };

    const KPICard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-white p-6 flex flex-col gap-2 transition-all border border-gray-100 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</span>
                <div className="p-2 rounded-md" style={{ backgroundColor: `${color}10`, color: color }}>
                    <Icon size={18} />
                </div>
            </div>
            <div className="text-2xl font-black text-gray-800 tracking-tight">{value}</div>
            <div className="text-[10px] text-gray-400 font-medium">ESTADÍSTICA DE PLANTA</div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-black tracking-tight text-gray-800 uppercase">Dashboard Central</h1>
                <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium opacity-70">Operaciones Estrumetal</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Prob. Cierre" value={stats.closingProb} icon={TrendingUp} color="#10b981" />
                <KPICard title="Pipeline" value={stats.pipeline} icon={DollarSign} color="#3b82f6" />
                <KPICard title="Alertas Stock" value={stats.lowStock} icon={AlertTriangle} color="#f97316" />
                <KPICard title="Urgencias OPs" value={stats.urgentOps} icon={Clock} color="#6366f1" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Search */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">Administración de Clientes</h3>
                        <button onClick={() => onNavigate('clients')} className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-bold hover:bg-gray-200 transition-colors uppercase tracking-tighter">Explorar Base Completa</button>
                    </div>

                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="FILTRAR POR RAZÓN SOCIAL O RUC..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-3 rounded-md border border-gray-200 bg-gray-50/50 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-xs font-bold tracking-tight"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-[9px] uppercase tracking-widest border-b border-gray-100">
                                    <th className="pb-3 font-bold">Razón Social</th>
                                    <th className="pb-3 font-bold">Identificación (RUC)</th>
                                    <th className="pb-3 font-bold text-right">Análisis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={3} className="py-8 text-center text-[10px] font-bold text-gray-300 uppercase italic">Conectando con base de datos central...</td></tr>
                                ) : clients.map(client => (
                                    <tr key={client.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-bold text-xs text-gray-700">{client.name}</td>
                                        <td className="py-4 text-xs text-gray-500 font-mono tracking-tighter">{client.ruc || 'S/I'}</td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => onNavigate('clients', client.id)}
                                                className="px-4 py-1.5 rounded-md bg-green-800 text-white text-[9px] font-black uppercase tracking-tighter hover:bg-green-900 transition-all shadow-sm"
                                            >
                                                Visión 360°
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* mini Chart */}
                <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-6 border-b border-gray-50 pb-4">Proyección de Ingresos</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Ene', v: 4000 },
                                { name: 'Feb', v: 3000 },
                                { name: 'Mar', v: 2000 },
                                { name: 'Abr', v: 2780 },
                                { name: 'May', v: 1890 },
                                { name: 'Jun', v: 2390 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f9fafb' }}
                                />
                                <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                            💡 <span className="font-bold">Análisis IA:</span> Las ventas de Junio muestran un crecimiento consolidado del 15% respecto al promedio trimestral.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
