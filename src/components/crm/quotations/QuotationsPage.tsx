'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Filter, Download, Eye, Edit,
    Send, CheckCircle, Clock, XCircle, ArrowRight,
    MoreVertical, DollarSign, Calendar, TrendingUp
} from 'lucide-react';
import { Quotation, QuotationStatus } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const QuotationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<QuotationStatus | 'all'>('all');
    const [quotations, setQuotations] = useState<Quotation[]>([]);

    useEffect(() => {
        // Mock data
        setQuotations([
            { id: 'COT-2024-001', client: 'SHOPSMART SAC', date: '2024-01-15', total: 15000, status: 'APROBADA', itemsCount: 3 },
            { id: 'COT-2024-002', client: 'TEXTILES PERÚ', date: '2024-02-12', total: 8500, status: 'ENVIADA', itemsCount: 2 },
            { id: 'COT-2024-003', client: 'INDUMETÁLICA', date: '2024-02-13', total: 22000, status: 'BORRADOR', itemsCount: 5 },
            { id: 'COT-2024-004', client: 'FERRETERÍA CENTRAL', date: '2024-01-08', total: 5200, status: 'RECHAZADA', itemsCount: 1 },
            { id: 'COT-2024-005', client: 'CONSTRUCTORA ABC', date: '2024-02-14', total: 45000, status: 'ENVIADA', itemsCount: 8 },
        ]);
    }, []);

    const getStatusConfig = (status: QuotationStatus) => {
        switch (status) {
            case 'APROBADA': return { bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle };
            case 'ENVIADA': return { bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-100', icon: Send };
            case 'BORRADOR': return { bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-100', icon: Clock };
            case 'RECHAZADA': return { bg: 'bg-rose-50', color: 'text-rose-700', border: 'border-rose-100', icon: XCircle };
        }
    };

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = q.client.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || q.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: quotations.length,
        approved: quotations.filter(q => q.status === 'APROBADA').length,
        pending: quotations.filter(q => q.status === 'ENVIADA').length,
        value: quotations.reduce((sum, q) => sum + q.total, 0)
    };

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Gestión de <span className="text-green-700">Cotizaciones</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mt-2">Propuestas Comerciales y Seguimiento Estratégico</p>
                </div>
                <button className="px-8 py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-700/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Plus size={18} /> Nueva Propuesta
                </button>
            </div>

            {/* KPI Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Propuestas', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                    { label: 'Aprobaciones', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'En Seguimiento', value: stats.pending, icon: Send, color: 'text-orange-600', bg: 'bg-orange-50/50' },
                    { label: 'Pipeline Total', value: `S/ ${stats.value.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                ].map((kpi, i) => (
                    <div key={i} className="glass-card p-6 bg-white border-none shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                            <kpi.icon size={24} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900 leading-tight">{kpi.value}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full xl:w-auto">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, N° de cotización o resumen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-green-50 transition-all font-bold text-sm text-gray-700"
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto no-scrollbar w-full xl:w-auto">
                    {(['all', 'BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-green-700 text-white shadow-lg shadow-green-700/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            {f === 'all' ? 'Todas' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-x-auto no-scrollbar bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">ID Propuesta</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Cliente / Empresa</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Fecha</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Monto Total</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Estado</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px] text-right">Gestión</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredQuotations.map((q) => {
                                const status = getStatusConfig(q.status);
                                return (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        key={q.id}
                                        className="group hover:bg-gray-50/50 transition-all"
                                    >
                                        <td className="px-8 py-6 rounded-l-[1.5rem] bg-white border-y border-l border-gray-100 group-hover:border-green-100 transition-colors">
                                            <p className="font-black text-gray-900 tracking-tight">{q.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Industrial Plan</p>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <p className="font-bold text-gray-700 group-hover:text-green-800 transition-colors">{q.client}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Sede Central</p>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
                                                <Calendar size={14} className="text-gray-300" />
                                                {q.date}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <p className="text-md font-black text-gray-900">S/ {q.total.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{q.itemsCount} materiales cotizados</p>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border} shadow-sm flex items-center gap-2 w-fit`}>
                                                <status.icon size={12} />
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 rounded-r-[1.5rem] bg-white border-y border-r border-gray-100 group-hover:border-green-100 transition-colors text-right">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <button className="p-3 text-gray-400 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-3 text-gray-400 bg-gray-50 rounded-xl hover:bg-green-700 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                                                    <ArrowRight size={18} />
                                                </button>
                                                <button className="p-3 text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-900 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotationsPage;
