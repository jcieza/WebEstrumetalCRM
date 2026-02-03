'use client';

import React, { useState, useEffect } from 'react';
import {
    Wallet, Plus, Search, Filter, Download, Trash2,
    TrendingUp, TrendingDown, Landmark, Calendar,
    ArrowUpCircle, ArrowDownCircle, Users, Eye, X,
    ChevronDown, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CashReceiptsPage = () => {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState<'ALL' | 'INGRESO' | 'EGRESO'>('ALL');

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setReceipts([
                { id: 'R-001', date: '2024-02-01', type: 'INGRESO', concept: 'Pago Cotización COT-2024-001', entity: 'SHOPSMART SAC', amount: 1500, handled_by: 'Administración' },
                { id: 'R-002', date: '2024-02-02', type: 'EGRESO', concept: 'Compra de Insumos Soldadura', entity: 'Ferretería Central', amount: 450, handled_by: 'Mauro Puma' },
                { id: 'R-003', date: '2024-02-03', type: 'INGRESO', concept: 'Adelanto Proyecto Estructuras', entity: 'Constructora del Sur', amount: 5000, handled_by: 'Administración' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const stats = {
        income: receipts.filter(r => r.type === 'INGRESO').reduce((sum, r) => sum + r.amount, 0),
        expenses: receipts.filter(r => r.type === 'EGRESO').reduce((sum, r) => sum + r.amount, 0),
    };

    const filteredReceipts = receipts.filter(r => {
        const matchesSearch = r.entity.toLowerCase().includes(searchTerm.toLowerCase()) || r.concept.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || r.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Caja <span className="text-green-700">Administrativa</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mt-2">Control Financiero de Ingresos y Egresos</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-8 py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-700/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <Plus size={18} /> Nuevo Movimiento
                </button>
            </div>

            {/* Financial Dashboard Mini */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Ingresos Totales', value: `S/ ${stats.income.toLocaleString()}`, icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Egresos Totales', value: `S/ ${stats.expenses.toLocaleString()}`, icon: ArrowDownCircle, color: 'text-rose-600', bg: 'bg-rose-50/50' },
                    { label: 'Balance Actual', value: `S/ ${(stats.income - stats.expenses).toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 bg-white border-none shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
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
                        placeholder="Buscar por concepto, cliente o personal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-green-50 transition-all font-bold text-sm text-gray-700"
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto no-scrollbar w-full xl:w-auto">
                    {(['ALL', 'INGRESO', 'EGRESO'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === t ? 'bg-green-700 text-white shadow-lg shadow-green-700/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t === 'ALL' ? 'Todos' : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-x-auto no-scrollbar bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Fecha / Movimiento</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Concepto Estratégico</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Entidad Relacionada</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Monto</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px] text-right">Gestión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Analizando Flujo de Caja...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredReceipts.map((r) => (
                            <motion.tr
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={r.id}
                                className="group hover:bg-gray-50/50 transition-all"
                            >
                                <td className="px-8 py-6 rounded-l-[1.5rem] bg-white border-y border-l border-gray-100 group-hover:border-green-100 transition-colors">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{r.date}</p>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${r.type === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {r.type}
                                    </span>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <p className="font-bold text-gray-700 group-hover:text-green-800 transition-colors max-w-xs truncate">{r.concept}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Ref ID: {r.id}</p>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Landmark size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-600">{r.entity}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <p className={`text-md font-black ${r.type === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {r.type === 'INGRESO' ? '+' : '-'} S/ {r.amount.toLocaleString()}
                                    </p>
                                </td>
                                <td className="px-8 py-6 rounded-r-[1.5rem] bg-white border-y border-r border-gray-100 group-hover:border-green-100 transition-colors text-right">
                                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-700 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - Simplified Industrial Form */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Registrar <span className="text-green-700">Movimiento</span></h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Caja Administrativa Central</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white text-gray-400 rounded-2xl hover:text-rose-600 shadow-sm transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form className="p-10 space-y-8">
                                <div className="flex gap-4 p-1.5 bg-gray-100 rounded-2xl">
                                    <button type="button" className="flex-1 py-4 bg-white text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm">Ingreso</button>
                                    <button type="button" className="flex-1 py-4 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest hover:text-rose-600 transition-all">Egreso</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Registro</label>
                                        <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto (S/)</label>
                                        <input type="number" placeholder="0.00" className="w-full bg-gray-100 border border-gray-100 rounded-2xl p-4 font-black text-gray-700 outline-none text-xl" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Concepto del Movimiento</label>
                                    <textarea rows={2} placeholder="Detalle la operación administrativa..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-green-50" />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-700/20 hover:scale-[1.02] transition-all">Registrar Operación</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CashReceiptsPage;
