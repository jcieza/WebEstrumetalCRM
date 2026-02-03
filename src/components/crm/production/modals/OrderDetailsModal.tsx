'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Package } from 'lucide-react';
import { ProductionOrder } from '../types';

interface OrderDetailsModalProps {
    order: ProductionOrder;
    onClose: () => void;
    onEdit?: (order: ProductionOrder) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onEdit }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'EN PROCESO': return 'bg-blue-100/50 text-blue-600 border-blue-200';
            case 'PENDIENTE': return 'bg-orange-100/50 text-orange-600 border-orange-200';
            case 'TERMINADO': return 'bg-emerald-100/50 text-emerald-600 border-emerald-200';
            case 'ENTREGADO': return 'bg-purple-100/50 text-purple-600 border-purple-200';
            case 'DETENIDO': return 'bg-red-100/50 text-red-600 border-red-200';
            default: return 'bg-gray-100/50 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENTE': return '#ef4444';
            case 'ALTA': return '#f97316';
            case 'MEDIA': return '#eab308';
            default: return '#94a3b8';
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br from-green-50/30 to-transparent">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">Detalle de Orden</h2>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">{order.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto no-scrollbar flex-1 bg-gray-50/30">
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-card p-6 border-none shadow-sm bg-white">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Cliente</label>
                                <p className="text-lg font-bold text-gray-800 leading-tight">{order.client_name}</p>
                                <p className="text-xs text-gray-500 mt-1">{order.client_id}</p>
                            </div>
                            <div className="glass-card p-6 border-none shadow-sm bg-white">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Entrega</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                        <Clock size={16} />
                                    </div>
                                    <span className="text-lg font-bold text-gray-800">{order.delivery_date}</span>
                                </div>
                            </div>
                            <div className="glass-card p-6 border-none shadow-sm bg-white">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Prioridad</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-lg pulse" style={{ backgroundColor: getPriorityColor(order.priority) }}></div>
                                    <span className="text-lg font-bold text-gray-800 tracking-tight">{order.priority || 'Programado'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="glass-card p-8 border-none shadow-sm bg-white mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progreso General</label>
                                <span className="text-4xl font-black text-green-700 tracking-tighter">{order.general_progress}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${order.general_progress}%` }}
                                    className={`h-full rounded-full ${order.general_progress === 100 ? 'bg-emerald-500' : 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.3)]'}`}
                                />
                            </div>
                        </div>

                        {/* Items Section */}
                        <div>
                            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                                    Ítems de Producción ({order.items?.length || 0})
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="glass-card p-6 border-none shadow-sm bg-white hover:border-gray-100 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                                    <Package size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm group-hover:text-green-800 transition-colors">{item.description}</p>
                                                    <p className="text-xs text-gray-500 font-medium mt-1">{item.qty} {item.unit}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold bg-gray-50 px-3 py-1.5 rounded-lg text-gray-500 uppercase tracking-wider">
                                                {item.processes?.length || 0} Pasos
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
                        >
                            Cerrar Panel
                        </button>
                        <button
                            onClick={() => { onClose(); if (onEdit) onEdit(order); }}
                            className="px-8 py-3.5 bg-green-700 text-white rounded-2xl font-bold text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-700/20 active:scale-95"
                        >
                            Editar Orden
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
