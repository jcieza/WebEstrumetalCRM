'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Plus, Clock, Globe, Zap, MessageSquare, RefreshCw, X } from 'lucide-react';

const GeminiChatPage = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy el Agente Inteligente de Estrumetal. Estoy conectado a la base de datos del CRM y a los manuales técnicos de la planta. ¿En qué puedo ayudarte hoy?', time: 'AHORA' }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsgs = [...messages, { role: 'user', content: input, time: 'AHORA' }];
        setMessages(newMsgs);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages([...newMsgs, {
                role: 'assistant',
                content: 'He analizado tu solicitud. Según los registros actuales de Producción, la OP-168 tiene un avance del 85% y está programada para despacho el próximo martes. ¿Deseas que notifique al cliente por WhatsApp?',
                time: 'AHORA'
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto py-2">
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-8 no-scrollbar pb-10">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}>
                        {msg.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-xl bg-green-800 flex items-center justify-center text-white shadow-lg flex-shrink-0 mt-1">
                                <Bot size={22} />
                            </div>
                        )}
                        <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl shadow-sm text-sm font-bold uppercase tracking-tight leading-relaxed ${msg.role === 'user' ? 'bg-green-800 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {msg.content}
                            </div>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{msg.time}</span>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm flex-shrink-0 mt-1">
                                <User size={22} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 pt-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex flex-col gap-2">
                    {/* Suggestions */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-1">
                        {[
                            '¿Cómo va la OP del cliente Alpha?',
                            'Resumen de ventas de este mes',
                            'Crear nueva cotización para...',
                            'Analizar stock de planchas'
                        ].map((s, i) => (
                            <button key={i} onClick={() => setInput(s)} className="whitespace-nowrap px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase text-gray-400 hover:text-green-800 hover:bg-green-50 transition-all">
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-1">
                        <Sparkles className="text-green-800" size={20} />
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            type="text"
                            placeholder="PREGÚNTAME ALGO..."
                            className="flex-1 bg-transparent border-none py-3 text-[12px] font-black uppercase outline-none placeholder:text-gray-300"
                        />
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 bg-green-800 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-green-900 transition-all flex-shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest mt-4">Powered by Gemini 1.5 Pro • Estrumetal Corp AI Agent</p>
            </div>
        </div>
    );
};

export default GeminiChatPage;
