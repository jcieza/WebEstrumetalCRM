'use client';

import React, { useState } from 'react';
import {
    X, Send, Smartphone, MessageSquare, Zap, Clock,
    CheckCircle, AlertCircle, Sparkles, Copy, Trash2
} from 'lucide-react';

interface WhatsAppOutreachProps {
    leads: any[];
    onClose: () => void;
}

const WhatsAppOutreach: React.FC<WhatsAppOutreachProps> = ({ leads, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [sentStatus, setSentStatus] = useState<Record<string, string>>({});

    const templates = [
        {
            id: 0,
            name: 'Reactivación Histórica',
            text: (name: string) => `Hola ${name}, te saludamos de Estrumetal. Vimos que trabajamos juntos anteriormente en proyectos de ingeniería. Nos encantaría retomar contacto para mostrarte nuestras nuevas soluciones de metalmecánica. ¿Te interesaría una breve llamada?`
        },
        {
            id: 1,
            name: 'Oferta Especial (Mallas/Corte)',
            text: (name: string) => `Estimados amigos de ${name}, en Estrumetal tenemos una promoción especial para el sector industrial este mes en servicios de corte y mallas electro-soldadas. ¿Podemos enviarte nuestro catálogo actualizado?`
        }
    ];

    const handleSend = async (leadId: string, text: string) => {
        setIsSending(true);
        // Simulación de envío vía API
        await new Promise(r => setTimeout(r, 1000));
        setSentStatus(prev => ({ ...prev, [leadId]: 'sent' }));
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 bg-green-800 text-white flex justify-between items-center shadow-lg">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Smartphone size={24} /> Outreach Masivo WhatsApp
                        </h2>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Enviando a {leads.length} leads seleccionados</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Leads List */}
                    <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cola de Envío</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                            {leads.map((lead, i) => (
                                <div key={i} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <div className="text-[11px] font-black text-gray-800 uppercase truncate">{lead.potential_name || 'SIN NOMBRE'}</div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] font-bold text-gray-400">{lead.detected_phone || 'S/T'}</span>
                                        {sentStatus[lead.id] === 'sent' ? (
                                            <CheckCircle size={14} className="text-green-500" />
                                        ) : (
                                            <Clock size={14} className="text-gray-300" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col bg-gray-50 p-6 gap-6 overflow-y-auto">
                        {/* Template Selection */}
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Plantilla Dinámica</span>
                            <div className="grid grid-cols-2 gap-3">
                                {templates.map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        className={`p-4 border rounded-xl text-left transition-all ${selectedTemplate === t.id ? 'border-green-800 bg-green-50/50 shadow-md ring-1 ring-green-800' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        <div className="text-[11px] font-black text-gray-800 uppercase mb-1">{t.name}</div>
                                        <div className="text-[9px] font-medium text-gray-400 line-clamp-2">{t.text('CLIENTE')}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Vista Previa Personalizada</span>
                            <div className="bg-[#E5DDD5] rounded-xl p-4 shadow-inner min-h-[200px] flex items-end">
                                <div className="bg-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%] relative">
                                    <p className="text-[12px] text-gray-800 leading-normal">
                                        {templates[selectedTemplate].text(leads[0]?.potential_name || '[NOMBRE EMPRESA]')}
                                    </p>
                                    <span className="text-[8px] font-bold text-gray-400 block text-right mt-1 uppercase">12:00 PM</span>
                                    <div className="absolute top-0 right-0 -translate-y-full -translate-x-1/2">
                                        <span className="px-2 py-0.5 bg-green-800 text-white text-[8px] font-black uppercase rounded shadow-sm">Preview</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-black text-gray-600 uppercase hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                <Clock size={16} /> Programar
                            </button>
                            <button
                                onClick={() => handleSend(leads[0].id, templates[selectedTemplate].text(leads[0].potential_name))}
                                disabled={isSending}
                                className="flex-[2] py-3 bg-green-800 text-white rounded-xl text-[11px] font-black uppercase shadow-lg shadow-green-900/20 hover:bg-green-900 transition-all flex items-center justify-center gap-2"
                            >
                                {isSending ? <Sparkles className="animate-spin" size={16} /> : <Send size={16} />}
                                {isSending ? 'Enviando...' : 'Iniciar Outreach Masivo'}
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                            <div>
                                <span className="text-[10px] font-black text-amber-800 uppercase block">Control Anti-Spam</span>
                                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tight mt-1">
                                    Se enviará con intervalos de 30-60 segundos para proteger la cuenta. No cierres esta ventana durante el proceso.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppOutreach;
