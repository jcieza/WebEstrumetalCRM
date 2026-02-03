'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import OrderCard from './OrderCard';
import { Package, AlertTriangle } from 'lucide-react';
import { ProductionOrder } from './types';

interface ProductionBoardProps {
    onEdit?: (order: ProductionOrder) => void;
}

const ProductionBoard: React.FC<ProductionBoardProps> = ({ onEdit }) => {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            setError(null);
            // In the future, this will fetch from Firestore
            const q = query(collection(db, 'production_orders'), orderBy('delivery_date', 'asc'));
            const querySnapshot = await getDocs(q);
            const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionOrder));

            if (ordersData.length === 0) {
                // Mock data for demonstration
                setOrders([
                    {
                        id: 'OP-024-2026',
                        client_id: 'CL-001',
                        client_name: 'Aceros Industriales SAC',
                        emission_date: '2026-02-01',
                        delivery_date: '2026-02-15',
                        priority: 'URGENTE',
                        status: 'EN PROCESO',
                        general_progress: 45,
                        items: [
                            { description: 'VIGAS EN H 10"', qty: 4, unit: 'unid', processes: [{ name: 'Corte', completed: true }, { name: 'Soldadura', completed: false }] },
                            { description: 'PLACAS BASE 1/2"', qty: 12, unit: 'unid', progress: { packed: true } }
                        ]
                    },
                    {
                        id: 'OP-025-2026',
                        client_id: 'CL-002',
                        client_name: 'Constructora del Sur',
                        emission_date: '2026-02-02',
                        delivery_date: '2026-02-20',
                        priority: 'MEDIA',
                        status: 'PENDIENTE',
                        general_progress: 10,
                        items: [
                            { description: 'TUBO CUADRADO 2"', qty: 50, unit: 'barras' }
                        ]
                    }
                ]);
            } else {
                setOrders(ordersData);
            }
        } catch (err) {
            console.error("Error fetching board:", err);
            setError("Error al cargar el tablero de producción.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando Tablero...</p>
        </div>
    );

    if (error) return (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-xl shadow-red-100">
                <AlertTriangle size={32} />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Error de Conectividad</h3>
                <p className="text-gray-500 text-sm mt-2">{error}</p>
            </div>
            <button
                onClick={fetchOrders}
                className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-200"
            >
                Reintentar Conexión
            </button>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {orders.length === 0 ? (
                    <div className="glass-card p-20 flex flex-col items-center justify-center text-center gap-6 border-none bg-white">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-xl shadow-green-100">
                            <Package size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Planta en Reposo</h3>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                                No se detectaron órdenes de producción activas en el sistema. Es el momento perfecto para organizar nuevos proyectos.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdate={fetchOrders}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductionBoard;
