'use client';

import React, { useState } from 'react';
import {
    Zap, Search, Plus, ArrowRight, Settings as SettingsIcon,
    MoreVertical, Play, Edit3, Trash2, Layout,
    Globe, Database, MessageSquare, Sparkles, RefreshCw
} from 'lucide-react';

const GemCard = ({ gem, onClick }: { gem: any, onClick: () => void }) => {
    const Icon = gem.icon === 'Search' ? Search :
        gem.icon === 'Globe' ? Globe :
            gem.icon === 'Database' ? Database :
                gem.icon === 'MessageSquare' ? MessageSquare : Zap;

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: gem.color || 'var(--primary)' }} />

            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: (gem.color || '#1B5E20') + '15' }}>
                    <Icon size={24} style={{ color: gem.color || '#1B5E20' }} />
                </div>
                <button className="text-gray-300 hover:text-gray-500">
                    <MoreVertical size={18} />
                </button>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-1">{gem.title}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed line-clamp-2">{gem.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: gem.color || '#1B5E20' }}>GEMA ACTIVA</span>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md text-[9px] font-black uppercase text-gray-600">
                        <Play size={10} fill="currentColor" /> Ejecutar
                    </div>
                    <div className="w-8 h-8 rounded-md bg-green-800 text-white flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm">
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const GemsPage = () => {
    const [gems, setGems] = useState([
        { id: 'auditor', title: 'Auditor de Facturas', description: 'Analiza PDFs de facturas para detectar discrepancias en precios y cantidades.', icon: 'Search', color: '#1B5E20' },
        { id: 'prospector', title: 'Buscador de Proyectos', description: 'Escanea el diario oficial y portales de noticias en busca de nuevas obras civiles.', icon: 'Globe', color: '#0D47A1' },
        { id: 'inventory', title: 'Optimizador Stock', description: 'Predice niveles críticos de inventario basado en el historial de producción.', icon: 'Database', color: '#FF8F00' },
        { id: 'chat', title: 'Asistente de Ventas', description: 'Entrenado con el catálogo técnico para responder consultas complejas vía WhatsApp.', icon: 'MessageSquare', color: '#7B1FA2' },
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <Sparkles size={28} className="text-green-800" /> Gems Store
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Motores de automatización e inteligencia personalizada</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md">
                    <Plus size={16} /> Crear Nueva Gema
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gems.map(gem => (
                    <GemCard key={gem.id} gem={gem} onClick={() => { }} />
                ))}

                {/* Add Card Placeholder */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-all cursor-pointer group min-h-[220px]">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-green-800 transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors text-center">Configurar nuevo flujo de automatización</span>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 flex-shrink-0">
                    <RefreshCw size={18} />
                </div>
                <div>
                    <div className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Estado del Motor AI</div>
                    <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest opacity-70">Gemini 1.5 Pro - Sincronizado hace 2 min</div>
                </div>
            </div>
        </div>
    );
};

export default GemsPage;
