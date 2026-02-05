'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import {
    Home, Package, Settings as SettingsIcon, Users, Factory,
    FileText, Truck, DollarSign, BarChart3, Calendar, ShoppingCart,
    ChevronUp, ChevronDown, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const [isTabletMode, setIsTabletMode] = useState(false);
    const [isPhoneMode, setIsPhoneMode] = useState(false);
    const [isMenuHidden, setIsMenuHidden] = useState(true);

    useEffect(() => {
        // Handle localStorage on client side
        setIsTabletMode(localStorage.getItem('tabletMode') === 'true');
        setIsPhoneMode(localStorage.getItem('phoneMode') === 'true');
        setIsMenuHidden(localStorage.getItem('phoneMenuHidden') === 'true');

        const handleResize = () => {
            const width = window.innerWidth;
            setIsPhoneMode(width < 768);
            setIsTabletMode(width >= 768 && width < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobileLayout = isTabletMode || isPhoneMode;
    const isCollapsed = activeTab === 'messages';
    const showSidebar = !isMobileLayout;

    // Widths
    const sidebarWidth = isCollapsed ? 80 : 260;

    const phoneNavItems = [
        { id: 'dashboard', label: 'Inicio', icon: Home, color: '#42A5F5' },
        { id: 'production', label: 'OP', icon: Factory, color: '#66BB6A' },
        { id: 'clients', label: 'Clientes', icon: Users, color: '#AB47BC' },
        { id: 'inventory', label: 'Stock', icon: Package, color: '#FF7043' },
        { id: 'quotations', label: 'Cotiz.', icon: FileText, color: '#26A69A' },
        { id: 'guides', label: 'Guías', icon: Truck, color: '#5C6BC0' },
        { id: 'cash-receipts', label: 'Caja', icon: DollarSign, color: '#EF5350' },
        { id: 'purchases', label: 'Compras', icon: ShoppingCart, color: '#8D6E63' },
        { id: 'reports', label: 'Reportes', icon: BarChart3, color: '#00ACC1' },
        { id: 'messages', label: 'Chat', icon: Home, color: '#42A5F5' }, // WhatsApp uses Home icon often or MessageSquare
        { id: 'emails', label: 'Mail', icon: Mail, color: '#10B981' },
        { id: 'settings', label: 'Ajustes', icon: SettingsIcon, color: '#78909C' },
    ];

    const toggleMenu = () => {
        const next = !isMenuHidden;
        setIsMenuHidden(next);
        localStorage.setItem('phoneMenuHidden', String(next));
    };

    return (
        <div className={`flex min-h-screen ${isMobileLayout ? 'flex-col' : 'flex-row'}`}>
            {showSidebar && (
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    collapsed={isCollapsed}
                />
            )}

            <main
                className="flex-1 transition-all duration-300 min-h-screen relative overflow-x-hidden"
                style={{
                    marginLeft: showSidebar ? sidebarWidth : 0,
                    padding: isPhoneMode ? '6px' : '25px',
                    paddingBottom: isMobileLayout ? 140 : 25,
                    backgroundColor: 'var(--bg-main)'
                }}
            >
                <div>
                    {children}
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <AnimatePresence>
                {isMobileLayout && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] overflow-hidden"
                        style={{
                            backgroundColor: 'white',
                            height: isPhoneMode ? (isMenuHidden ? 40 : 130) : 75
                        }}
                    >
                        {isPhoneMode ? (
                            <div className="flex flex-col w-full h-full">
                                <button
                                    onClick={toggleMenu}
                                    className="flex items-center justify-center gap-2 w-full p-2 text-gray-400 hover:text-gray-600 border-b border-gray-100/50"
                                >
                                    {isMenuHidden ? (
                                        <>
                                            {(() => {
                                                const active = phoneNavItems.find(i => i.id === activeTab);
                                                if (active) {
                                                    const Icon = active.icon;
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <Icon size={16} color={active.color} />
                                                            <span className="text-[10px] font-bold" style={{ color: active.color }}>{active.label}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <ChevronUp size={16} />
                                        </>
                                    ) : <ChevronDown size={16} />}
                                </button>

                                <div className="grid grid-cols-5 gap-1 p-2 flex-grow">
                                    {phoneNavItems.slice(0, 10).map(item => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        if (isMenuHidden && !isActive) return null;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id); if (!isMenuHidden) toggleMenu(); }}
                                                className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all ${isActive ? 'scale-110 shadow-sm' : 'opacity-60'}`}
                                                style={{ color: isActive ? item.color : '#888' }}
                                            >
                                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                                {!isMenuHidden && <span className="text-[9px] font-medium truncate w-full text-center mt-1">{item.label}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-around items-center w-full h-full p-2">
                                {phoneNavItems.slice(0, 5).map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className="flex flex-col items-center gap-1"
                                            style={{ color: isActive ? 'var(--primary)' : '#666' }}
                                        >
                                            <Icon size={24} />
                                            <span className="text-[10px] font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
