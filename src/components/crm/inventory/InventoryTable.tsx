'use client';

import React from 'react';
import { Edit2, Trash2, Eye, AlertTriangle, Package } from 'lucide-react';
import { InventoryItem } from './types';
import { motion } from 'framer-motion';

interface InventoryTableProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onView: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onView, onDelete }) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] border-b border-gray-100">Material</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] border-b border-gray-100">Categoría</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] border-b border-gray-100 text-center">Stock</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] border-b border-gray-100">Ubicación</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[1.5px] border-b border-gray-100 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Package size={40} className="text-gray-200" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No se encontraron materiales</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <motion.tr
                                    layout
                                    key={item.id}
                                    className="hover:bg-green-50/30 transition-colors group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            {item.image_path ? (
                                                <img
                                                    src={item.image_path}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight group-hover:text-green-800 transition-colors">{item.name}</p>
                                                <p className="text-[10px] font-mono text-gray-400 uppercase mt-1 tracking-wider">{item.code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-black ${item.low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.stock}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</span>
                                            </div>
                                            {item.low_stock && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <AlertTriangle size={10} className="text-red-500" />
                                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Bajo Stock</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">{item.location_id || 'Sin Asignar'}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{item.warehouse_area}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onView(item)}
                                                className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                title="Ver Detalles"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id)}
                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTable;
