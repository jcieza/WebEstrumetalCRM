'use client';

import React, { useState } from 'react';
import { Plus, History, Sparkles, LayoutGrid, List, Package, Printer } from 'lucide-react';
import ProductionBoard from './ProductionBoard';
import { ProductionOrder } from './types';

const ProductionPage = () => {
    const [view, setView] = useState<'board' | 'history'>('board');
    const [viewMode, setViewMode] = useState<'board' | 'list' | 'packing'>('board');
    const [isPrintOpen, setIsPrintOpen] = useState(false);

    const handleEditOrder = (order: ProductionOrder) => {
        alert(`🚧 Edit Panel for ${order.id} coming soon...`);
    };

    return (
        <div className="h-full flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Producción <span className="text-green-700">&</span> Despacho</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest">Gestión Operativa de Plantas Estrumetal</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm h-12 items-center">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'board' ? 'bg-green-50 text-green-700 shadow-sm scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                            title="Vista Tablero"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-green-50 text-green-700 shadow-sm scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                            title="Vista Lista"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('packing')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'packing' ? 'bg-green-50 text-green-700 shadow-sm scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                            title="Vista Packing"
                        >
                            <Package size={20} />
                        </button>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-gray-100 mx-2" />

                    {/* Tools Group */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPrintOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl transition-all border border-gray-100 shadow-sm font-bold text-[10px] uppercase tracking-widest h-12"
                        >
                            <Printer size={18} className="text-gray-400" />
                            Imprimir
                        </button>
                        <button
                            onClick={() => setView(view === 'board' ? 'history' : 'board')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl transition-all border border-gray-100 shadow-sm font-bold text-[10px] uppercase tracking-widest h-12"
                        >
                            <History size={18} className="text-gray-400" />
                            {view === 'board' ? 'Historial' : 'Tablero'}
                        </button>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex gap-3 ml-auto xl:ml-0">
                        <button
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl transition-all font-black text-[10px] uppercase tracking-[1px] h-12"
                        >
                            <Sparkles size={18} />
                            IA Import
                        </button>
                        <button
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-2xl shadow-xl shadow-green-200 hover:shadow-2xl transition-all font-black text-[10px] uppercase tracking-[1px] h-12"
                        >
                            <Plus size={18} />
                            Nueva OP
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {view === 'history' ? (
                    <div className="glass-card p-20 text-center border-none bg-white">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                            <History size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Historial de Producción</h3>
                        <p className="text-sm text-gray-500 mt-2">Próximamente: Consulta todas tus órdenes entregadas.</p>
                    </div>
                ) : (
                    viewMode === 'board' ? <ProductionBoard onEdit={handleEditOrder} /> :
                        <div className="glass-card p-20 text-center border-none bg-white">
                            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Vista {viewMode.toUpperCase()} en proceso</h3>
                            <p className="text-sm text-gray-500 mt-2">Estamos optimizando la renderización de grandes volúmenes de datos.</p>
                        </div>
                )}
            </div>
        </div>
    );
};

export default ProductionPage;
