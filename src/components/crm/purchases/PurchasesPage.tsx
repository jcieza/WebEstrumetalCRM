'use client';

import React, { useState } from 'react';
import {
    ShoppingCart, Plus, Search, Filter, FilterIcon,
    Download, FileText, CheckCircle, Clock, AlertCircle,
    ArrowUpRight, DollarSign, Package, Truck, ArrowRight, Eye
} from 'lucide-react';

const PurchaseCard = ({ label, value, color, icon: Icon }: any) => (
    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm flex items-center justify-between">
        <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${color.replace('text', 'text-opacity-20')}`}>
            <Icon size={24} />
        </div>
    </div>
);

const PurchasesPage = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <ShoppingCart size={28} className="text-green-800" /> Gestión de Compras
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Control de suministros, órdenes de compra y logística de entrada</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md">
                    <Plus size={16} /> Nueva Orden de Compra
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PurchaseCard label="O.C. Pendientes" value="12" color="text-orange-600" icon={Clock} />
                <PurchaseCard label="Llegando Hoy" value="03" color="text-blue-600" icon={Truck} />
                <PurchaseCard label="Presupuesto Mes" value="S/ 45,200" color="text-green-800" icon={DollarSign} />
                <PurchaseCard label="Stock Crítico" value="08" color="text-red-600" icon={AlertCircle} />
            </div>

            {/* Table Area */}
            <div className="flex flex-col gap-4">
                <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="BUSCAR O.C. O PROVEEDOR..."
                                className="pl-9 p-2 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold uppercase outline-none focus:border-green-800 w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black uppercase text-gray-500 hover:bg-gray-100 transition-all">
                            <Filter size={14} /> Filtros
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-left border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Código OC</th>
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Proveedor</th>
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Material</th>
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</th>
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Estado</th>
                                <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { id: 'OC-2024-089', provider: 'ACEROS AREQUIPA', material: 'PLANCHA 3mm LAC (20 UN)', total: 'S/ 5,400.00', status: 'PENDIENTE' },
                                { id: 'OC-2024-088', provider: 'SODIMAC PERÚ', material: 'ELECTRODOS 6011 (10 CAJAS)', total: 'S/ 1,200.00', status: 'RECIBIDO' },
                                { id: 'OC-2024-087', provider: 'MAESTRO', material: 'PINTURA EPOXICA (5 GAL)', total: 'S/ 850.00', status: 'EN CAMINO' },
                            ].map((oc, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-[11px] font-black text-gray-800 uppercase tracking-tight font-mono">{oc.id}</td>
                                    <td className="p-4 text-[11px] font-bold text-gray-600 uppercase tracking-tighter">{oc.provider}</td>
                                    <td className="p-4 text-[11px] font-medium text-gray-500 uppercase tracking-tight">{oc.material}</td>
                                    <td className="p-4 text-[11px] font-black text-gray-800">{oc.total}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-md tracking-widest ${oc.status === 'RECIBIDO' ? 'bg-green-50 text-green-700' :
                                            oc.status === 'PENDIENTE' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {oc.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center">
                                            <button className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-md transition-all"><Eye size={16} /></button>
                                            <button className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-md transition-all"><FileText size={16} /></button>
                                            <div className="w-8 h-8 rounded-md bg-green-800 text-white flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm cursor-pointer">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchasesPage;
