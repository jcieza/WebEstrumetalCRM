'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, User, ArrowRight, ShieldCheck, Inbox, Archive, Trash2, Send, Paperclip, Download, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Attachment {
    filename: string;
    contentType: string;
    size: number;
    url: string;
    storagePath?: string;
}

interface EmailMessage {
    id: string;
    from: string;
    subject: string;
    body: string;
    receivedAt: string;
    status: 'NEW' | 'READ' | 'ARCHIVED';
    attachments?: Attachment[];
}

const MailPage = () => {
    const [messages, setMessages] = useState<EmailMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'incoming_messages'), orderBy('receivedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Aseguramos que attachments sea un array
                    attachments: data.attachments || []
                } as EmailMessage;
            });

            setMessages(msgs);
            setLoading(false);

            // ACTUALIZACIÓN REACTIVA: Si el mensaje seleccionado se actualiza en Firestore 
            // (ej: llegó el adjunto un segundo después), lo actualizamos en pantalla.
            setSelectedMessage(prev => {
                if (!prev) return null;
                const updated = msgs.find(m => m.id === prev.id);
                return updated || prev;
            });
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', id), { status: 'READ' });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (msg: EmailMessage) => {
        if (!confirm('¿Estás seguro de eliminar este mensaje permanentemente?')) return;

        try {
            await deleteDoc(doc(db, 'incoming_messages', msg.id));
            if (selectedMessage?.id === msg.id) setSelectedMessage(null);
            // Nota: En una versión futura podríamos borrar los archivos de Storage aquí también
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/mail/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedMessage.from,
                    subject: `Re: ${selectedMessage.subject}`,
                    body: replyText,
                    fromName: 'Estrumetal Ventas'
                })
            });

            if (response.ok) {
                alert('Respuesta enviada con éxito');
                setReplyText('');
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'No se pudo enviar'}`);
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Error crítico al enviar');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Centro de Comunicaciones</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium uppercase tracking-widest leading-none">Bandeja de Entrada @ciaestrumetal.com</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Microservicio Activo</span>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Inbox List */}
                <div className={`w-full md:w-1/3 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                        <Inbox size={18} className="text-slate-400" />
                        <span className="text-xs font-black uppercase text-slate-600">Mensajes Recientes</span>
                        <span className="ml-auto bg-green-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black">
                            {messages.filter(m => m.status === 'NEW').length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center animate-pulse">
                                <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-4"></div>
                                <div className="h-2 w-20 bg-slate-100 mx-auto rounded"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-20 text-center opacity-30">
                                <Mail size={40} className="mx-auto mb-4" />
                                <p className="text-[10px] font-bold uppercase">Sin mensajes nuevos</p>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <button
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'NEW') markAsRead(msg.id);
                                        setShowMobileDetail(true);
                                    }}
                                    className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 flex flex-col gap-1 ${selectedMessage?.id === msg.id ? 'bg-green-50/50 border-l-4 border-l-green-600' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${msg.status === 'NEW' ? 'text-green-700' : 'text-slate-400'}`}>
                                                {msg.from.split('<')[0] || msg.from}
                                            </span>
                                            {msg.attachments && msg.attachments.length > 0 && <Paperclip size={10} className="text-slate-300" />}
                                        </div>
                                        <span className="text-[9px] text-slate-300 font-mono">
                                            {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className={`text-xs truncate font-bold ${msg.status === 'NEW' ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {msg.subject || '(Sin Asunto)'}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                                        {msg.body.substring(0, 60)}...
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Detail / Content */}
                <div className={`flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden ${showMobileDetail ? 'fixed inset-0 z-[1100] rounded-none' : 'hidden md:flex'}`}>
                    {selectedMessage ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-3 md:gap-4">
                                    {/* Botón Volver en Móvil */}
                                    <button
                                        onClick={() => setShowMobileDetail(false)}
                                        className="md:hidden p-2 -ml-2 text-slate-400"
                                    >
                                        <ArrowRight className="rotate-180" size={20} />
                                    </button>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs md:text-base">
                                        {selectedMessage.from.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm md:text-lg font-black text-slate-800 leading-none truncate">{selectedMessage.subject}</h2>
                                        <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium truncate">{selectedMessage.from}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"><Archive size={20} /></button>
                                    <button
                                        onClick={() => handleDelete(selectedMessage)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium flex flex-col gap-6">
                                <div className="min-h-[100px]">
                                    {selectedMessage.body}
                                </div>

                                {/* Adjuntos */}
                                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                                            <Paperclip size={12} />
                                            Archivos Adjuntos ({selectedMessage.attachments.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMessage.attachments.map((att, idx) => (
                                                <a
                                                    key={idx}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                                >
                                                    <div className="text-[10px] flex flex-col">
                                                        <span className="font-black text-slate-700 truncate max-w-[150px]">{att.filename}</span>
                                                        <span className="text-[8px] text-slate-400 uppercase">{(att.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                    <Download size={14} className="text-green-600" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-50 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowRight size={14} className="text-green-600 md:w-4 md:h-4 w-3 h-3" />
                                        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-800">Responder como @ciaestrumetal.com</span>
                                    </div>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full h-32 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-xs font-bold tracking-tight"
                                        placeholder="Escribe tu respuesta aquí..."
                                    ></textarea>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={isSending || !replyText.trim()}
                                        className="self-end px-6 md:px-8 py-3 bg-green-700 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[1.5px] shadow-xl shadow-green-100 hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {isSending ? 'Enviando...' : 'Enviar Respuesta'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-20">
                            <ArrowRight size={60} className="mb-4 text-slate-300" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">Selecciona un mensaje</h3>
                            <p className="text-xs font-bold leading-relaxed px-10 mt-2 italic uppercase">Gestiona tu comunicación comercial desde una sola plataforma centralizada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MailPage;
