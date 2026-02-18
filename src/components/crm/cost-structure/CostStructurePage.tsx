'use client';

import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Layers,
    TrendingUp,
    Users as UsersIcon,
    Clock,
    DollarSign,
    Package,
    ArrowRightLeft,
    ChevronLeft,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Info,
    ShieldCheck,
    Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface CostItem {
    id: string;
    item: string;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnit: number;
    total: number;
    currency?: 'PEN' | 'USD';
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

const initialFabricacion: CostItem[] = [
    { id: 'f1', item: '10', codigo: '1102730', descripcion: 'MSOLD BZ VX2-3.4-0.84X2.4M DOB-TECHO MAQ', cantidad: 824, precioUnit: 0.70, total: 576.80, currency: 'PEN' },
    { id: 'f2', item: '20', codigo: '1102807', descripcion: 'MALLA S BZ2 VX1-2.3-1.055X2.4MDOB PIS MQ', cantidad: 824, precioUnit: 0.80, total: 659.20, currency: 'PEN' },
    { id: 'f3', item: '30', codigo: '1102731', descripcion: 'MALLA S BZ2 VXV-2.3-0.39X0.51MCRT-DIV MQ', cantidad: 4120, precioUnit: 0.26, total: 1071.20, currency: 'PEN' },
    { id: 'f4', item: '40', codigo: '1102732', descripcion: 'PUERTAS P/MOD JAULA POST', cantidad: 3296, precioUnit: 0.23, total: 758.08, currency: 'PEN' },
    { id: 'f5', item: '50', codigo: '1102733', descripcion: 'TEMPLADOR P/MODULO JAULA POST', cantidad: 618, precioUnit: 0.14, total: 86.52, currency: 'PEN' },
    { id: 'f6', item: '60', codigo: '1102734', descripcion: 'TEMPLADOR DE PISO P/MOD JAULA POST', cantidad: 3296, precioUnit: 0.27, total: 889.92, currency: 'PEN' },
    { id: 'f7', item: '70', codigo: '1102736', descripcion: 'SOPORTE D/TUBERIA P/MOD JAULA POST', cantidad: 2472, precioUnit: 0.22, total: 543.84, currency: 'PEN' },
];

const initialPlanchas: CostItem[] = [
    { id: 'p1', item: '10', codigo: '1004045', descripcion: 'COMEDERO LINEAL DE JAULA AVICOLA EST.', cantidad: 824, precioUnit: 8.80, total: 7251.20, currency: 'USD' },
    { id: 'p2', item: '20', codigo: '1004044', descripcion: 'SUJETADOR D/PLANCHA COMEDERO LINEAL EST.', cantidad: 4120, precioUnit: 0.05, total: 206.00, currency: 'USD' },
    { id: 'p3', item: '30', codigo: '1003885', descripcion: 'UNION COMEDERO 1.15 MM GALV P/JAULA AVI', cantidad: 888, precioUnit: 0.98, total: 870.24, currency: 'USD' },
    { id: 'p4', item: '40', codigo: '1003884', descripcion: 'TAPA COMEDERO 0.80MM GALV P/JAULA AVIC', cantidad: 128, precioUnit: 0.98, total: 125.44, currency: 'USD' },
    { id: 'p5', item: '50', codigo: '1004042', descripcion: 'GRAPA DE PLANCHA PARA UNION DE PISOS', cantidad: 2472, precioUnit: 0.06, total: 148.32, currency: 'USD' },
    { id: 'p6', item: '60', codigo: '1004043', descripcion: 'SUJETADOR DE TEMPLADOR DE JAULA', cantidad: 1854, precioUnit: 0.05, total: 92.70, currency: 'USD' },
    { id: 'p7', item: '70', codigo: '1005149', descripcion: 'ALAMBRE PROTECTOR DE CAIDA DE HUEVO', cantidad: 128, precioUnit: 0.70, total: 89.60, currency: 'USD' },
];

const initialMateriales: MaterialItem[] = [
    { id: 'm1', descripcion: 'Alambre Diámetro 2.30', cantidad: 5092, unidad: 'kg', precioUnit: 1.25, total: 6365.00 },
    { id: 'm2', descripcion: 'Alambre Diámetro 10', cantidad: 2899, unidad: 'kg', precioUnit: 1.15, total: 3333.85 },
    { id: 'm3', descripcion: 'Alambre Diámetro 3 mm', cantidad: 412, unidad: 'kg', precioUnit: 1.35, total: 556.20 },
    { id: 'm4', descripcion: 'Alambre Diámetro 8', cantidad: 408, unidad: 'kg', precioUnit: 1.20, total: 489.60 },
];

const initialLabor: LaborItem[] = [
    { id: 'l1', rol: 'Operarios Ensamblaje', cantidad: 6, dias: 10, pagoDia: 65, total: 3900.00 },
];

export default function CostStructurePage() {
    const [fabricacion, setFabricacion] = useState<CostItem[]>(initialFabricacion);
    const [planchas, setPlanchas] = useState<CostItem[]>(initialPlanchas);
    const [materiales, setMateriales] = useState<MaterialItem[]>(initialMateriales);
    const [labor, setLabor] = useState<LaborItem[]>(initialLabor);
    const [exchangeRate, setExchangeRate] = useState(3.75);

    // --- Calculations ---
    const totalFabPEN = useMemo(() => fabricacion.reduce((acc, item) => acc + item.total, 0), [fabricacion]);
    const totalPlanchasUSD = useMemo(() => planchas.reduce((acc, item) => acc + item.total, 0), [planchas]);
    const totalMatPEN = useMemo(() => materiales.reduce((acc, item) => acc + item.total, 0), [materiales]);
    const totalLaborPEN = useMemo(() => labor.reduce((acc, item) => acc + item.total, 0), [labor]);

    const totalPEN = totalFabPEN + (totalPlanchasUSD * exchangeRate) + totalMatPEN + totalLaborPEN;

    // --- Handlers ---
    const updateItem = (setter: any, id: string, field: string, value: any) => {
        setter((prev: any[]) => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnit' || field === 'dias' || field === 'pagoDia') {
                    if (item.rol) { // Labor
                        newItem.total = Number(newItem.cantidad) * Number(newItem.dias) * Number(newItem.pagoDia);
                    } else {
                        newItem.total = Number(newItem.cantidad) * Number(newItem.precioUnit);
                    }
                }
                return newItem;
            }
            return item;
        }));
    };

    const goBack = () => {
        window.location.reload(); // Simple way to trigger Layout change back if needed, or we could lift state
    };

    return (
        <div className="min-h-screen font-sans antialiased text-[#2D3436]" style={{ background: 'linear-gradient(135deg, #F0F2F5 0%, #E2E8F0 100%)' }}>
            {/* Header / Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/40 backdrop-blur-2xl border-b border-white/50 flex items-center justify-between px-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={goBack}
                        className="p-3 bg-[#1A1D21] text-white rounded-[14px] hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Cerrar Análisis</span>
                    </button>
                    <div className="h-10 w-px bg-gray-300/50" />
                    <div>
                        <h1 className="text-xl font-[800] tracking-tighter uppercase italic flex items-center gap-2">
                            Prodac Analysis <span className="text-[#469F7A]">2025</span>
                        </h1>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-500 opacity-60">Finanzas de Guerra • Estructura de Costos</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase font-black text-[#469F7A] tracking-widest">T.C. Referencial</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">S/</span>
                            <input
                                type="number"
                                step="0.01"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                                className="w-16 bg-transparent border-none text-right font-black text-xl focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white/60 p-4 rounded-[22px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Total PEN</span>
                            <span className="text-2xl font-[800] tracking-tighter">S/ {totalPEN.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <main className="pt-32 pb-20 px-10 max-w-7xl mx-auto space-y-12">

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-6">
                    {[
                        { label: 'Fabricación Local', value: totalFabPEN, currency: 'S/', color: '#1A1D21' },
                        { label: 'Planchas (P.O.)', value: totalPlanchasUSD, currency: '$', color: '#469F7A' },
                        { label: 'Insumos Alambre', value: totalMatPEN, currency: 'S/', color: '#00C38B' },
                        { label: 'Mano de Obra', value: totalLaborPEN, currency: 'S/', color: '#FF7043' },
                    ].map((stat, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="bg-white/45 backdrop-blur-[25px] border border-white/80 p-6 rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-all">
                                <Coins size={60} color={stat.color} />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 block">{stat.label}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.currency}</span>
                                <span className="text-3xl font-[800] tracking-tight">{stat.value.toLocaleString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 1. Fabricación Table */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="text-[#1A1D21]" size={24} />
                        <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Reconstrucción de Fabricación (Alambre)</h2>
                    </div>
                    <GlassTable
                        data={fabricacion}
                        columns={['Código', 'Descripción', 'Cant.', 'P. Unit', 'Total']}
                        onUpdate={(id, field, value) => updateItem(setFabricacion, id, field, value)}
                    />
                </section>

                {/* 2. Planchas Section (THE ONE TO CAUTION) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers className="text-[#469F7A]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Sección Planchas y Accesorios (USD)</h2>
                        </div>
                        <div className="bg-[#469F7A]/10 px-4 py-2 rounded-full border border-[#469F7A]/20 flex items-center gap-2">
                            <Info size={14} className="text-[#469F7A]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#469F7A]">No requiere cambios frecuentes</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium max-w-2xl leading-relaxed">
                        Estos items corresponden al sistema de comederos y fijaciones fabricados con plancha galvanizada. Se incluyen por completitud de la O.C. 4520065767 pero no afectan el análisis de costos de trefilería de Prodac.
                    </p>
                    <GlassTable
                        data={planchas}
                        currency="$"
                        columns={['Código', 'Descripción', 'Cant.', 'P. Unit (USD)', 'Total (USD)']}
                        onUpdate={(id, field, value) => updateItem(setPlanchas, id, field, value)}
                        primaryColor="#469F7A"
                    />
                </section>

                {/* 3. Insumos y Labor Matrix */}
                <div className="grid grid-cols-2 gap-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-[#00C38B]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Materia Prima Alambre (KG)</h2>
                        </div>
                        <GlassTable
                            data={materiales}
                            columns={['Insumo', 'Und', 'Cant.', 'P. Unit', 'Total']}
                            onUpdate={(id, field, value) => updateItem(setMateriales, id, field, value)}
                            primaryColor="#00C38B"
                        />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <UsersIcon className="text-[#FF7043]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Mano de Obra Estimada</h2>
                        </div>
                        <GlassTable
                            data={labor}
                            columns={['Rol', 'Pers.', 'Días', 'P. Día', 'Total']}
                            onUpdate={(id, field, value) => updateItem(setLabor, id, field, value)}
                            primaryColor="#FF7043"
                        />
                    </section>
                </div>

                {/* Data Security Footer */}
                <div className="bg-[#1A1D21] p-10 rounded-[32px] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,#469F7A_0%,transparent_50%)]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-[#469F7A]" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#469F7A]">Auditoría Segura</span>
                        </div>
                        <h3 className="text-2xl font-[800] tracking-tighter uppercase italic">Resumen de Instrucciones Legales</h3>
                        <ul className="mt-4 grid grid-cols-2 gap-4 text-[10px] uppercase font-bold text-white/50 tracking-widest">
                            <li>• Atención L-V 8:00 AM - 4:30 PM</li>
                            <li>• Gestión vía Portal Web de Proveedores</li>
                            <li>• Agente de Retención (3% > S/ 700)</li>
                            <li>• Facturación máx. 26 del mes</li>
                        </ul>
                    </div>

                    <div className="text-right">
                        <button className="bg-white text-[#1A1D21] px-10 py-4 rounded-[20px] font-black uppercase tracking-tighter text-xs hover:scale-105 transition-all shadow-white/20 shadow-2xl flex items-center gap-3">
                            <Save size={18} />
                            Exportar Estructura Consolidada
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper UI Components ---

function GlassTable({ data, columns, onUpdate, currency = 'S/', primaryColor = '#1A1D21' }: any) {
    return (
        <div className="bg-white/45 backdrop-blur-[25px] border border-white/80 rounded-[28px] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/20 border-b border-white/50 text-[9px] uppercase font-black tracking-widest text-[#2D3436]/40">
                        {columns.map((col: string) => (
                            <th key={col} className="px-6 py-5">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/50">
                    {data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/30 transition-colors">
                            <td className="px-6 py-5">
                                <span className="text-[10px] font-black font-mono tracking-tighter opacity-60" style={{ color: primaryColor }}>{item.codigo || item.unidad || item.cantidad}</span>
                            </td>
                            <td className="px-6 py-5">
                                <input
                                    type="text"
                                    value={item.descripcion || item.rol || item.insumo}
                                    onChange={(e) => onUpdate(item.id, item.descripcion ? 'descripcion' : 'rol', e.target.value)}
                                    className="bg-transparent border-none text-[12px] font-[600] w-full focus:outline-none"
                                />
                            </td>
                            <td className="px-6 py-5">
                                <input
                                    type="number"
                                    value={item.cantidad || item.pers}
                                    onChange={(e) => onUpdate(item.id, item.cantidad ? 'cantidad' : 'pers', parseFloat(e.target.value))}
                                    className="w-20 bg-white/40 border border-white/80 rounded-[12px] px-3 py-2 text-center text-xs font-[800] focus:ring-2 focus:ring-white outline-none"
                                />
                            </td>
                            <td className="px-6 py-5">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.precioUnit || item.pagoDia || item.dias}
                                    onChange={(e) => onUpdate(item.id, item.precioUnit ? 'precioUnit' : (item.pagoDia ? 'pagoDia' : 'dias'), parseFloat(e.target.value))}
                                    className="w-24 bg-white/40 border border-white/80 rounded-[12px] px-3 py-2 text-center text-xs font-[800] focus:ring-2 focus:ring-white outline-none"
                                    style={{ color: primaryColor }}
                                />
                            </td>
                            <td className="px-6 py-5 text-right font-[800] text-sm tabular-nums">
                                <span className="text-[10px] text-gray-400 mr-2">{currency}</span>
                                {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
