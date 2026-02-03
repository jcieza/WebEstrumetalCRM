'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, CheckCircle2, MessageSquare } from 'lucide-react';
import { ProductionOrder, ProductionItem } from '../types';

interface TrackingModalProps {
    order: ProductionOrder;
    onClose: () => void;
    onUpdate?: () => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ order, onClose, onUpdate }) => {
    const [itemsTracking, setItemsTracking] = useState<ProductionItem[]>(order.items || []);
    const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    const handleUpdateItem = (idx: number, fields: Partial<ProductionItem>) => {
        const newItems = [...itemsTracking];
        newItems[idx] = { ...newItems[idx], ...fields };
        setItemsTracking(newItems);
    };

    const handleToggleProcess = (itemIdx: number, procIdx: number) => {
        const newItems = [...itemsTracking];
        const item = { ...newItems[itemIdx] };
        const processes = [...(item.processes || [])];
        processes[procIdx] = { ...processes[procIdx], completed: !processes[procIdx].completed };
        item.processes = processes;
        newItems[itemIdx] = item;
        setItemsTracking(newItems);
    };

    const handleSave = () => {
        // Placeholder for Firestore update
        alert(`🚧 Sincronizando seguimiento para ${order.id}...`);
        onClose();
        if (onUpdate) onUpdate();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 relative"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50/20">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Seguimiento Dinámico</h3>
                            <p className="text-xs text-gray-400 font-mono mt-0.5 tracking-widest">{order.id} | {order.client_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-gray-50/20">
                        <div className="flex flex-col gap-4">
                            {itemsTracking.map((item, idx) => (
                                <div key={idx} className="glass-card p-6 bg-white border-none shadow-sm flex flex-col gap-4 group hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-10 rounded-full ${item.progress?.packed ? 'bg-emerald-500' : 'bg-gray-100 group-hover:bg-green-200'} transition-colors`}></div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{item.description}</p>
                                                <p className="text-[11px] text-gray-400 font-bold uppercase mt-1 tracking-wider">{item.qty} {item.unit}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.qty || 0} // Using qty for progress in this placeholder demo logic
                                                onChange={(e) => handleUpdateItem(idx, { qty: parseInt(e.target.value) })}
                                                className="w-12 bg-transparent text-center font-black text-green-700 text-sm outline-none"
                                            />
                                            <span className="text-[10px] font-black text-gray-400 mr-1">%</span>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div className="relative">
                                        <MessageSquare size={14} className="absolute left-3 top-3 text-gray-300" />
                                        <textarea
                                            placeholder="Detalles técnicos o incidencias..."
                                            value={item.production_comment || ''}
                                            onChange={(e) => handleUpdateItem(idx, { production_comment: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 rounded-2xl text-xs outline-none border border-transparent focus:border-green-200 focus:bg-white transition-all min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Processes */}
                                    {item.processes && item.processes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {item.processes.map((p, pIdx) => (
                                                <button
                                                    key={pIdx}
                                                    onClick={() => handleToggleProcess(idx, pIdx)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-2 transition-all ${p.completed ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white border-gray-200 text-gray-500 hover:border-green-400'}`}
                                                >
                                                    {p.completed && <CheckCircle2 size={12} />}
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => { setSelectedItemIdx(idx); setShowConfig(true); }}
                                        className="text-[10px] font-bold text-green-600 flex items-center gap-1.5 hover:underline w-fit"
                                    >
                                        <Settings size={12} />
                                        CONFIGURAR PROCESOS INDUSTRIALES
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-3 border border-gray-100 rounded-2xl font-bold text-sm text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
                        <button onClick={handleSave} className="px-8 py-3 bg-green-700 text-white rounded-2xl font-bold text-sm hover:bg-green-800 transition-all shadow-xl shadow-green-700/20">Guardar Cambios</button>
                    </div>

                    {/* Nested Process Config Overlay */}
                    <AnimatePresence>
                        {showConfig && selectedItemIdx !== null && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="absolute inset-0 bg-white z-50 flex flex-col"
                            >
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-gray-800 uppercase tracking-tight text-lg">Configurar Procesos</h4>
                                        <p className="text-xs text-gray-400 mt-1">{itemsTracking[selectedItemIdx].description}</p>
                                    </div>
                                    <button onClick={() => setShowConfig(false)} className="p-3 bg-gray-50 rounded-2xl"><X size={24} /></button>
                                </div>
                                <div className="p-8 flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">Selecciona los pasos críticos requeridos para la fabricación de este ítem. Estos aparecerán en el flujo de trabajo del tablero.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {['Corte', 'Doblez', 'Armado', 'Soldadura', 'Esmerilado', 'Pintura', 'Embalaje', 'Lijado', 'Zincado', 'Galvanizado'].map(proc => {
                                            const isSelected = (itemsTracking[selectedItemIdx].processes || []).some(p => p.name === proc);
                                            return (
                                                <button
                                                    key={proc}
                                                    onClick={() => {
                                                        const item = itemsTracking[selectedItemIdx];
                                                        const processes = [...(item.processes || [])];
                                                        if (isSelected) {
                                                            handleUpdateItem(selectedItemIdx, { processes: processes.filter(p => p.name !== proc) });
                                                        } else {
                                                            handleUpdateItem(selectedItemIdx, { processes: [...processes, { name: proc, completed: false }] });
                                                        }
                                                    }}
                                                    className={`p-4 rounded-2xl text-xs font-bold border transition-all text-center ${isSelected ? 'bg-green-700 border-green-700 text-white shadow-xl shadow-green-700/30' : 'bg-white border-gray-100 text-gray-600 hover:border-green-300'}`}
                                                >
                                                    {proc}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="p-8 border-t border-gray-100 text-right">
                                    <button onClick={() => setShowConfig(false)} className="px-12 py-4 bg-green-700 text-white rounded-2xl font-black text-sm hover:ring-8 hover:ring-green-100 transition-all">FINALIZAR CONFIGURACIÓN</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TrackingModal;
