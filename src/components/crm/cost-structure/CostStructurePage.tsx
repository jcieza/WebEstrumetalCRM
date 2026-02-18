'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calculator,
    Layers,
    TrendingUp,
    Users as UsersIcon,
    Clock,
    DollarSign,
    Package,
    ArrowRightLeft,
    ChevronDown,
    Save,
    RotateCcw,
    Plus,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---

interface CostItem {
    id: string;
    item: string;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnit: number;
    total: number;
    fecha?: string;
    sem?: string;
}

interface MaterialItem {
    id: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precioUnit: number;
    total: number;
}

interface LaborItem {
    id: string;
    rol: string;
    cantidad: number;
    dias: number;
    pagoDia: number;
    total: number;
}

// --- Initial Data ---

const initialProdacItems: CostItem[] = [
    { id: '1', item: '10', codigo: '1102730', descripcion: 'MSOLD BZ VX2-3.4-0.84X2.4M DOB-TECHO MAQ', cantidad: 824, precioUnit: 0.7000, total: 576.80, fecha: '17/03/2025', sem: '12' },
    { id: '2', item: '20', codigo: '1102807', descripcion: 'MALLA S BZ2 VX1-2.3-1.055X2.4MDOB PIS MQ', cantidad: 824, precioUnit: 0.8000, total: 659.20, fecha: '17/03/2025', sem: '12' },
    { id: '3', item: '30', codigo: '1102731', descripcion: 'MALLA S BZ2 VXV-2.3-0.39X0.51MCRT-DIV MQ', cantidad: 4120, precioUnit: 0.2600, total: 1071.20, fecha: '17/03/2024', sem: '11' },
    { id: '4', item: '40', codigo: '1102732', descripcion: 'PUERTAS P/MOD JAULA POST', cantidad: 3296, precioUnit: 0.2300, total: 758.08, fecha: '17/03/2025', sem: '12' },
    { id: '5', item: '50', codigo: '1102733', descripcion: 'TEMPLADOR P/MODULO JAULA POST', cantidad: 618, precioUnit: 0.1400, total: 86.52, fecha: '17/03/2025', sem: '12' },
    { id: '6', item: '60', codigo: '1102734', descripcion: 'TEMPLADOR DE PISO P/MOD JAULA POST', cantidad: 3296, precioUnit: 0.2700, total: 889.92, fecha: '17/03/2025', sem: '12' },
    { id: '7', item: '70', codigo: '1102736', descripcion: 'SOPORTE D/TUBERIA P/MOD JAULA POST', cantidad: 2472, precioUnit: 0.2200, total: 543.84, fecha: '17/03/2025', sem: '12' },
];

const initialMateriales: MaterialItem[] = [
    { id: 'm1', descripcion: 'Alambre Diametro 2.30', cantidad: 5092, unidad: 'kg', precioUnit: 1.25, total: 6365.00 },
    { id: 'm2', descripcion: 'Alambre Diametro 10', cantidad: 2899, unidad: 'kg', precioUnit: 1.15, total: 3333.85 },
    { id: 'm3', descripcion: 'Alambre Diametro 3 mm', cantidad: 412, unidad: 'kg', precioUnit: 1.35, total: 556.20 },
    { id: 'm4', descripcion: 'Alambre Diametro 8', cantidad: 408, unidad: 'kg', precioUnit: 1.20, total: 489.60 },
    { id: 'm5', descripcion: 'Nipples (Mercado)', cantidad: 824, unidad: 'un', precioUnit: 0.45, total: 370.80 },
];

const initialLabor: LaborItem[] = [
    { id: 'l1', rol: 'Operarios Ensamblaje', cantidad: 6, dias: 10, pagoDia: 65, total: 3900.00 },
];

export default function CostStructurePage() {
    const [costItems, setCostItems] = useState<CostItem[]>(initialProdacItems);
    const [materialItems, setMaterialItems] = useState<MaterialItem[]>(initialMateriales);
    const [laborItems, setLaborItems] = useState<LaborItem[]>(initialLabor);

    // --- Calculations ---

    const totalFabricacion = useMemo(() => costItems.reduce((acc, item) => acc + item.total, 0), [costItems]);
    const totalMateriales = useMemo(() => materialItems.reduce((acc, item) => acc + item.total, 0), [materialItems]);
    const totalLabor = useMemo(() => laborItems.reduce((acc, item) => acc + item.total, 0), [laborItems]);
    const totalGeneral = totalFabricacion + totalMateriales + totalLabor;

    // --- Handlers ---

    const updateCostItem = (id: string, field: keyof CostItem, value: any) => {
        setCostItems(prev => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnit') {
                    newItem.total = Number(newItem.cantidad) * Number(newItem.precioUnit);
                }
                return newItem;
            }
            return item;
        }));
    };

    const updateMaterialItem = (id: string, field: keyof MaterialItem, value: any) => {
        setMaterialItems(prev => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnit') {
                    newItem.total = Number(newItem.cantidad) * Number(newItem.precioUnit);
                }
                return newItem;
            }
            return item;
        }));
    };

    const updateLaborItem = (id: string, field: keyof LaborItem, value: any) => {
        setLaborItems(prev => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'dias' || field === 'pagoDia') {
                    newItem.total = Number(newItem.cantidad) * Number(newItem.dias) * Number(newItem.pagoDia);
                }
                return newItem;
            }
            return item;
        }));
    };

    // --- UI Components ---

    const TableHeader = ({ icon: Icon, title, total }: { icon: any, title: string, total: number }) => (
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-200 uppercase tracking-tight">{title}</h3>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase font-black block tracking-widest">Subtotal</span>
                <span className="text-xl font-black text-emerald-400">S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 min-h-screen bg-[#0a0a0b] p-2 rounded-xl border border-white/5">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-4">
                        <Layers className="text-emerald-500" size={32} />
                        Análisis de Costos Prodac
                    </h1>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                        <ArrowRightLeft size={14} className="text-emerald-500" />
                        Reconstrucción Estrumetal x Prodac • Prototipo de Auditoría
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-xl text-right">
                        <span className="text-[10px] text-emerald-300 uppercase font-black block tracking-widest mb-1">Costo Total Estimado</span>
                        <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                            S/ {totalGeneral.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Fabricación', value: totalFabricacion, icon: Package, color: 'text-blue-400' },
                    { label: 'Insumos / Alambres', value: totalMateriales, icon: TrendingUp, color: 'text-purple-400' },
                    { label: 'Mano de Obra', value: totalLabor, icon: UsersIcon, color: 'text-orange-400' },
                    { label: 'Margen Proyectado', value: totalGeneral * 0.15, icon: Calculator, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={16} className={stat.color} />
                        </div>
                        <div className="text-xl font-bold text-gray-100">S/ {stat.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            {/* Tables Container */}
            <div className="space-y-12 pb-20">
                {/* 1. Fabricación de Componentes */}
                <section>
                    <TableHeader icon={Package} title="Fabricación de Componentes" total={totalFabricacion} />
                    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[9px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 font-black">Item/Código</th>
                                        <th className="p-4 font-black">Descripción</th>
                                        <th className="p-4 font-black text-center">Cantidad (UN)</th>
                                        <th className="p-4 font-black text-center">Precio Unit.</th>
                                        <th className="p-4 font-black text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {costItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="text-emerald-400 font-bold text-xs">{item.item}</div>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{item.codigo}</div>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={item.descripcion}
                                                    onChange={(e) => updateCostItem(item.id, 'descripcion', e.target.value)}
                                                    className="bg-transparent border-none text-gray-300 text-xs font-medium w-full focus:outline-none focus:text-white"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateCostItem(item.id, 'cantidad', parseFloat(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-emerald-400 w-24 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={item.precioUnit}
                                                    onChange={(e) => updateCostItem(item.id, 'precioUnit', parseFloat(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-emerald-400 w-24 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-xs font-black text-gray-100">S/ {item.total.toFixed(2)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 2. Materiales e Insumos */}
                <section>
                    <TableHeader icon={TrendingUp} title="Insumos y Alambres" total={totalMateriales} />
                    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[9px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 font-black">Descripción Insumo</th>
                                        <th className="p-4 font-black text-center">Cantidad</th>
                                        <th className="p-4 font-black text-center">Unidad</th>
                                        <th className="p-4 font-black text-center">Precio Unit. (S/)</th>
                                        <th className="p-4 font-black text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {materialItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={item.descripcion}
                                                    onChange={(e) => updateMaterialItem(item.id, 'descripcion', e.target.value)}
                                                    className="bg-transparent border-none text-gray-300 text-xs font-medium w-full focus:outline-none focus:text-white"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateMaterialItem(item.id, 'cantidad', parseFloat(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-emerald-400 w-24 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center text-[10px] text-gray-500 font-black uppercase">
                                                {item.unidad}
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.precioUnit}
                                                    onChange={(e) => updateMaterialItem(item.id, 'precioUnit', parseFloat(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-emerald-400 w-24 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-xs font-black text-gray-100">S/ {item.total.toFixed(2)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 3. Mano de Obra */}
                <section>
                    <TableHeader icon={UsersIcon} title="Mano de Obra Estimada" total={totalLabor} />
                    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[9px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 font-black">Rol / Tarea</th>
                                        <th className="p-4 font-black text-center">N° Personas</th>
                                        <th className="p-4 font-black text-center">Días</th>
                                        <th className="p-4 font-black text-center">Pago p/Día</th>
                                        <th className="p-4 font-black text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {laborItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={item.rol}
                                                    onChange={(e) => updateLaborItem(item.id, 'rol', e.target.value)}
                                                    className="bg-transparent border-none text-gray-300 text-xs font-medium w-full outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateLaborItem(item.id, 'cantidad', parseInt(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-orange-400 w-20 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    value={item.dias}
                                                    onChange={(e) => updateLaborItem(item.id, 'dias', parseInt(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-orange-400 w-20 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    value={item.pagoDia}
                                                    onChange={(e) => updateLaborItem(item.id, 'pagoDia', parseFloat(e.target.value))}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-xs font-bold text-orange-400 w-24 outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-xs font-black text-gray-100">S/ {item.total.toFixed(2)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Summary Card */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[60]">
                <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex justify-between items-center">
                    <div className="flex gap-8">
                        <div>
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-1">Items Totales</span>
                            <span className="text-lg font-bold text-white tracking-tighter">
                                {costItems.reduce((acc, i) => acc + i.cantidad, 0).toLocaleString()} <span className="text-xs font-medium text-gray-500">Unidades</span>
                            </span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-1">Insumos Alambre</span>
                            <span className="text-lg font-bold text-white tracking-tighter">
                                {materialItems.filter(i => i.unidad === 'kg').reduce((acc, i) => acc + i.cantidad, 0).toLocaleString()} <span className="text-xs font-medium text-gray-500">KG</span>
                            </span>
                        </div>
                    </div>

                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-tighter text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40">
                        <Save size={16} />
                        Exportar Estructura
                    </button>
                </div>
            </div>
        </div>
    );
}
