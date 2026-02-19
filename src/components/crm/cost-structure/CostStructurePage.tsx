'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
    Coins,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface CostItem {
    id: string;
    item?: string;
    codigo?: string;
    descripcion: string;
    cantidad: number;
    precioUnit?: number;
    total: number;
    currency: 'PEN' | 'USD';
}

interface MaterialItem extends CostItem {
    unidad: string;
}

interface LaborItem extends CostItem {
    rol: string;
    dias: number;
    pagoDia: number;
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
    { id: 'm1', descripcion: 'Alambre Diámetro 2.30', unidad: 'kg', cantidad: 5092, precioUnit: 1.25, total: 6365.00, currency: 'PEN' },
    { id: 'm2', descripcion: 'Alambre Diámetro 10', unidad: 'kg', cantidad: 2899, precioUnit: 1.15, total: 3333.85, currency: 'PEN' },
    { id: 'm3', descripcion: 'Alambre Diámetro 3 mm', unidad: 'kg', cantidad: 412, precioUnit: 1.35, total: 556.20, currency: 'PEN' },
    { id: 'm4', descripcion: 'Alambre Diámetro 8', unidad: 'kg', cantidad: 408, precioUnit: 1.20, total: 489.60, currency: 'PEN' },
];

const initialLabor: LaborItem[] = [
    { id: 'l1', rol: 'Operarios Ensamblaje', descripcion: 'Mano de Obra Ensamblaje', cantidad: 6, dias: 10, pagoDia: 65, total: 3900.00, currency: 'PEN' },
];

const initialExtraData: CostItem[] = [
    { id: 'e1', descripcion: 'Nipples', cantidad: 824, precioUnit: 1.9, total: 1565.6, currency: 'USD' },
    { id: 'e2', descripcion: 'Tubos', cantidad: 417, precioUnit: 4.9, total: 2043.3, currency: 'USD' },
    { id: 'e3', descripcion: 'Armado', cantidad: 1, precioUnit: 5000, total: 5000, currency: 'PEN' },
    { id: 'e4', descripcion: 'Regulares', cantidad: 4, precioUnit: 115, total: 460, currency: 'PEN' },
];

export default function CostStructurePage() {
    const [fabricacion, setFabricacion] = useState<CostItem[]>(initialFabricacion);
    const [planchas, setPlanchas] = useState<CostItem[]>(initialPlanchas);
    const [materiales, setMateriales] = useState<MaterialItem[]>(initialMateriales);
    const [labor, setLabor] = useState<LaborItem[]>(initialLabor);
    const [extraData, setExtraData] = useState<CostItem[]>(initialExtraData);
    const [exchangeRate, setExchangeRate] = useState(3.75);
    const [materialCushion, setMaterialCushion] = useState(0.20); // 20% safety margin
    const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
    const [sectionSettings, setSectionSettings] = useState<Record<string, { currency: 'PEN' | 'USD', hasIGV: boolean }>>({
        fabricacion: { currency: 'PEN', hasIGV: true },
        extras: { currency: 'PEN', hasIGV: true },
        planchas: { currency: 'USD', hasIGV: true },
        materiales: { currency: 'PEN', hasIGV: true },
        labor: { currency: 'PEN', hasIGV: true }
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('cost_structure_data_v3');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.fabricacion) setFabricacion(data.fabricacion);
                if (data.planchas) setPlanchas(data.planchas);
                if (data.materiales) setMateriales(data.materiales);
                if (data.labor) setLabor(data.labor);
                if (data.extraData) setExtraData(data.extraData);
                if (data.exchangeRate) setExchangeRate(data.exchangeRate);
                if (data.materialCushion !== undefined) setMaterialCushion(data.materialCushion);
                if (data.displayCurrency) setDisplayCurrency(data.displayCurrency);
                if (data.sectionSettings) setSectionSettings(data.sectionSettings);
            } catch (e) {
                console.error("Error loading saved data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const data = {
                fabricacion,
                planchas,
                materiales,
                labor,
                extraData,
                exchangeRate,
                materialCushion,
                displayCurrency,
                sectionSettings
            };
            localStorage.setItem('cost_structure_data_v3', JSON.stringify(data));
        }
    }, [fabricacion, planchas, materiales, labor, extraData, exchangeRate, materialCushion, displayCurrency, sectionSettings, isLoaded]);

    // --- Calculations ---
    const getSubtotal = (items: CostItem[], targetCurrency: 'PEN' | 'USD') => {
        return items.reduce((acc, item) => {
            if (item.currency === targetCurrency) return acc + item.total;
            if (targetCurrency === 'PEN' && item.currency === 'USD') return acc + (item.total * exchangeRate);
            if (targetCurrency === 'USD' && item.currency === 'PEN') return acc + (item.total / exchangeRate);
            return acc + item.total;
        }, 0);
    };

    const totalFabPEN = useMemo(() => getSubtotal(fabricacion, 'PEN'), [fabricacion, exchangeRate]);
    const totalPlanchasUSD = useMemo(() => getSubtotal(planchas, 'USD'), [planchas, exchangeRate]);

    // Original Material Cost
    const rawTotalMatPEN = useMemo(() => getSubtotal(materiales, 'PEN'), [materiales, exchangeRate]);
    // Material Cost with Cushion
    const totalMatPEN = useMemo(() => rawTotalMatPEN * (1 + materialCushion), [rawTotalMatPEN, materialCushion]);

    const totalLaborPEN = useMemo(() => getSubtotal(labor, 'PEN'), [labor, exchangeRate]);

    // Extra data is special as it's truly mixed by nature in its original view
    const totalExtraPEN = useMemo(() => getSubtotal(extraData, 'PEN'), [extraData, exchangeRate]);
    const totalExtraUSD = useMemo(() => getSubtotal(extraData, 'USD'), [extraData, exchangeRate]);

    const totalPEN = useMemo(() => {
        return totalFabPEN + (totalPlanchasUSD * exchangeRate) + totalMatPEN + totalLaborPEN + totalExtraPEN;
    }, [totalFabPEN, totalPlanchasUSD, totalMatPEN, totalLaborPEN, totalExtraPEN, exchangeRate]);

    const totalUSD = useMemo(() => totalPEN / exchangeRate, [totalPEN, exchangeRate]);

    const mainTotal = displayCurrency === 'PEN' ? totalPEN : totalUSD;

    const getFinalSubtotal = (baseSubtotal: number, sectionKey: string) => {
        const settings = sectionSettings[sectionKey];
        const subtotalWithIGV = settings.hasIGV ? baseSubtotal : baseSubtotal * 1.18;

        // Convert to section's display currency
        if (settings.currency === 'PEN') return subtotalWithIGV;
        return subtotalWithIGV / exchangeRate;
    };

    const sectionTotals = useMemo(() => ({
        fabricacion: getFinalSubtotal(totalFabPEN, 'fabricacion'),
        extras: getFinalSubtotal(totalExtraPEN, 'extras'),
        planchas: getFinalSubtotal(totalPlanchasUSD * exchangeRate, 'planchas'),
        materiales: getFinalSubtotal(totalMatPEN, 'materiales'),
        labor: getFinalSubtotal(totalLaborPEN, 'labor')
    }), [totalFabPEN, totalExtraPEN, totalPlanchasUSD, totalMatPEN, totalLaborPEN, sectionSettings, exchangeRate]);

    const finalTotalPEN = useMemo(() => {
        const sum = (base: number, key: string) => sectionSettings[key].hasIGV ? base : base * 1.18;
        return sum(totalFabPEN, 'fabricacion') +
            sum(totalExtraPEN, 'extras') +
            sum(totalPlanchasUSD * exchangeRate, 'planchas') +
            sum(totalMatPEN, 'materiales') +
            sum(totalLaborPEN, 'labor');
    }, [totalFabPEN, totalExtraPEN, totalPlanchasUSD, totalMatPEN, totalLaborPEN, sectionSettings, exchangeRate]);

    const finalTotalUSD = useMemo(() => finalTotalPEN / exchangeRate, [finalTotalPEN, exchangeRate]);
    const displayFinalTotal = displayCurrency === 'PEN' ? finalTotalPEN : finalTotalUSD;

    // --- Handlers ---
    const updateItem = (setter: any, id: string, field: string, value: any) => {
        setter((prev: any[]) => prev.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnit' || field === 'dias' || field === 'pagoDia') {
                    if (newItem.rol) { // Labor
                        newItem.total = Number(newItem.cantidad) * Number(newItem.dias) * Number(newItem.pagoDia);
                    } else {
                        newItem.total = Number(newItem.cantidad) * Number(newItem.precioUnit);
                    }
                }

                // Handle currency swap logic
                if (field === 'currency') {
                    const factor = value === 'USD' ? (1 / exchangeRate) : exchangeRate;

                    if (newItem.precioUnit !== undefined) newItem.precioUnit = item.precioUnit * factor;
                    if (newItem.pagoDia !== undefined) newItem.pagoDia = item.pagoDia * factor;
                    newItem.total = item.total * factor;
                }
                return newItem;
            }
            return item;
        }));
    };

    const goBack = () => {
        window.location.reload();
    };

    const toggleCurrency = () => {
        setDisplayCurrency(prev => prev === 'PEN' ? 'USD' : 'PEN');
    };

    const toggleSectionIGV = (key: string) => {
        setSectionSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], hasIGV: !prev[key].hasIGV }
        }));
    };

    const toggleSectionCurrency = (key: string) => {
        setSectionSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], currency: prev[key].currency === 'PEN' ? 'USD' : 'PEN' }
        }));
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
                        <span className="text-[9px] uppercase font-black text-[#FF7043] tracking-widest">Colchón (Margen)</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">%</span>
                            <input
                                type="number"
                                step="0.01"
                                value={materialCushion}
                                onChange={(e) => setMaterialCushion(parseFloat(e.target.value))}
                                className="w-16 bg-transparent border-none text-right font-black text-xl focus:outline-none text-[#FF7043]"
                            />
                        </div>
                    </div>

                    <div className="h-10 w-px bg-gray-300/50" />

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

                    <button
                        onClick={toggleCurrency}
                        className="bg-white/60 p-4 rounded-[22px] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-6 group hover:bg-white/80 transition-all"
                    >
                        <div className="text-right">
                            <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block group-hover:text-[#469F7A] transition-colors text-right">
                                Total {displayCurrency} <span className="text-[8px]">(Click para toggle)</span>
                            </span>
                            <span className="text-2xl font-[800] tracking-tighter flex items-center gap-2">
                                {displayCurrency === 'PEN' ? 'S/' : '$'} {displayFinalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                <RefreshCw size={14} className="text-[#469F7A] opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                            </span>
                        </div>
                    </button>
                </div>
            </header>

            {/* Content Body */}
            <main className="pt-32 pb-40 px-10 max-w-7xl mx-auto space-y-12">

                {/* Summary Cards */}
                <div className="grid grid-cols-5 gap-6">
                    {[
                        { label: 'Fabricación Local', value: sectionSettings.fabricacion.currency === 'PEN' ? totalFabPEN : totalFabPEN / exchangeRate, currency: sectionSettings.fabricacion.currency === 'PEN' ? 'S/' : '$', color: '#1A1D21', key: 'fabricacion' },
                        { label: 'Otros / Extras', value: sectionSettings.extras.currency === 'PEN' ? totalExtraPEN : totalExtraPEN / exchangeRate, currency: sectionSettings.extras.currency === 'PEN' ? 'S/' : '$', color: '#12C2E9', key: 'extras' },
                        { label: 'Planchas (P.O.)', value: sectionSettings.planchas.currency === 'USD' ? totalPlanchasUSD : totalPlanchasUSD * exchangeRate, currency: sectionSettings.planchas.currency === 'USD' ? '$' : 'S/', color: '#469F7A', key: 'planchas' },
                        { label: 'Insumos (+ Colchón)', value: sectionSettings.materiales.currency === 'PEN' ? totalMatPEN : totalMatPEN / exchangeRate, currency: sectionSettings.materiales.currency === 'PEN' ? 'S/' : '$', color: '#00C38B', key: 'materiales' },
                        { label: 'Mano de Obra', value: sectionSettings.labor.currency === 'PEN' ? totalLaborPEN : totalLaborPEN / exchangeRate, currency: sectionSettings.labor.currency === 'PEN' ? 'S/' : '$', color: '#FF7043', key: 'labor' },
                    ].map((stat, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className={`bg-white/45 backdrop-blur-[25px] border border-white/80 p-6 rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden group cursor-pointer ${!sectionSettings[stat.key].hasIGV ? 'ring-2 ring-rose-500/20' : ''}`}
                            onDoubleClick={() => toggleSectionIGV(stat.key)}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-all">
                                <Coins size={60} color={stat.color} />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{stat.label}</span>
                                {!sectionSettings[stat.key].hasIGV && (
                                    <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">+18% IGV</span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.currency}</span>
                                <span className="text-2xl font-[800] tracking-tight">{stat.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 1. Fabricación Table */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="text-[#1A1D21]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Fabricación Alambre</h2>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <button
                                onDoubleClick={() => toggleSectionIGV('fabricacion')}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sectionSettings.fabricacion.hasIGV ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}
                            >
                                {sectionSettings.fabricacion.hasIGV ? '+ IGV' : 'No IGV'}
                            </button>
                            <div>
                                <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Subtotal</span>
                                <span className="text-xl font-black text-[#1A1D21] tabular-nums">
                                    <span
                                        className="cursor-pointer hover:text-[#469F7A] transition-colors mr-1"
                                        onDoubleClick={() => toggleSectionCurrency('fabricacion')}
                                    >
                                        {sectionSettings.fabricacion.currency === 'PEN' ? 'S/' : '$'}
                                    </span>
                                    {sectionTotals.fabricacion.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <GlassTable
                        data={fabricacion}
                        columns={['Código', 'Descripción', 'Cant.', 'P. Unit', 'Total']}
                        onUpdate={(id, field, value) => updateItem(setFabricacion, id, field, value)}
                    />
                </section>

                {/* Otros Gastos Table */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calculator className="text-[#12C2E9]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Complementos y Gastos Extra</h2>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <button
                                onDoubleClick={() => toggleSectionIGV('extras')}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sectionSettings.extras.hasIGV ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}
                            >
                                {sectionSettings.extras.hasIGV ? '+ IGV' : 'No IGV'}
                            </button>
                            <div>
                                <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Subtotal</span>
                                <span className="text-xl font-black text-[#12C2E9] tabular-nums">
                                    <span
                                        className="cursor-pointer hover:text-[#469F7A] transition-colors mr-1"
                                        onDoubleClick={() => toggleSectionCurrency('extras')}
                                    >
                                        {sectionSettings.extras.currency === 'PEN' ? 'S/' : '$'}
                                    </span>
                                    {sectionTotals.extras.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <GlassTable
                        data={extraData}
                        columns={['Tipo', 'Descripción', 'Cant.', 'P. Unit', 'Total']}
                        onUpdate={(id, field, value) => updateItem(setExtraData, id, field, value)}
                        primaryColor="#12C2E9"
                    />
                </section>

                {/* 2. Planchas Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers className="text-[#469F7A]" size={24} />
                            <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Sección Planchas (USD)</h2>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="bg-[#469F7A]/10 px-4 py-2 rounded-full border border-[#469F7A]/20 flex items-center gap-2">
                                <Info size={14} className="text-[#469F7A]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#469F7A]">No requiere cambios frecuentes</span>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <button
                                    onDoubleClick={() => toggleSectionIGV('planchas')}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sectionSettings.planchas.hasIGV ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}
                                >
                                    {sectionSettings.planchas.hasIGV ? '+ IGV' : 'No IGV'}
                                </button>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Subtotal</span>
                                    <span className="text-xl font-black text-[#469F7A] tabular-nums">
                                        <span
                                            className="cursor-pointer hover:text-[#00C38B] transition-colors mr-1"
                                            onDoubleClick={() => toggleSectionCurrency('planchas')}
                                        >
                                            {sectionSettings.planchas.currency === 'PEN' ? 'S/' : '$'}
                                        </span>
                                        {sectionTotals.planchas.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <GlassTable
                        data={planchas}
                        columns={['Código', 'Descripción', 'Cant.', 'P. Unit (USD)', 'Total (USD)']}
                        onUpdate={(id, field, value) => updateItem(setPlanchas, id, field, value)}
                        primaryColor="#469F7A"
                    />
                </section>

                {/* 3. Insumos y Labor Matrix */}
                <div className="grid lg:grid-cols-2 gap-10">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-[#00C38B]" size={24} />
                                <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Materia Prima Alambres</h2>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <button
                                    onDoubleClick={() => toggleSectionIGV('materiales')}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sectionSettings.materiales.hasIGV ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}
                                >
                                    {sectionSettings.materiales.hasIGV ? '+ IGV' : 'No IGV'}
                                </button>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Subtotal (+ {(materialCushion * 100).toFixed(0)}%)</span>
                                    <span className="text-xl font-black text-[#00C38B] tabular-nums">
                                        <span
                                            className="cursor-pointer hover:text-[#469F7A] transition-colors mr-1"
                                            onDoubleClick={() => toggleSectionCurrency('materiales')}
                                        >
                                            {sectionSettings.materiales.currency === 'PEN' ? 'S/' : '$'}
                                        </span>
                                        {sectionTotals.materiales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <GlassTable
                            data={materiales}
                            columns={['Insumo', 'Und', 'Cant.', 'P. Unit', 'Total']}
                            onUpdate={(id, field, value) => updateItem(setMateriales, id, field, value)}
                            primaryColor="#00C38B"
                        />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UsersIcon className="text-[#FF7043]" size={24} />
                                <h2 className="text-lg font-[800] uppercase tracking-tighter italic">Mano de Obra Estrumetal</h2>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <button
                                    onDoubleClick={() => toggleSectionIGV('labor')}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sectionSettings.labor.hasIGV ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}
                                >
                                    {sectionSettings.labor.hasIGV ? '+ IGV' : 'No IGV'}
                                </button>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">Subtotal</span>
                                    <span className="text-xl font-black text-[#FF7043] tabular-nums">
                                        <span
                                            className="cursor-pointer hover:text-[#469F7A] transition-colors mr-1"
                                            onDoubleClick={() => toggleSectionCurrency('labor')}
                                        >
                                            {sectionSettings.labor.currency === 'PEN' ? 'S/' : '$'}
                                        </span>
                                        {sectionTotals.labor.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <GlassTable
                            data={labor}
                            columns={['Rol', 'Pers.', 'Días', 'P. Día', 'Total']}
                            onUpdate={(id, field, value) => updateItem(setLabor, id, field, value)}
                            primaryColor="#FF7043"
                        />
                    </section>
                </div>

                {/* Grand Total End View */}
                <div className="bg-[#1A1D21] p-12 rounded-[40px] text-white flex justify-between items-center shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_80%_80%,#469F7A_0%,transparent_50%)]" />
                        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,#12C2E9_0%,transparent_50%)]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-[#469F7A] p-2 rounded-[10px]">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#469F7A]">Análisis Final Consolidado</span>
                        </div>
                        <h3 className="text-4xl font-[900] tracking-tighter uppercase italic leading-none mb-2">PRODAC ESTRUCTURA 2025</h3>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest max-w-md">
                            Este documento digital es privado. La edición en tiempo real está activa y los cambios se guardan localmente para auditoría inmediata.
                        </p>
                    </div>

                    <div className="text-right relative z-10">
                        <div className="mb-6">
                            <button
                                onClick={toggleCurrency}
                                className="text-[10px] uppercase font-black text-[#469F7A] tracking-[0.2em] mb-2 hover:opacity-80 transition-opacity"
                            >
                                Cambiar a {displayCurrency === 'PEN' ? 'Dólares' : 'Soles'}
                            </button>
                            <div className="text-6xl font-[900] tracking-tighter items-baseline gap-2">
                                <span className="text-2xl font-bold mr-2 text-white/50">{displayCurrency === 'PEN' ? 'S/' : '$'}</span>
                                {displayFinalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <button className="bg-white text-[#1A1D21] px-12 py-5 rounded-[24px] font-black uppercase tracking-tighter text-sm hover:scale-105 transition-all shadow-white/20 shadow-2xl flex items-center gap-4 ml-auto">
                            <Save size={20} />
                            Guardar y Cerrar Auditoría
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper UI Components ---

function GlassTable({ data, columns, onUpdate, primaryColor = '#1A1D21' }: {
    data: any[],
    columns: string[],
    onUpdate: (id: string, field: string, value: any) => void,
    primaryColor?: string
}) {
    return (
        <div className="bg-white/45 backdrop-blur-[25px] border border-white/80 rounded-[28px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                    <tr className="bg-white/20 border-b border-white/50 text-[9px] uppercase font-black tracking-widest text-[#2D3436]/40">
                        {columns.map((col: string, i: number) => (
                            <th key={col} className={`py-5 px-6 ${i === 0 ? 'w-[15%]' : i === 1 ? 'w-[40%]' : 'w-[15%] text-center'}`}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/50">
                    {data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/30 transition-colors">
                            <td className="px-6 py-5">
                                <span
                                    className="text-[10px] font-black font-mono tracking-tighter opacity-60 cursor-help"
                                    style={{ color: primaryColor }}
                                    title="Doble click para cambiar moneda"
                                    onDoubleClick={() => onUpdate(item.id, 'currency', item.currency === 'USD' ? 'PEN' : 'USD')}
                                >
                                    {item.currency === 'USD' ? '$' : (item.currency === 'PEN' ? 'S/' : (item.codigo || item.item || '-'))}
                                </span>
                            </td>
                            <td className="px-6 py-5 overflow-hidden">
                                <input
                                    type="text"
                                    value={item.descripcion || item.rol || ''}
                                    onChange={(e) => onUpdate(item.id, item.descripcion ? 'descripcion' : 'rol', e.target.value)}
                                    className="bg-transparent border-none text-[12px] font-[600] w-full focus:outline-none truncate"
                                />
                            </td>
                            <td className="px-6 py-5 text-center">
                                <input
                                    type="number"
                                    value={item.cantidad || 0}
                                    onChange={(e) => onUpdate(item.id, 'cantidad', parseFloat(e.target.value))}
                                    className="w-16 bg-white/40 border border-white/80 rounded-[10px] px-2 py-1.5 text-center text-[11px] font-[800] focus:ring-2 focus:ring-white outline-none"
                                />
                            </td>
                            <td className="px-6 py-5 text-center">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.precioUnit || item.pagoDia || item.dias || 0}
                                    onChange={(e) => onUpdate(item.id, item.precioUnit !== undefined ? 'precioUnit' : (item.pagoDia !== undefined ? 'pagoDia' : 'dias'), parseFloat(e.target.value))}
                                    className="w-20 bg-white/40 border border-white/80 rounded-[10px] px-2 py-1.5 text-center text-[11px] font-[800] focus:ring-2 focus:ring-white outline-none"
                                    style={{ color: primaryColor }}
                                />
                            </td>
                            <td className="px-6 py-5 text-right font-[800] text-xs tabular-nums">
                                <span
                                    className="text-[9px] text-gray-400 mr-1.5 cursor-pointer hover:text-green-600 transition-colors"
                                    onDoubleClick={() => onUpdate(item.id, 'currency', item.currency === 'USD' ? 'PEN' : 'USD')}
                                >
                                    {item.currency === 'USD' ? '$' : 'S/'}
                                </span>
                                {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
