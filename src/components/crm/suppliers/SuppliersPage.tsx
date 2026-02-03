'use client';

import React, { useState, useEffect } from 'react';
import {
    Truck, Phone, Mail, Plus, Edit, Trash2, Search,
    Download, Upload, RefreshCw, ExternalLink, Factory, Package, Wrench, ShoppingBag, Clock
} from 'lucide-react';

const PROVIDER_TYPES = [
    { value: 'Fabricante', label: 'Fabricante', icon: Factory, color: '#7B1FA2', bg: '#F3E5F5', desc: 'Fuente directa' },
    { value: 'Distribuidor', label: 'Distribuidor', icon: RefreshCw, color: '#E65100', bg: '#FFF3E0', desc: 'Intermediario' },
    { value: 'Materia Prima', label: 'Materia Prima', icon: Package, color: '#1565C0', bg: '#E3F2FD', desc: 'Insumos base' },
    { value: 'Consumibles', label: 'Consumibles', icon: ShoppingBag, color: '#2E7D32', bg: '#E8F5E9', desc: 'Uso diario' },
    { value: 'Servicios', label: 'Servicios', icon: Wrench, color: '#455A64', bg: '#ECEFF1', desc: 'Tercerización' },
];

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [formData, setFormData] = useState({
        id: '', name: '', ruc: '', category: '', contact: '', phone: '', email: '', provider_type: 'Fabricante'
    });

    useEffect(() => {
        // Mock data for demonstration
        setSuppliers([
            { id: '1', name: 'Aceros Arequipa', ruc: '20100077221', category: 'Acero Corrugado', contact: 'Juan Pérez', phone: '987654321', email: 'ventas@aceros.com', provider_type: 'Fabricante' },
            { id: '2', name: 'Sodimac Perú', ruc: '20164113532', category: 'Ferretería General', contact: 'Maria Smith', phone: '912345678', email: 'contacto@sodimac.com', provider_type: 'Distribuidor' },
        ]);
        setLoading(false);
    }, []);

    const getTypeConfig = (type: string) => PROVIDER_TYPES.find(t => t.value === type) || PROVIDER_TYPES[0];

    const filteredSuppliers = suppliers.filter(s => {
        const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterType === 'all' || s.provider_type === filterType;
        return matchSearch && matchFilter;
    });

    const stats = {
        total: suppliers.length,
        fabricantes: suppliers.filter(s => s.provider_type === 'Fabricante').length,
        distribuidores: suppliers.filter(s => s.provider_type === 'Distribuidor').length
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <Truck size={28} className="text-green-800" /> Directorio de Proveedores
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Gestión de cadena de suministro</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 transition-all">
                        <Download size={14} /> Exportar
                    </button>
                    <button
                        onClick={() => { setIsEditing(false); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg text-[10px] font-black uppercase hover:bg-green-900 transition-all shadow-md"
                    >
                        <Plus size={14} /> Nuevo Proveedor
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Proveedores', value: stats.total, icon: Truck, color: '#1565C0' },
                    { label: 'Fabricantes Directos', value: stats.fabricantes, icon: Factory, color: '#7B1FA2' },
                    { label: 'Distribuidores', value: stats.distribuidores, icon: RefreshCw, color: '#E65100' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}10` }}>
                            <kpi.icon size={22} style={{ color: kpi.color }} />
                        </div>
                        <div>
                            <div className="text-xl font-black text-gray-800">{kpi.value}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Section */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center bg-gray-50/30">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="FILTRAR POR NOMBRE O CATEGORÍA..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-green-500/10 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-green-800 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                        >
                            Todos
                        </button>
                        {PROVIDER_TYPES.slice(0, 3).map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${filterType === type.value ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                            >
                                <type.icon size={11} /> {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="p-4">Proveedor / RUC</th>
                                <th className="p-4">Tipo de Enlace</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Contacto / Info</th>
                                <th className="p-4 text-right">Acciones Técnicas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSuppliers.map((sup) => {
                                const typeConfig = getTypeConfig(sup.provider_type);
                                const TypeIcon = typeConfig.icon;
                                return (
                                    <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="text-xs font-black text-gray-700 uppercase">{sup.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">RUC: {sup.ruc || 'S/I'}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-black uppercase" style={{ backgroundColor: `${typeConfig.color}15`, color: typeConfig.color }}>
                                                <TypeIcon size={12} /> {sup.provider_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md border border-blue-100">
                                                {sup.category || 'GENERAL'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-bold text-gray-600">{sup.contact || 'S/C'}</div>
                                            <div className="flex gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase"><Phone size={10} /> {sup.phone || '-'}</span>
                                                <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase"><Mail size={10} /> {sup.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Editar"><Edit size={14} /></button>
                                                <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Historial"><Clock size={14} /></button>
                                                <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Enlace Externo"><ExternalLink size={14} /></button>
                                                <button className="p-2 hover:bg-red-50 rounded-md text-red-500 transition-colors" title="Quitar"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Simplified Placeholder for now as per instructions to move fast */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{isEditing ? 'Configurar Proveedor' : 'Alta de Nuevo Proveedor'}</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-full animate-bounce">🏗️</div>
                                <div className="text-xs font-black uppercase tracking-widest leading-relaxed">
                                    Formulario técnico en construcción<br />
                                    <span className="font-normal opacity-60">Sincronizando con Maestro de Materiales</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="px-6 py-2 bg-green-800 text-white text-[10px] font-black uppercase rounded-lg hover:bg-green-900 shadow-md transition-all opacity-50 cursor-not-allowed"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;
