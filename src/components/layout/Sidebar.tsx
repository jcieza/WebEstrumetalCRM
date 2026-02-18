'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Users, FileInput, MessageSquare, Settings,
    Truck, Globe, FileText, Package, BarChart3,
    Calendar, Scroll, Wallet, ShoppingCart, Zap, LogOut, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed = false }) => {
    const { user, logout } = useAuth();
    const [showGeminiChat, setShowGeminiChat] = useState(true);
    const [showGems, setShowGems] = useState(true);

    useEffect(() => {
        const storedChat = localStorage.getItem('showGeminiChat');
        setShowGeminiChat(storedChat !== 'false');

        const storedGems = localStorage.getItem('showGems');
        setShowGems(storedGems !== 'false');

        const handleStorage = () => {
            setShowGeminiChat(localStorage.getItem('showGeminiChat') !== 'false');
            setShowGems(localStorage.getItem('showGems') !== 'false');
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const allMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'gems', label: 'Cliente Finder (Gems)', icon: Zap, requiresSetting: 'showGems' },
        { id: 'market-intelligence', label: 'Intel. Comercial', icon: Globe },
        { id: 'production', label: 'Producción (OP)', icon: FileInput },
        { id: 'cost-structure', label: 'Estructura Costos', icon: BarChart3 },
        { id: 'clients', label: 'Clientes 360°', icon: Users },
        { id: 'quotations', label: 'Cotizaciones', icon: FileText },
        { id: 'guides', label: 'Guías Internas', icon: Scroll },
        { id: 'cash-receipts', label: 'Caja Administrativa', icon: Wallet },
        { id: 'inventory', label: 'Inventario', icon: Package },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'reports', label: 'Reportes', icon: BarChart3 },
        { id: 'suppliers', label: 'Proveedores', icon: Truck },
        { id: 'purchases', label: 'Compras', icon: ShoppingCart },
        { id: 'messages', label: 'WhatsApp CRM', icon: MessageSquare },
        { id: 'emails', label: 'Centro de Correos', icon: Mail },
        { id: 'ingestor', label: 'Ingestor IA', icon: FileInput },
        { id: 'chat', label: 'Gemini Chat', icon: MessageSquare, requiresSetting: 'geminiChat' },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (item.requiresSetting === 'geminiChat' && !showGeminiChat) return false;
        if (item.requiresSetting === 'showGems' && !showGems) return false;
        return true;
    });

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 80 : 260 }}
            className="fixed left-0 top-0 h-screen text-white flex flex-col z-50 overflow-hidden"
            style={{
                background: 'var(--bg-sidebar)',
                boxShadow: '4px 0 20px rgba(0,0,0,0.2)'
            }}
        >
            {/* Logo Area */}
            <div className={`mb-8 flex items-center gap-3 p-6 ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-green-800 font-bold text-xl flex-shrink-0 cursor-pointer shadow-md">
                    E
                </div>
                {!collapsed && (
                    <div className="whitespace-nowrap overflow-hidden">
                        <h2 className="font-bold text-lg tracking-tight">Estrumetal</h2>
                        <span className="text-[10px] opacity-60 uppercase tracking-widest block -mt-1 font-medium">Smart CRM</span>
                    </div>
                )}
            </div>

            {/* Menu */}
            <div className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            title={collapsed ? item.label : undefined}
                            className={`
                                flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                                ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                                ${collapsed ? 'justify-center' : 'justify-start'}
                            `}
                            style={{
                                borderLeft: isActive ? '4px solid #4FD1C5' : '4px solid transparent',
                            }}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {!collapsed && (
                                <span className="text-sm">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/10 p-2 flex flex-col gap-1">
                {user && !collapsed && (
                    <div className="px-3 py-4 flex items-center gap-3 border-b border-white/5 mb-2">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-bold truncate leading-none mb-1">{user.displayName || 'Usuario'}</p>
                            <p className="text-[9px] text-white/40 truncate leading-none uppercase tracking-tighter">Administrador</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`
                        flex items-center gap-3 p-3 rounded-lg w-full transition-all
                        ${activeTab === 'settings' ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                        ${collapsed ? 'justify-center' : 'justify-start'}
                    `}
                    style={{
                        borderLeft: activeTab === 'settings' ? '4px solid #4FD1C5' : '4px solid transparent',
                    }}
                >
                    <Settings size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Configuración</span>}
                </button>

                <button
                    onClick={logout}
                    className={`
                        flex items-center gap-3 p-3 rounded-lg w-full transition-all text-red-300 hover:bg-red-500/10 hover:text-red-200
                        ${collapsed ? 'justify-center' : 'justify-start'}
                    `}
                    style={{ borderLeft: '4px solid transparent' }}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
