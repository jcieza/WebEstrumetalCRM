'use client';

import React, { useState } from 'react';
import { Clock, Package, Truck, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductionOrder } from './types';
import PackingListModal from './modals/PackingListModal';
import OrderDetailsModal from './modals/OrderDetailsModal';
import TrackingModal from './modals/TrackingModal';

interface OrderCardProps {
    order: ProductionOrder;
    onUpdate?: () => void;
    onEdit?: (order: ProductionOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate, onEdit }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showPacking, setShowPacking] = useState(false);
    const [showTracking, setShowTracking] = useState(false);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'EN PROCESO': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'PENDIENTE': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'TERMINADO': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENTE': return '#ef4444';
            case 'ALTA': return '#f97316';
            case 'MEDIA': return '#eab308';
            default: return '#cbd5e1';
        }
    };

    const hasPintura = order.items?.some(i => i.description?.toUpperCase().includes('PINTURA')) || order.production_areas?.includes('PINTURA');

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card flex flex-col group relative border-none bg-white font-sans cursor-pointer hover:shadow-2xl transition-all h-full"
                onClick={() => setShowDetails(true)}
                style={{
                    borderLeft: `5px solid ${getPriorityColor(order.priority)}`,
                    backgroundColor: order.status === 'TERMINADO' ? '#f0fdfa' : 'white'
                }}
            >
                {/* Header Section */}
                <div className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex flex-col gap-2 flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500 tracking-tighter uppercase whitespace-nowrap">
                                    {order.id}
                                </span>
                                {order.priority === 'URGENTE' && (
                                    <div className="flex items-center gap-1">
                                        <Zap size={10} className="text-red-500 fill-current animate-pulse" />
                                        <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">Prioridad 1</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-black text-gray-800 text-sm leading-tight truncate group-hover:text-green-800 transition-colors uppercase tracking-tight" title={order.clientName}>
                                {order.clientName}
                            </h3>
                        </div>

                        {hasPintura && (
                            <div className="flex-shrink-0 bg-purple-600 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg shadow-purple-200 uppercase tracking-widest">
                                Pintura
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 bg-gray-50/50 p-2 rounded-xl border border-gray-50">
                        <Clock size={14} className="text-green-600" />
                        <span className="text-[10px] uppercase tracking-wide">Entrega: <span className="text-gray-900">{order.deliveryDate}</span></span>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 transition-all group-hover:bg-white group-hover:border-green-100">
                        <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-gray-400 uppercase tracking-[1px]">
                            <Package size={10} className="text-gray-300" />
                            Contenido Detallado
                        </div>
                        <div className="flex flex-col gap-2">
                            {order.items?.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-[11px]">
                                    <span className="truncate flex-1 pr-4 font-medium text-gray-600">
                                        <span className="text-gray-300 mr-2">•</span>{item.description}
                                    </span>
                                    <span className="font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                                        {item.qty} {item.unit}
                                    </span>
                                </div>
                            ))}
                            {(order.items?.length || 0) > 2 && (
                                <div className="text-[9px] font-bold text-green-700 mt-1 pl-4 uppercase tracking-[0.5px]">
                                    + {(order.items?.length || 0) - 2} ítems adicionales
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto px-6 pb-6">
                    <div className="h-px bg-gray-100 mb-6" />

                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                            {order.status}
                        </span>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); setShowTracking(true); }}
                                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-800 transition-all"
                            >
                                Track
                            </motion.button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowPacking(true); }}
                                className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                            >
                                <Truck size={18} />
                            </button>

                            {/* Progress Ring or Bar */}
                            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                                <div className="w-12 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${order.general_progress}%` }}
                                        className={`h-full rounded-full ${order.general_progress === 100 ? 'bg-emerald-500' : 'bg-green-600'}`}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-gray-900 w-[30px]">{order.general_progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modals using our new components */}
            {showDetails && (
                <OrderDetailsModal
                    order={order}
                    onClose={() => setShowDetails(false)}
                    onEdit={onEdit}
                />
            )}
            {showPacking && (
                <PackingListModal
                    order={order}
                    onClose={() => setShowPacking(false)}
                />
            )}
            {showTracking && (
                <TrackingModal
                    order={order}
                    onClose={() => setShowTracking(false)}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default OrderCard;
