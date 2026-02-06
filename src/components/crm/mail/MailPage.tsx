'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, User, ArrowRight, ShieldCheck, Inbox, Archive, Trash2, Send, Paperclip, Download, Loader2, Eye, X, Settings as SettingsIcon } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

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
    to: string; // Cuenta receptora
    subject: string;
    body: string;
    receivedAt: string;
    status: 'NEW' | 'READ' | 'ARCHIVED' | 'PENDING' | 'DONE' | 'SENT' | 'DRAFT' | 'TRASH';
    attachments?: Attachment[];
    replied?: boolean;
    folder?: 'inbox' | 'sent' | 'drafts' | 'trash'; // Opcional, para redundancia
}

const AUTHORIZED_SENDERS = [
    'ventas@ciaestrumetal.com',
    'administracion@ciaestrumetal.com'
];

// Sonidos Base64 (Pequeños beeps para feedback inmediato)
const SEND_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTv9AIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACA"; // Placeholder breve
const RECEIVE_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTv9AIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACA"; // Placeholder breve

const MailPage = () => {
    const [messages, setMessages] = useState<EmailMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [showCompose, setShowCompose] = useState(false);
    const [senderAccount, setSenderAccount] = useState('ventas@ciaestrumetal.com');
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'archived' | 'trash' | 'drafts'>('inbox');
    const [undoTimer, setUndoTimer] = useState<any>(null);
    const [undoCountdown, setUndoCountdown] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'new'; message: string }[]>([]);
    const [showRecipientsSuggest, setShowRecipientsSuggest] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [bodyFont, setBodyFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [isMailSubdomain, setIsMailSubdomain] = useState(false);
    const [previewingFile, setPreviewingFile] = useState<{ url: string, type: string, name: string } | null>(null);
    const [showSubSettings, setShowSubSettings] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [userProfile, setUserProfile] = useState({
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || '',
    });

    const ESTRUMETAL_SIGNATURE = `
<div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 10px; font-family: sans-serif;">
    <img src="https://mail.ciaestrumetal.online/logo-estrumetal.png" alt="Estrumetal" style="width: 155px; height: auto; display: block; margin-bottom: 4px;" />
    <div style="line-height: 1.1;">
        <p style="font-size: 11px; color: #333; font-weight: 800; margin: 0; text-transform: uppercase;">ESTRUMETAL | Central de Operaciones</p>
        <p style="font-size: 9px; color: #888; margin: 4px 0 0 0; font-style: italic; line-height: 1.3;">Este es un correo profesional de Estrumetal. Si usted no es el destinatario de este correo y le llegó por error, por favor ignórelo.</p>
    </div>
</div>`;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMailSubdomain(window.location.hostname.startsWith('mail.'));
        }
    }, []);

    const addToast = (type: 'success' | 'new', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const playSound = (type: 'send' | 'receive') => {
        const audio = new Audio(type === 'send' ? SEND_SOUND : RECEIVE_SOUND);
        audio.volume = 0.3;
        audio.play().catch(() => { /* Ignore browser restrictions */ });
    };

    useEffect(() => {
        const q = query(collection(db, 'incoming_messages'), orderBy('receivedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userEmail = auth.currentUser?.email;
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    attachments: data.attachments || []
                } as EmailMessage;
            }).filter(m => {
                // Filtro de Privacidad: Cuentas personales solo ven lo suyo.
                // Ventas y Administración son públicas para el equipo.
                const publicAccounts = ['ventas@ciaestrumetal.com', 'administracion@ciaestrumetal.com'];
                const isToPublic = publicAccounts.includes(m.to);
                const isFromPublic = publicAccounts.includes(m.from);

                if (isToPublic || isFromPublic) return true;

                // Si es cuenta personal, solo el dueño lo ve
                if (userEmail && (m.to === userEmail || m.from === userEmail)) return true;

                return false;
            });

            setMessages(msgs);
            setLoading(false);

            if (window.innerWidth >= 768 && msgs.length > 0 && !selectedMessage) {
                setSelectedMessage(msgs[0]);
            }

            setMessages(prev => {
                const prevNewIds = new Set(prev.filter(m => m.status === 'NEW').map(m => m.id));
                const hasNew = msgs.some(m => m.status === 'NEW' && !prevNewIds.has(m.id));
                if (hasNew && prev.length > 0) {
                    playSound('receive');
                    addToast('new', 'Nuevo mensaje recibido');
                }
                return msgs;
            });

            setSelectedMessage(prev => {
                if (!prev) return null;
                const updated = msgs.find(m => m.id === prev.id);
                return updated || prev;
            });
        });

        return () => unsubscribe();
    }, []);

    // Timer para el Deshacer Envío
    useEffect(() => {
        let interval: any;
        if (undoTimer) {
            setUndoCountdown(5);
            interval = setInterval(() => {
                setUndoCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setUndoCountdown(5);
        }
        return () => clearInterval(interval);
    }, [undoTimer]);

    // Tab Title Notification
    useEffect(() => {
        const newCount = messages.filter(m => m.status === 'NEW').length;
        if (newCount > 0) {
            document.title = `(${newCount}) Correos - Estrumetal`;
        } else {
            document.title = 'Comunicaciones - Estrumetal';
        }
        return () => { document.title = 'Estrumetal App'; };
    }, [messages]);

    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', id), { status: 'READ' });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (msg: EmailMessage) => {
        try {
            if (currentFolder === 'trash') {
                if (!confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) return;
                await deleteDoc(doc(db, 'incoming_messages', msg.id));
                addToast('success', 'Mensaje eliminado permanentemente');
            } else {
                await updateDoc(doc(db, 'incoming_messages', msg.id), { status: 'TRASH' });
                addToast('success', 'Movido a la papelera');
            }
            if (selectedMessage?.id === msg.id) setSelectedMessage(null);
        } catch (error) {
            console.error('Error handling delete:', error);
        }
    };

    const handleEmptyTrash = async () => {
        const trashMessages = messages.filter(m => m.status === 'TRASH');
        if (trashMessages.length === 0) return;

        if (!confirm(`¿Vaciar papelera? Se eliminarán ${trashMessages.length} mensajes para siempre.`)) return;

        try {
            const deletePromises = trashMessages.map(m => deleteDoc(doc(db, 'incoming_messages', m.id)));
            await Promise.all(deletePromises);
            addToast('success', 'Papelera vaciada');
            setSelectedMessage(null);
        } catch (error) {
            console.error('Error emptying trash:', error);
        }
    };

    const getRecentContacts = () => {
        const contacts = new Set<string>();
        messages.forEach(m => {
            if (m.from) contacts.add(m.from.includes('<') ? m.from.split('<')[1].split('>')[0] : m.from);
            if (m.to) contacts.add(m.to);
        });
        return Array.from(contacts).filter(c => c && c.includes('@'));
    };

    const saveMessageToFirestore = async (msgData: Partial<EmailMessage>) => {
        try {
            console.log("DEBUG: Guardando mensaje...", msgData);
            const docRef = await addDoc(collection(db, 'incoming_messages'), {
                ...msgData,
                receivedAt: new Date().toISOString(),
            });
            console.log("DEBUG: Guardado exitoso con ID:", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("DEBUG: Error al guardar mensaje:", e);
            if (msgData.status === 'DRAFT') {
                alert("Error al guardar borrador: " + (e as any).message);
            }
        }
    };

    const markAsUnread = async (id: string) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', id), { status: 'NEW' });
            addToast('success', 'Marcado como no leído');
        } catch (error) { console.error(error); }
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
                    body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${replyText.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                    fromName: auth.currentUser?.displayName || senderAccount.split('@')[0].toUpperCase(),
                    fromEmail: senderAccount
                })
            });

            if (response.ok) {
                // Marcar como respondido y crear registro en "Enviados"
                await updateDoc(doc(db, 'incoming_messages', selectedMessage.id), {
                    replied: true,
                    status: 'READ'
                });

                // Guardar en la misma colección con status SENT para que aparezca en la carpeta "Enviados"
                await addDoc(collection(db, 'incoming_messages'), {
                    from: senderAccount,
                    to: selectedMessage.from,
                    subject: `Re: ${selectedMessage.subject}`,
                    body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${replyText.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                    receivedAt: new Date().toISOString(),
                    status: 'SENT'
                });

                playSound('send');
                addToast('success', 'Mensaje enviado correctamente');
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

    const handleArchive = async (msg: EmailMessage) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', msg.id), { status: 'ARCHIVED' });
            // Log de éxito psicológico
            console.log(`Mensaje ${msg.id} archivado. Limpieza completada.`);
            if (selectedMessage?.id === msg.id) {
                setSelectedMessage(null);
                setShowMobileDetail(false);
            }
        } catch (error) {
            console.error('Error archiving message:', error);
        }
    };

    const handleSendWithUndo = async () => {
        if (!replyText.trim()) return;

        setIsSending(true);
        // Simulando delay de 5 segundos para "Undo"
        const timer = window.setTimeout(async () => {
            await handleSendReply();
            setUndoTimer(null);
        }, 5000);

        setUndoTimer(timer as unknown as number);
    };

    const cancelSend = () => {
        if (undoTimer) {
            clearTimeout(undoTimer);
            setUndoTimer(null);
            setIsSending(false);
            alert('Envío cancelado. El borrador sigue aquí.');
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesAccount = filterAccount === 'all' || m.to === filterAccount;
        const matchesSearch = !searchQuery ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.body.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesAccount || !matchesSearch) return false;

        if (currentFolder === 'archived') return m.status === 'ARCHIVED';
        if (currentFolder === 'trash') return m.status === 'TRASH';
        if (currentFolder === 'sent') return m.status === 'SENT';
        if (currentFolder === 'drafts') return m.status === 'DRAFT';
        if (currentFolder === 'inbox') return m.status !== 'ARCHIVED' && m.status !== 'SENT' && m.status !== 'DRAFT' && m.status !== 'TRASH';
        return true;
    });

    const accounts = Array.from(new Set(messages.map(m => m.to))).filter(Boolean);

    return (
        <div className={`h-full flex flex-col gap-6 transition-colors duration-500 ${isMailSubdomain ? 'p-4' : ''} ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-transparent text-slate-800'}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Comunicaciones</h1>
                    <p className="text-slate-400 text-[8px] md:text-sm mt-1 font-medium uppercase tracking-widest leading-none">Bandeja @ciaestrumetal.com</p>
                </div>
                <div className="flex gap-2 md:gap-4 flex-1 max-w-md mx-4 hidden sm:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar en Estrumetal Mail..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-green-500/10 transition-all placeholder:text-slate-200"
                        />
                    </div>
                </div>
                <div className="flex gap-2 md:gap-4">
                    <button
                        onClick={() => {
                            setComposeTo('');
                            setComposeSubject('');
                            setComposeBody('');
                            setShowCompose(true);
                        }}
                        className="bg-green-700 hover:bg-green-600 text-white p-2 md:px-6 md:py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all font-black text-[10px] uppercase tracking-wider"
                    >
                        <X size={20} className="rotate-45" />
                        <span className="hidden md:inline">Redactar</span>
                    </button>
                    {!isMailSubdomain && (
                        <div className="hidden sm:flex bg-green-50 px-4 py-2 rounded-xl border border-green-100 items-center gap-2">
                            <ShieldCheck size={18} className="text-green-600" />
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Microservicio Activo</span>
                        </div>
                    )}
                    {isMailSubdomain && (
                        <button
                            onClick={() => setShowSubSettings(true)}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                            title="Configuración de Cuenta"
                        >
                            <SettingsIcon size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Subdomain Settings Modal */}
            {showSubSettings && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowSubSettings(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Mi Cuenta</h3>
                            <button onClick={() => setShowSubSettings(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                        {userProfile.photoURL ? (
                                            <img src={userProfile.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} className="text-slate-300" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const url = prompt('Ingresa la URL de tu nueva imagen de perfil:');
                                            if (url) setUserProfile(prev => ({ ...prev, photoURL: url }));
                                        }}
                                        className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all border-2 border-white"
                                    >
                                        <Paperclip size={14} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest">{userProfile.displayName || 'Usuario Estrumetal'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{auth.currentUser?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => alert('Cambio de contraseña enviado al correo (Simulado)')} className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center gap-4 transition-all group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={18} className="text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Cambiar Contraseña</span>
                                </button>
                                <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center gap-4 transition-all group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        {theme === 'light' ? <Clock size={18} className="text-orange-500" /> : <ShieldCheck size={18} className="text-slate-600" />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider font-sans">{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                                </button>

                                <div className="pt-2 border-t border-slate-50">
                                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tipografía de Envío</h5>
                                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                        {(['sans', 'serif', 'mono'] as const).map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setBodyFont(f)}
                                                className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${bodyFont === f ? 'bg-white shadow-md text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {f === 'sans' ? 'Moderno' : f === 'serif' ? 'Clásico' : 'Código'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => auth.signOut()} className="w-full p-4 bg-red-50 hover:bg-red-100 rounded-2xl flex items-center gap-4 transition-all group border border-red-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <X size={18} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Internal Mail Sidebar */}
                <div className="hidden lg:flex flex-col w-48 gap-2">
                    {[
                        { id: 'inbox', label: 'Bandeja', icon: Inbox, color: 'text-green-600' },
                        { id: 'sent', label: 'Enviados', icon: Send, color: 'text-blue-500' },
                        { id: 'drafts', label: 'Borradores', icon: Clock, color: 'text-orange-500' },
                        { id: 'archived', label: 'Archivados', icon: Archive, color: 'text-slate-500' },
                        { id: 'trash', label: 'Papelera', icon: Trash2, color: 'text-red-400' },
                    ].map(folder => (
                        <button
                            key={folder.id}
                            onClick={() => setCurrentFolder(folder.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider ${currentFolder === folder.id ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/50 text-slate-400'}`}
                        >
                            <folder.icon size={16} className={currentFolder === folder.id ? folder.color : 'text-slate-300'} />
                            <span className={currentFolder === folder.id ? 'text-slate-800' : ''}>{folder.label}</span>
                            {folder.id === 'inbox' && messages.filter(m => m.status === 'NEW').length > 0 && (
                                <span className="ml-auto bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                                    {messages.filter(m => m.status === 'NEW').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Inbox List */}
                <div className={`transition-all duration-500 border rounded-2xl shadow-sm flex flex-col overflow-hidden ${showMobileDetail ? 'hidden md:flex' : 'flex'} ${selectedMessage ? 'md:w-64 lg:w-80' : 'md:w-1/3'} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`p-4 border-b flex flex-col gap-3 transition-all ${selectedMessage ? 'md:p-3' : ''} ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-50'}`}>
                        <div className={`flex items-center gap-3 ${selectedMessage ? 'md:justify-between' : ''}`}>
                            <Inbox size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                            <div className="flex flex-col">
                                <span className={`text-xs font-black uppercase ${selectedMessage ? 'hidden lg:inline' : ''} ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {currentFolder === 'trash' ? 'PAPELERA' :
                                        currentFolder === 'sent' ? 'ENVIADOS' :
                                            currentFolder === 'drafts' ? 'BORRADORES' :
                                                currentFolder === 'archived' ? 'ARCHIVADOS' : 'RECIBIDOS'}
                                </span>
                                {currentFolder === 'trash' && filteredMessages.length > 0 && (
                                    <button
                                        onClick={handleEmptyTrash}
                                        className="text-[7px] font-black text-red-500 hover:text-red-600 uppercase tracking-tighter text-left"
                                    >
                                        Vaciar Papelera Definitivamente
                                    </button>
                                )}
                            </div>
                            <span className={`ml-auto bg-green-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black ${selectedMessage ? 'hidden lg:inline' : ''}`}>
                                {filteredMessages.length}
                            </span>
                        </div>

                        {!selectedMessage && (
                            <select
                                value={filterAccount}
                                onChange={(e) => setFilterAccount(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold uppercase tracking-tight outline-none focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="all">Todas las cuentas</option>
                                {accounts.map(acc => (
                                    <option key={acc} value={acc}>{acc}</option>
                                ))}
                            </select>
                        )}
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
                            filteredMessages.map(msg => (
                                <button
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'NEW') markAsRead(msg.id);
                                        setShowMobileDetail(true);
                                        setPreviewingFile(null);
                                    }}
                                    className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 flex flex-col gap-1 ${selectedMessage?.id === msg.id ? 'bg-green-50/50 border-l-4 border-l-green-600 shadow-sm' : ''} ${selectedMessage ? 'md:items-center lg:items-start' : ''}`}
                                >
                                    <div className="flex justify-between items-center w-full gap-2 mb-1">
                                        {msg.to && (
                                            <span className={`shrink-0 px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest ${msg.to.includes('ventas') ? 'bg-orange-600 text-white' :
                                                msg.to.includes('administracion') ? 'bg-blue-700 text-white' :
                                                    'bg-green-700 text-white'
                                                }`}>
                                                {msg.to.includes('ventas') ? 'VENTAS' :
                                                    msg.to.includes('administracion') ? 'ADMIN' :
                                                        msg.to.split('@')[0].toUpperCase()}
                                            </span>
                                        )}
                                        <span className={`text-[9px] text-slate-300 font-mono ${selectedMessage ? 'md:hidden lg:inline' : ''}`}>
                                            {new Date(msg.receivedAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                ? new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(msg.receivedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 min-w-0">
                                        {msg.replied && (
                                            <div className="bg-green-100 text-green-600 p-0.5 rounded">
                                                <ArrowRight size={10} className="-rotate-45" />
                                            </div>
                                        )}
                                        <span className={`text-[10px] font-black uppercase tracking-tight truncate ${msg.status === 'NEW' ? 'text-green-700' : 'text-slate-400'} ${selectedMessage ? 'md:hidden lg:inline-block' : ''}`}>
                                            {msg.from.split('<')[0] || msg.from}
                                        </span>
                                        {selectedMessage && (
                                            <div className="md:w-8 md:h-8 lg:hidden bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200">
                                                {(msg.from.split('<')[0] || msg.from).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <h4 className={`text-xs truncate font-bold w-full ${msg.status === 'NEW' ? 'text-slate-800' : 'text-slate-500'} ${selectedMessage ? 'md:hidden lg:inline' : ''}`}>
                                        {msg.subject || '(Sin Asunto)'}
                                    </h4>

                                    {/* Bumping / Recordatorio */}
                                    {msg.status === 'NEW' && (Date.now() - new Date(msg.receivedAt).getTime()) > 3 * 24 * 60 * 60 * 1000 && !selectedMessage && (
                                        <div className="mt-1 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-[7px] font-black text-red-500 uppercase">¿Hacer Seguimiento?</span>
                                        </div>
                                    )}

                                    <div className={`flex items-center gap-2 ${selectedMessage ? 'md:hidden lg:flex' : 'flex'}`}>
                                        <p className="text-[10px] text-slate-400 line-clamp-1 italic flex-1">
                                            {msg.body.substring(0, 60)}...
                                        </p>
                                        {msg.attachments && msg.attachments.length > 0 && <Paperclip size={10} className="text-slate-300 shrink-0" />}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Detail / Content */}
                <div className={`flex-1 border rounded-2xl shadow-sm flex flex-col overflow-hidden ${showMobileDetail ? 'fixed inset-0 z-[1100] rounded-none md:static md:z-0 md:rounded-2xl md:flex' : 'hidden md:flex'} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    {selectedMessage ? (
                        <>
                            <div className={`p-4 md:p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-50'}`}>
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
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] md:text-xs text-slate-400 font-medium truncate">{selectedMessage.from}</p>
                                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-black uppercase">para {selectedMessage.to}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <button
                                        onClick={() => markAsUnread(selectedMessage.id)}
                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent"
                                        title="Marcar como no leído"
                                    >
                                        <Mail size={20} />
                                    </button>
                                    <button
                                        onClick={() => setIsMaximized(true)}
                                        className="hidden md:flex p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent"
                                        title="Ver en pantalla completa"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleArchive(selectedMessage)}
                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100"
                                    >
                                        <Archive size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedMessage)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="hidden md:flex p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all ml-2"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className={`flex-1 p-8 overflow-y-auto text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium flex flex-col gap-6 ${bodyFont === 'serif' ? 'font-serif' :
                                bodyFont === 'mono' ? 'font-mono' : 'font-sans'
                                }`}>
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
                                                <div key={idx} className="flex items-center gap-3 px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                                    <div className="text-[10px] flex flex-col min-w-0 flex-1">
                                                        <span className="font-black text-slate-700 truncate">{att.filename}</span>
                                                        <span className="text-[8px] text-slate-400 uppercase">{(att.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setPreviewingFile({ url: att.url, type: att.contentType, name: att.filename })}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <a
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* File Viewer Modal */}
                                {previewingFile && (
                                    <div className="fixed inset-0 z-[2000] flex items-center justify-center md:p-10 animate-in fade-in duration-300">
                                        <div
                                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                            onClick={() => setPreviewingFile(null)}
                                        />
                                        <div className="relative w-full max-w-5xl h-full bg-white md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] text-white ${previewingFile.type.includes('pdf') ? 'bg-red-500' :
                                                        previewingFile.type.includes('image') ? 'bg-blue-500' : 'bg-green-600'
                                                        }`}>
                                                        {previewingFile.name.split('.').pop()?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight truncate max-w-[200px] md:max-w-none">{previewingFile.name}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Visor Estrumetal Cloud</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a href={previewingFile.url} download className="p-2 text-slate-400 hover:text-green-600 transition-all"><Download size={20} /></a>
                                                    <button
                                                        onClick={() => setPreviewingFile(null)}
                                                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-full transition-all"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden bg-slate-50 flex items-center justify-center relative">
                                                {previewingFile.type.includes('pdf') ? (
                                                    <div className="w-full h-full flex flex-col">
                                                        <iframe
                                                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewingFile.url)}&embedded=true`}
                                                            className="w-full flex-1 border-none"
                                                            title="PDF Viewer"
                                                        />
                                                        <div className="p-4 bg-orange-50/50 border-t border-orange-100 flex justify-between items-center shrink-0">
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-[10px] font-black text-orange-800 uppercase italic whitespace-nowrap">¿Error 403 o no carga?</p>
                                                                <p className="text-[8px] font-bold text-orange-600 uppercase">Debes permitir el acceso o descargar directamente.</p>
                                                            </div>
                                                            <a href={previewingFile.url} target="_blank" rel="noreferrer" className="px-5 py-2 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-200">Abrir Directo</a>
                                                        </div>
                                                    </div>
                                                ) : previewingFile.type.includes('image') ? (
                                                    <img src={previewingFile.url} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-6 p-20 text-center animate-in zoom-in duration-500">
                                                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner">
                                                            <Download size={40} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-800 uppercase">Vista previa no soportada</h4>
                                                            <p className="text-sm font-bold text-slate-400 uppercase mt-2">Para archivos Excel, Word o CAD, debes descargarlos.</p>
                                                        </div>
                                                        <a
                                                            href={previewingFile.url}
                                                            download
                                                            className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-100 hover:bg-green-600 transition-all"
                                                        >
                                                            Descargar y Abrir
                                                        </a>
                                                        <p className="text-[9px] font-black text-slate-300 uppercase mt-4">Sugerencia: Usa el visor externo de Google si es un documento Office.</p>
                                                        <a
                                                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(previewingFile.url)}&embedded=true`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] font-black text-blue-600 hover:underline uppercase"
                                                        >
                                                            Intentar abrir con Google Viewer
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-50 flex flex-col gap-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight size={14} className="text-green-600" />
                                            <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-800">Responder como</span>
                                            <select
                                                value={senderAccount}
                                                onChange={(e) => setSenderAccount(e.target.value)}
                                                className="bg-slate-100 border-none rounded-lg px-2 py-1 text-[9px] font-black text-green-700 outline-none"
                                            >
                                                <option value="ventas@ciaestrumetal.com">ventas@ciaestrumetal.com</option>
                                                <option value="administracion@ciaestrumetal.com">administracion@ciaestrumetal.com</option>
                                                {auth.currentUser?.email && !['ventas@ciaestrumetal.com', 'administracion@ciaestrumetal.com'].includes(auth.currentUser.email) && (
                                                    <option value={auth.currentUser.email}>{auth.currentUser.email}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full h-32 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-xs font-bold tracking-tight"
                                        placeholder="Escribe tu respuesta aquí..."
                                    ></textarea>
                                    <button
                                        onClick={handleSendWithUndo}
                                        disabled={isSending || !replyText.trim()}
                                        className="self-end px-6 md:px-8 py-3 bg-green-700 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[1.5px] shadow-xl shadow-green-100 hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {undoTimer ? 'Deshacer (5s)...' : isSending ? 'Enviando...' : 'Enviar Respuesta'}
                                    </button>
                                    {undoTimer && (
                                        <button
                                            onClick={cancelSend}
                                            className="self-end text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 underline"
                                        >
                                            Cancelar Envío
                                        </button>
                                    )}
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

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        onClick={() => setShowCompose(false)}
                    />
                    <div className={`relative w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col border h-full md:h-[650px] md:rounded-[32px] transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <div className={`p-4 md:p-6 border-b flex justify-between items-center shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                    <Send size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-tight">Nuevo Mensaje</h3>
                                    <p className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">@ciaestrumetal.com</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCompose(false)}
                                className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 flex flex-col gap-4 overflow-y-auto flex-1">
                            {/* Templates Toolbar */}
                            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => {
                                        setComposeSubject('PRESENTACIÓN ESTRUMETAL - SOLUCIONES METALMECÁNICAS');
                                        setComposeBody('Estimado cliente,\n\nEs un gusto saludarle. Adjunto enviamos nuestra presentación corporativa resaltando la capacidad de nuestra planta para sus proyectos...\n\nAtentamente,\nEquipo Estrumetal');
                                    }}
                                    className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border border-slate-200"
                                >
                                    ✨ Presentación
                                </button>
                                <button
                                    onClick={() => {
                                        setComposeSubject('COTIZACIÓN ESTRUMETAL - REF: ');
                                        setComposeBody('Saludos cordiales,\n\nEn respuesta a su solicitud, adjunto encontrará la cotización formal para los servicios industriales requeridos.\n\nQuedamos atentos a sus comentarios.\n\nAtentamente,\nDepartamento de Ventas');
                                    }}
                                    className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border border-slate-200"
                                >
                                    📄 Cotización Base
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Desde</label>
                                <select
                                    value={senderAccount}
                                    onChange={(e) => setSenderAccount(e.target.value)}
                                    className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                                >
                                    <option value="ventas@ciaestrumetal.com">ventas@ciaestrumetal.com</option>
                                    <option value="administracion@ciaestrumetal.com">administracion@ciaestrumetal.com</option>
                                    {auth.currentUser?.email && !['ventas@ciaestrumetal.com', 'administracion@ciaestrumetal.com'].includes(auth.currentUser.email) && (
                                        <option value={auth.currentUser.email}>{auth.currentUser.email}</option>
                                    )}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Para</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="ejemplo@cliente.com"
                                        value={composeTo}
                                        onChange={(e) => {
                                            setComposeTo(e.target.value);
                                            setShowRecipientsSuggest(true);
                                        }}
                                        onFocus={() => setShowRecipientsSuggest(true)}
                                        className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all placeholder:text-slate-400 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                                    />
                                    {showRecipientsSuggest && composeTo.length > 0 && (
                                        <div className={`absolute top-full left-0 right-0 z-[2200] border rounded-xl mt-1 shadow-2xl max-h-40 overflow-y-auto overflow-x-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-slate-950' : 'bg-white border-slate-100'}`}>
                                            {getRecentContacts()
                                                .filter(c => c.toLowerCase().includes(composeTo.toLowerCase()))
                                                .map(contact => (
                                                    <button
                                                        key={contact}
                                                        onClick={() => {
                                                            setComposeTo(contact);
                                                            setShowRecipientsSuggest(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-slate-50 last:border-none"
                                                    >
                                                        {contact}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Asunto</label>
                                <input
                                    type="text"
                                    placeholder="ASUNTO DEL MENSAJE"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                    className={`w-full border rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-green-500/10 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Mensaje</label>
                                <textarea
                                    className={`w-full flex-1 min-h-[150px] border rounded-xl px-4 py-3 text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-green-500/10 transition-all resize-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                                    placeholder="Escribe el cuerpo del correo aquí..."
                                    value={composeBody}
                                    onChange={(e) => setComposeBody(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4 md:p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
                            <button
                                onClick={async () => {
                                    if (!composeTo && !composeSubject) return;
                                    await saveMessageToFirestore({
                                        from: senderAccount,
                                        to: composeTo,
                                        subject: composeSubject || '(Borrador)',
                                        body: composeBody + ESTRUMETAL_SIGNATURE,
                                        status: 'DRAFT'
                                    });
                                    addToast('success', 'Borrador guardado');
                                    setShowCompose(false);
                                }}
                                className="px-4 py-3 text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-2"
                            >
                                <Clock size={14} /> Guardar Borrador
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCompose(false)}
                                    className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (undoTimer) {
                                            cancelSend();
                                            return;
                                        }
                                        if (!composeTo || !composeSubject || !composeBody) {
                                            alert('Completa los campos');
                                            return;
                                        }
                                        setIsSending(true);

                                        const timer = window.setTimeout(async () => {
                                            try {
                                                const response = await fetch('/api/mail/send', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        to: composeTo,
                                                        subject: composeSubject,
                                                        body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${composeBody.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                                                        fromName: auth.currentUser?.displayName || senderAccount.split('@')[0].toUpperCase(),
                                                        fromEmail: senderAccount
                                                    })
                                                });
                                                if (response.ok) {
                                                    // Guardar en Firestore para que aparezca en "Enviados"
                                                    await addDoc(collection(db, 'incoming_messages'), {
                                                        from: senderAccount,
                                                        to: composeTo,
                                                        subject: composeSubject,
                                                        body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${composeBody.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                                                        receivedAt: new Date().toISOString(),
                                                        status: 'SENT'
                                                    });
                                                    addToast('success', 'Mensaje enviado correctamente');
                                                    setShowCompose(false);
                                                    setComposeTo('');
                                                    setComposeSubject('');
                                                    setComposeBody('');
                                                } else {
                                                    alert('Error');
                                                }
                                            } catch (e) { alert('Error'); }
                                            finally { setIsSending(false); setUndoTimer(null); }
                                        }, 5000);

                                        setUndoTimer(timer);
                                    }}
                                    className={`px-6 md:px-8 py-3 rounded-xl md:rounded-2xl flex items-center gap-2 shadow-xl transition-all font-black text-[10px] uppercase tracking-widest ${undoTimer ? 'bg-red-500 text-white' : 'bg-green-700 hover:bg-green-600 text-white shadow-green-900/10'}`}
                                >
                                    {isSending && !undoTimer ? <Loader2 size={16} className="animate-spin" /> : undoTimer ? <X size={16} /> : <Send size={16} />}
                                    <span className="hidden md:inline">{undoTimer ? 'DESHACER ENVÍO (5s)' : isSending ? 'Enviando...' : 'Enviar Correo'}</span>
                                    <span className="md:hidden">{undoTimer ? 'ANULAR' : 'Enviar'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maximized Message View */}
            {isMaximized && selectedMessage && (
                <div className="fixed inset-0 z-[2500] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white w-full h-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
                        <div className="p-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xl shadow-inner">
                                    {selectedMessage.from.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">{selectedMessage.subject}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">DE: {selectedMessage.from}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">PARA: {selectedMessage.to}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMaximized(false)}
                                className="p-4 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-16 text-slate-600 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium bg-gradient-to-b from-white to-slate-50/30">
                            {selectedMessage.body}

                            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                <div className="mt-12 p-8 bg-white/50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <Paperclip size={16} />
                                        Documentos Adjuntos ({selectedMessage.attachments.length})
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedMessage.attachments.map((att, i) => (
                                            <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-green-100 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                        {att.contentType.includes('pdf') ? <Eye size={20} className="text-red-400" /> : <Paperclip size={20} className="text-slate-400" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-black text-slate-700 truncate uppercase tracking-tight">{att.filename}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{(att.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <a href={att.url} download target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-green-600">
                                                        <Download size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts / Notifications */}
            <div className="fixed bottom-6 right-6 z-[3000] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 animate-in slide-in-from-right fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-blue-600/90 text-white'}`}
                    >
                        {toast.type === 'success' ? <ShieldCheck size={20} /> : <Mail size={20} />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">{toast.type === 'success' ? 'Éxito' : 'Notificación'}</p>
                            <p className="text-[12px] font-bold">{toast.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MailPage;
