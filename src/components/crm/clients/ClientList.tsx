'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Globe, MoreHorizontal, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Client } from './types';
import { motion } from 'framer-motion';

interface ClientListProps {
    onNavigate: (tab: string, clientId: string | null) => void;
}

const ClientList: React.FC<ClientListProps> = ({ onNavigate }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            const data = await res.json();

            // Map data to ensure dna and other nested fields exist
            const formatted = data.map((c: any) => ({
                ...c,
                dna: c.dna || { segment: 'Nuevo', preferences: [] },
                ruc: c.ruc || 'S/N',
                address: c.address || 'Sin dirección'
            }));

            setClients(formatted);
        } catch (err) {
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ruc?.includes(searchTerm)
    );

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Cartera de <span className="text-green-700">Clientes</span></h1>
                    <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest text-xs">Gestión Estratégica y ADN Comercial</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={16} />
                        </div>
                        <span className="text-sm font-black text-blue-800 uppercase tracking-tighter">
                            {clients.length} Clientes Activos
                        </span>
                    </div>
                    <button className="px-8 py-3.5 bg-green-700 text-white rounded-2xl font-black text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-700/20 active:scale-95 uppercase tracking-widest">
                        + Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscador inteligente por Empresa, RUC o Ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-8 focus:ring-green-50 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                />
            </div>

            {/* Client Grid/List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-4">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-gray-400">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Empresa</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">RUC / Registro</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px]">Segmento</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[2px] text-right">Análisis 360°</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Consultando Dataset...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No se encontraron registros coincidentes</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <motion.tr
                                        layout
                                        key={client.id}
                                        className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                                        onClick={() => onNavigate('clients', client.id)}
                                    >
                                        <td className="px-8 py-6 rounded-l-3xl bg-white border-y border-l border-gray-100 group-hover:border-green-100 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all border border-gray-100 group-hover:border-green-200">
                                                    <Globe size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-lg tracking-tight group-hover:text-green-800 transition-colors">{client.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 border border-gray-100 bg-gray-50/50 w-fit px-2 py-0.5 rounded shadow-sm">{client.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <p className="font-mono text-sm font-bold text-gray-600">{client.ruc || 'S/N'}</p>
                                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px] mt-1">{client.address}</p>
                                        </td>
                                        <td className="px-8 py-6 bg-white border-y border-gray-100 group-hover:border-green-100 transition-colors">
                                            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {client.dna.segment}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 rounded-r-3xl bg-white border-y border-r border-gray-100 group-hover:border-green-100 transition-colors text-right">
                                            <button
                                                className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-green-700 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm"
                                            >
                                                <ExternalLink size={20} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientList;
