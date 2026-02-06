'use client';

import React, { useState } from 'react';
import {
    BarChart3, Download, Calendar, Filter, TrendingUp, TrendingDown,
    DollarSign, Package, Users, FileText, Clock, Target, PieChart,
    ArrowUp, ArrowDown, RefreshCw, Printer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts';

const KPICard = ({ label, value, change, positive, icon: Icon }: any) => (
    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-green-800">
                <Icon size={20} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {change}
            </div>
        </div>
        <div className="text-2xl font-black text-gray-800 tracking-tight">{value}</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
);

const ReportsPage = () => {
    const [period, setPeriod] = useState('month');
    const [reportType, setReportType] = useState('sales');

    const reports = [
        { id: 'sales', name: 'Ventas por Cliente', icon: DollarSign },
        { id: 'production', name: 'Producción por Área', icon: Package },
        { id: 'clients', name: 'Actividad de Clientes', icon: Users },
        { id: 'quotes', name: 'Conversión Cotizaciones', icon: FileText },
        { id: 'delivery', name: 'Tiempos de Entrega', icon: Clock },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <BarChart3 size={28} className="text-green-800" /> Reportes & Analytics
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Análisis de rendimiento industrial</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all">
                        <RefreshCw size={14} /> Actualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all">
                        <Download size={14} /> PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {['week', 'month', 'quarter', 'year'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${period === p ? 'bg-green-800 text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
                        >
                            {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-full md:w-auto">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Dic 1, 2025 - Dic 14, 2025</span>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Ventas del Mes" value="S/ 125,400" change="+12%" positive={true} icon={DollarSign} />
                <KPICard label="Órdenes Producción" value="24" change="+5" positive={true} icon={Package} />
                <KPICard label="Clientes Activos" value="18" change="-2" positive={false} icon={Users} />
                <KPICard label="Conversión" value="68%" change="+4%" positive={true} icon={Target} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Reports Navigation */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Seleccionar Informe</h3>
                    {reports.map(report => (
                        <button
                            key={report.id}
                            onClick={() => setReportType(report.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${reportType === report.id ? 'bg-green-800 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <report.icon size={16} />
                            <span className="text-[11px] font-bold uppercase tracking-tight">{report.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Report Content */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">Tendencia de {reports.find(r => r.id === reportType)?.name}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><Clock size={12} /> Tiempo Real</div>
                        </div>
                        <div className="h-[350px] w-full relative" style={{ minWidth: '0', minHeight: '350px' }}>
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={[
                                    { name: 'L', v: 400 }, { name: 'M', v: 300 }, { name: 'M', v: 550 },
                                    { name: 'J', v: 480 }, { name: 'V', v: 620 }, { name: 'S', v: 210 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="v" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-700 mb-6">Distribución por Categoría</h4>
                            <div className="h-[200px] w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-[10px] font-bold text-gray-300 uppercase italic">
                                Gráfico Circular Técnico
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-700 mb-6">Comparativa Anual</h4>
                            <div className="h-[200px] w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-[10px] font-bold text-gray-300 uppercase italic">
                                Análisis de Tendencias
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
