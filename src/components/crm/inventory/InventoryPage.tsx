'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Map, List, Download, AlertTriangle, TrendingUp, BarChart3, Zap } from 'lucide-react';
import InventoryTable from './InventoryTable';
import { InventoryItem, InventoryView } from './types';

const InventoryPage = () => {
    const [view, setView] = useState<InventoryView>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for demonstration
        setItems([
            {
                id: '1',
                code: 'MAT-2636',
                name: "Juego de 5 discos de lija WING'S WW2115",
                category: 'Consumibles',
                stock: 12,
                unit: 'juegos',
                unit_price: 25,
                condition: 'NUEVO',
                purpose: 'ALMACENAR',
                storage_years: 0,
                warehouse_area: 'Planta 2',
                warehouse_level: 2,
                location_id: 'EST-A1',
                image_path: '',
                observations: 'Reponer pronto',
                low_stock: true
            },
            {
                id: '2',
                code: 'MAT-1050',
                name: 'Tubo Cuadrado 2" x 2" x 2mm',
                category: 'Acero',
                stock: 150,
                unit: 'metros',
                unit_price: 15.5,
                condition: 'NUEVO',
                purpose: 'ALMACENAR',
                storage_years: 0,
                warehouse_area: 'Planta 1',
                warehouse_level: 1,
                location_id: 'ZONA-A',
                image_path: '',
                observations: '',
                low_stock: false
            }
        ]);
        setLoading(false);
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: items.length,
        lowStock: items.filter(i => i.low_stock).length,
        value: items.reduce((sum, i) => sum + (i.stock * i.unit_price), 0),
        categories: new Set(items.map(i => i.category)).size
    };

    return (
        <div className="h-full flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Control de <span className="text-green-700">Inventario</span></h1>
                    <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest text-xs">Gestión Centralizada de Materiales Industrial</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm h-12 items-center">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-green-50 text-green-700 shadow-sm scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={`p-2 rounded-xl transition-all ${view === 'map' ? 'bg-green-50 text-green-700 shadow-sm scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            <Map size={20} />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl transition-all border border-gray-100 shadow-sm font-bold text-[10px] uppercase tracking-widest h-12">
                            <Download size={18} className="text-gray-400" />
                            Importar
                        </button>
                    </div>

                    <div className="flex gap-3 ml-auto xl:ml-0">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl shadow-orange-100 hover:shadow-2xl transition-all font-black text-[10px] uppercase tracking-[1px] h-12">
                            <Zap size={18} />
                            Entrada Veloz
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-2xl shadow-xl shadow-green-200 hover:shadow-2xl transition-all font-black text-[10px] uppercase tracking-[1px] h-12">
                            <Plus size={18} />
                            Nuevo Material
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Artículos Unicos', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Alertas Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', alert: stats.lowStock > 0 },
                    { label: 'Valorización', value: `S/ ${stats.value.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Categorías', value: stats.categories, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((kpi, i) => (
                    <div key={i} className={`glass-card p-6 bg-white border-none shadow-sm flex items-center gap-4 ${kpi.alert ? 'ring-2 ring-red-100 ring-offset-0' : ''}`}>
                        <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                            <kpi.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{kpi.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="relative">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                    type="text"
                    placeholder="Filtrar por nombre, código o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-green-100 transition-all font-medium text-sm text-gray-700"
                />
            </div>

            {/* Content View */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {view === 'list' ? (
                    <InventoryTable
                        items={filteredItems}
                        onEdit={(item) => console.log('Edit', item)}
                        onView={(item) => console.log('View', item)}
                        onDelete={(id) => console.log('Delete', id)}
                    />
                ) : (
                    <div className="glass-card p-20 text-center border-none bg-white">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                            <Map size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 tracking-tight uppercase">Planimetría Digital</h3>
                        <p className="text-sm text-gray-500 mt-2">La visualización 2D de estanterías industriales está siendo optimizada.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryPage;
