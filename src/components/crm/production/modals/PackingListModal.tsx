'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { ProductionOrder } from '../types';

interface PackingListModalProps {
    order: ProductionOrder;
    onClose: () => void;
}

const PackingListModal: React.FC<PackingListModalProps> = ({ order, onClose }) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br from-green-50/50 to-transparent">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Packing List</h3>
                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">{order.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                        <div className="flex flex-col gap-3">
                            {order.items && order.items.map((item, idx) => {
                                const isPacked = item.progress?.packed;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${isPacked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPacked ? 'bg-green-500 border-green-500' : 'border-gray-200 bg-white'}`}>
                                                {isPacked && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{item.description}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">{item.qty} {item.unit}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${isPacked ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {isPacked ? 'Listo' : 'Pendiente'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PackingListModal;
