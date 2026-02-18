'use client';

import React, { useState } from 'react';
import {
    Send, Bot, User, Sparkles, Search, Phone, Video, MoreVertical,
    Pin, BellOff, Archive, Trash2, Star, Tag, MessageSquare,
    Paperclip, Image, Mic, Smile, Zap, Clock, Check, CheckCheck,
    Users, Filter, Plus, RefreshCw, Download, FileText, Package,
    DollarSign, Calendar, Settings, ChevronDown, X, Copy, Forward,
    Reply, Edit3, Link, QrCode, Wifi, WifiOff, Circle
} from 'lucide-react';

const WhatsAppPage = () => {
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    React.useEffect(() => {
        const checkConnection = () => {
            const connected = localStorage.getItem('whatsapp_connected') === 'true';
            setIsConnected(connected);
            setCheckingStatus(false);
        };
        checkConnection();
        window.addEventListener('storage', checkConnection);
        return () => window.removeEventListener('storage', checkConnection);
    }, []);

    const chats = [
        { id: 1, name: 'Juan Diego (SHOPSMART)', last: 'El precio está un poco alto...', time: '10:45', unread: 2, avatar: 'JD' },
        { id: 2, name: 'María García (TEXTILES SAC)', last: 'Confirmado para el lunes', time: '09:30', unread: 0, avatar: 'MG' },
        { id: 3, name: 'Pedro Mendoza', last: 'Foto del producto adjunta', time: 'AYER', unread: 0, avatar: 'PM' },
    ];

    if (checkingStatus) {
        return (
            <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-lg">
                <RefreshCw size={32} className="text-green-800 animate-spin opacity-20" />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="h-[calc(100vh-140px)] bg-white border border-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_20%_20%,#f0fdf4_0%,transparent_50%)]">
                <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center text-green-800 mb-8 shadow-inner">
                    <QrCode size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-[900] text-gray-800 uppercase tracking-tighter mb-4 italic">Vinculación de WhatsApp CRM</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-sm mb-12 leading-loose">
                    Para habilitar el CRM de mensajería, debes configurar tu instancia de Evolution API y escanear el código QR de vinculación.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}
                        className="px-12 py-4 bg-green-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 hover:scale-105 transition-all"
                    >
                        Configurar Integración
                    </button>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Requiere Evolution API v2.0+</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] border border-gray-100 rounded-lg shadow-lg overflow-hidden bg-white">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Chats</h2>
                        <div className="flex gap-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded-md transition-all"><Plus size={18} /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-md transition-all"><RefreshCw size={16} /></button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="BUSCAR CHAT..."
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-md text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-green-800"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 flex gap-3 cursor-pointer transition-all border-b border-gray-50 ${selectedChat?.id === chat.id ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-green-800 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">
                                {chat.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-[11px] font-black text-gray-800 uppercase truncate pr-2">{chat.name}</span>
                                    <span className="text-[9px] font-bold text-gray-400">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-medium text-gray-500 truncate">
                                    {chat.last}
                                    {chat.unread > 0 && (
                                        <span className="ml-2 w-4 h-4 bg-green-800 text-white rounded-full flex items-center justify-center text-[8px] font-black">{chat.unread}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 justify-center">
                    <Wifi size={14} className="text-green-600" />
                    <span className="text-[9px] font-black text-green-800 uppercase tracking-widest">Servidor Evolution Conectado</span>
                </div>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-[#E5DDD5]">
                    {/* Chat Header */}
                    <div className="p-3 bg-[#075E54] text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black">{selectedChat.avatar}</div>
                            <div>
                                <div className="text-xs font-black uppercase tracking-tight">{selectedChat.name}</div>
                                <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest">En línea</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Phone size={18} />
                            <Video size={18} />
                            <Search size={18} />
                            <MoreVertical size={18} />
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                        <div className="self-start max-w-[70%] bg-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm">
                            <p className="text-[12px] text-gray-800 leading-normal">Hola, recibí la cotización #045, pero el precio está un poco alto para mi presupuesto actual.</p>
                            <span className="text-[9px] font-bold text-gray-400 block text-right mt-1 uppercase">10:30 AM</span>
                        </div>
                        <div className="self-end max-w-[70%] bg-[#DCF8C6] p-3 rounded-tl-lg rounded-bl-lg rounded-br-lg shadow-sm border border-green-100">
                            <p className="text-[12px] text-gray-800 leading-normal">Entiendo Juan Diego. Podemos revisar las especificaciones para ajustar el costo. ¿Te parece si agendamos una breve llamada?</p>
                            <div className="flex justify-end items-center gap-1 mt-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">10:32 AM</span>
                                <CheckCheck size={12} className="text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 bg-[#F0F0F0] flex items-center gap-2">
                        <Smile className="text-gray-500" size={24} />
                        <Paperclip className="text-gray-500" size={24} />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="ESCRIBE UN MENSAJE..."
                                className="w-full px-4 py-2 bg-white border-none rounded-full text-[12px] font-bold uppercase outline-none shadow-sm"
                            />
                        </div>
                        <div className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-[#008F6F] transition-all">
                            <Send size={18} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-300 gap-4">
                    <MessageSquare size={64} strokeWidth={1} />
                    <div className="text-center">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">WhatsApp Business</h3>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Selecciona una conversación para comenzar</p>
                    </div>
                </div>
            )}

            {/* Right Assistant Sidebar */}
            {selectedChat && (
                <div className="w-80 border-l border-gray-100 bg-white flex flex-col p-4 gap-6">
                    <div className="text-center pb-6 border-b border-gray-50">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-2xl font-black mx-auto mb-3 shadow-inner">{selectedChat.avatar}</div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{selectedChat.name}</h3>
                        <button className="mt-3 px-4 py-1.5 border border-gray-200 rounded-full text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50">Ver Cliente 360°</button>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                        <div className="flex items-center gap-2 text-purple-800 mb-3">
                            <Bot size={20} />
                            <span className="text-[11px] font-black uppercase tracking-tight">Asistente IA</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-lg text-[10px] font-bold text-purple-900 leading-relaxed shadow-sm border border-purple-100 italic">
                            "El cliente muestra sensibilidad al precio. Se recomienda enfatizar la garantía de 5 años y el material de grado aeronáutico."
                        </div>
                        <button className="w-full mt-4 py-2 bg-purple-800 text-white rounded-lg text-[10px] font-black uppercase shadow-md flex items-center justify-center gap-2 hover:bg-purple-900 transition-all">
                            <Sparkles size={14} /> Sugerir Respuesta
                        </button>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Acciones CRM</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: FileText, label: 'Cotizar' },
                                { icon: Package, label: 'Nueva OP' },
                                { icon: DollarSign, label: 'Pago' },
                                { icon: Calendar, label: 'Cita' },
                                { icon: Image, label: 'Diseño' },
                                { icon: Settings, label: 'Ficha' },
                            ].map((action, i) => (
                                <button key={i} className="flex flex-col items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-green-800 hover:bg-green-50/50 transition-all group">
                                    <action.icon size={18} className="text-gray-400 group-hover:text-green-800 transition-colors" />
                                    <span className="text-[9px] font-black uppercase text-gray-500 group-hover:text-green-800 transition-colors">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppPage;
