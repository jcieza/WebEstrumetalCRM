'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Search, Eye, Filter, Download,
    Trash2, Edit, Printer, CheckCircle, User,
    Calendar, MoreVertical, X, Loader, UserPlus, Info
} from 'lucide-react';
import { InternalGuide, GuideItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const InternalGuidesPage = () => {
    const [guides, setGuides] = useState<InternalGuide[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setGuides([
                {
                    id: 'G-2024-001',
                    customer_name: 'Aceros Industriales SAC',
                    date: '2024-01-20',
                    items: [{ description: 'Vigas H 4"', qty: 10, price: 150 }],
                    delivered_by: 'Mauro Puma',
                    received_by: 'Ing. Carlos Mendez',
                    is_billed: true,
                    total_amount: 1500
                },
                {
                    id: 'G-2024-002',
                    customer_name: 'Constructora del Sur',
                    date: '2024-01-22',
                    items: [{ description: 'Planchas LAC 1/2"', qty: 5, price: 300 }],
                    delivered_by: 'Jose Puma',
                    received_by: 'Ana Paredes',
                    is_billed: false,
                    total_amount: 1500
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredGuides = guides.filter(g =>
        g.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Control de <span className="text-green-700">Guías</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mt-2">Salidas de Material y Entregas a Cliente</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-8 py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-700/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <Plus size={18} /> Nueva Guía Interna
                </button>
            </div>

            {/* Quick Filters & Stats */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Buscador por Cliente o Número de Guía..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-green-50 transition-all font-bold text-sm text-gray-700"
                    />
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    <button className="px-6 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Exportar PDF</button>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-x-auto no-scrollbar bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-gray-400">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">ID / Fecha</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Cliente / Empresa</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Logística</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Estado</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px] text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Consultando Registro Logístico...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredGuides.map((guide) => (
                            <motion.tr
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={guide.id}
                                className="group hover:bg-gray-50/50 transition-all"
                            >
                                <td className="px-8 py-6 rounded-l-[1.5rem] bg-white border-y border-l border-gray-100 group-hover:border-green-100 transition-colors">
                                    <p className="font-black text-gray-900 tracking-tight">{guide.id}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{guide.date}</p>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <p className="font-bold text-gray-700 leading-tight group-hover:text-green-800 transition-colors">{guide.customer_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="text-[10px] text-gray-400 font-medium italic">Empresa Registrada</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Entregado por</p>
                                            <p className="text-xs font-bold text-gray-700">{guide.delivered_by}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${guide.is_billed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {guide.is_billed ? 'Facturado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 rounded-r-[1.5rem] bg-white border-y border-r border-gray-100 group-hover:border-green-100 transition-colors text-right">
                                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-700 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm">
                                        <Printer size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Placeholder (Logic extracted but simplified for initial render) */}
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
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
                        >
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Nueva Guía <span className="text-green-700">Interna</span></h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Módulo Logístico Estratégico</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-rose-600 hover:bg-rose-50 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Operación</label>
                                        <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-green-50 transition-all" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Buscador de Cliente (IA)</label>
                                        <div className="relative group">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input type="text" placeholder="Escriba nombre o RUC..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-green-50 transition-all" />
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <Package size={16} className="text-green-700" />
                                            Ítems del Despacho
                                        </h3>
                                        <button className="text-[10px] font-black text-green-700 uppercase tracking-widest bg-white border border-green-100 px-4 py-2 rounded-xl hover:bg-green-700 hover:text-white transition-all">+ Agregar Ítem</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ingrese los materiales a despachar</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logístico Responsable</label>
                                        <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-green-50 transition-all">
                                            <option>Mauro Puma</option>
                                            <option>Jose Puma</option>
                                            <option>Jose Puma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Receptor (Confirmación)</label>
                                        <input type="text" placeholder="Nombre de quien recibe" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-green-50 transition-all" />
                                    </div>
                                </section>
                            </div>

                            <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Info size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Se generará una guía con ID secuencial</span>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowModal(false)} className="px-8 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Cancelar</button>
                                    <button className="px-12 py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-700/20 hover:scale-105 transition-all">Emitir Guía</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InternalGuidesPage;
