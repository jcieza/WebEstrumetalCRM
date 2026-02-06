'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, User, ArrowRight, ShieldCheck, Inbox, Archive, Trash2, Send, Paperclip, Download, Loader2, Eye, X, Settings as SettingsIcon, Smile, Type, ChevronRight, Image as ImageIcon, Menu, Star, Plus, Layout } from 'lucide-react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

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

// Base64 Sounds
const SEND_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTv9AIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACA";
const RECEIVE_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTv9AIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACA";

const ESTRUMETAL_SIGNATURE = `
<div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 10px; font-family: sans-serif;">
    <img src="https://mail.ciaestrumetal.online/logo-estrumetal.png" alt="Estrumetal" style="width: 155px; height: auto; display: block; margin-bottom: 4px;" />
    <div style="line-height: 1.1;">
        <p style="font-size: 11px; color: #333; font-weight: 800; margin: 0; text-transform: uppercase;">ESTRUMETAL | DESPACHO DE OFICINA</p>
        <p style="font-size: 9px; color: #888; margin: 4px 0 0 0; font-style: italic; line-height: 1.3;">Este es un correo profesional de Estrumetal. Si usted no es el destinatario de este correo y le llegó por error, por favor ignórelo.</p>
    </div>
</div>`;

// - [x] Update: Signature text to "Despacho de Oficina"
// - [/] Comprehensive Overhaul: Fix structures (In Progress), HTML rendering, Multiple Recipients, Unread Counter, and Redesign Compose Modal.
//     - [x] Phase 1: Logic Consolidation (Completed)
//     - [/] Phase 2: Structural Unification (In Progress)
//     - [ ] Phase 3: Feature Polish (Pending)

const MailPage = () => {
    const { updateProfile } = useAuth();

    // Core State
    const [messages, setMessages] = useState<EmailMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'archived' | 'trash' | 'drafts'>('inbox');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [layoutMode, setLayoutMode] = useState<'modern' | 'glass'>('glass');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showCompose, setShowCompose] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSubSettings, setShowSubSettings] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [activeTab, setActiveTab] = useState<'mail' | 'meet'>('mail');
    const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'new'; message: string }[]>([]);

    // Editor State
    const [senderAccount, setSenderAccount] = useState('ventas@ciaestrumetal.com');
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [composeFiles, setComposeFiles] = useState<File[]>([]);
    const [replyText, setReplyText] = useState('');
    const [bodyFont, setBodyFont] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showRecipientsSuggest, setShowRecipientsSuggest] = useState(false);

    // Action State
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [undoTimer, setUndoTimer] = useState<any>(null);
    const [undoCountdown, setUndoCountdown] = useState(5);
    const [previewingFile, setPreviewingFile] = useState<{ url: string, type: string, name: string } | null>(null);
    const [isMailSubdomain, setIsMailSubdomain] = useState(false);

    const [userProfile, setUserProfile] = useState({
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || '',
    });

    const addToast = (type: 'success' | 'new', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const playSound = (type: 'send' | 'receive') => {
        const audio = new Audio(type === 'send' ? SEND_SOUND : RECEIVE_SOUND);
        audio.volume = 0.2;
        audio.play().catch(() => { });
    };

    // Real-time Feed
    useEffect(() => {
        const q = query(collection(db, 'incoming_messages'), orderBy('receivedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userEmail = auth.currentUser?.email;
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                attachments: doc.data().attachments || []
            } as EmailMessage))
                .filter(m => {
                    const publicAccounts = ['ventas@ciaestrumetal.com', 'administracion@ciaestrumetal.com'];
                    if (publicAccounts.includes(m.to) || publicAccounts.includes(m.from)) return true;
                    if (userEmail && (m.to === userEmail || m.from === userEmail)) return true;
                    return false;
                });

            setMessages(prev => {
                const prevIds = new Set(prev.map(m => m.id));
                const newVisible = msgs.some(m => m.status === 'NEW' && !prevIds.has(m.id));
                if (newVisible && prev.length > 0) {
                    playSound('receive');
                    addToast('new', 'Nuevo mensaje recibido');
                }
                return msgs;
            });
            setLoading(false);

            if (window.innerWidth >= 768 && msgs.length > 0 && !selectedMessage) {
                const firstInbox = msgs.find(m => !['SENT', 'TRASH', 'ARCHIVED', 'DRAFT'].includes(m.status));
                if (firstInbox) setSelectedMessage(firstInbox);
            }
        });
        return () => unsubscribe();
    }, [selectedMessage]);

    // Send Cancellation Logic
    useEffect(() => {
        let interval: any;
        if (undoTimer) {
            setUndoCountdown(5);
            interval = setInterval(() => {
                setUndoCountdown(prev => (prev <= 1 ? 0 : prev - 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [undoTimer]);

    // Counter & Title Logic
    useEffect(() => {
        const unreadCount = messages.filter(m => m.status === 'NEW' && !['SENT', 'TRASH', 'ARCHIVED', 'DRAFT'].includes(m.status)).length;
        document.title = unreadCount > 0 ? `(${unreadCount}) Correos - Estrumetal` : 'Comunicaciones - Estrumetal';
        return () => { document.title = 'Estrumetal App'; };
    }, [messages]);

    // Core Actions
    const markAsRead = async (id: string) => {
        try { await updateDoc(doc(db, 'incoming_messages', id), { status: 'READ' }); }
        catch (e) { console.error("Error marking as read:", e); }
    };

    const markAsUnread = async (id: string) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', id), { status: 'NEW' });
            addToast('success', 'Marcado como no leído');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (msg: EmailMessage) => {
        try {
            if (currentFolder === 'trash' || msg.status === 'TRASH') {
                if (!confirm('¿Eliminar permanentemente?')) return;
                await deleteDoc(doc(db, 'incoming_messages', msg.id));
                addToast('success', 'Eliminado permanentemente');
            } else {
                await updateDoc(doc(db, 'incoming_messages', msg.id), { status: 'TRASH' });
                addToast('success', 'Movido a la papelera');
            }
            if (selectedMessage?.id === msg.id) setSelectedMessage(null);
        } catch (e) { console.error(e); }
    };

    const handleEmptyTrash = async () => {
        const trash = messages.filter(m => m.status === 'TRASH');
        if (trash.length === 0 || !confirm(`¿Vaciar papelera (${trash.length} mensajes)?`)) return;
        try {
            await Promise.all(trash.map(m => deleteDoc(doc(db, 'incoming_messages', m.id))));
            addToast('success', 'Papelera vaciada');
            setSelectedMessage(null);
        } catch (e) { console.error(e); }
    };

    const handleFileUpload = async (files: File[]) => {
        setIsUploading(true);
        const uploaded: Attachment[] = [];
        try {
            for (const file of files) {
                const storageRef = ref(storage, `mail_attachments/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                uploaded.push({
                    filename: file.name,
                    contentType: file.type,
                    size: file.size,
                    url: await getDownloadURL(storageRef),
                    storagePath: storageRef.fullPath
                });
            }
            return uploaded;
        } catch (e) {
            addToast('success', 'Error al subir archivos');
            return [];
        } finally { setIsUploading(false); }
    };

    const handleArchive = async (msg: EmailMessage) => {
        try {
            await updateDoc(doc(db, 'incoming_messages', msg.id), { status: 'ARCHIVED' });
            addToast('success', 'Mensaje archivado');
            if (selectedMessage?.id === msg.id) setSelectedMessage(null);
        } catch (e) { console.error(e); }
    };

    const saveMessageToFirestore = async (msgData: Partial<EmailMessage>) => {
        try {
            return (await addDoc(collection(db, 'incoming_messages'), {
                ...msgData,
                receivedAt: new Date().toISOString(),
            })).id;
        } catch (e) { console.error("Firestore save error:", e); }
    };

    const getRecentContacts = () => {
        const contacts = new Set<string>();
        messages.forEach(m => {
            if (m.from) contacts.add(m.from.includes('<') ? m.from.split('<')[1].split('>')[0] : m.from);
            if (m.to) contacts.add(m.to);
        });
        return Array.from(contacts).filter(c => c && c.includes('@'));
    };

    const handleSendWithUndo = async (type: 'reply' | 'new') => {
        if (isSending) return;
        if (type === 'new' && (!composeTo || !composeSubject)) {
            alert("Completa destinatario y asunto");
            return;
        }
        if (type === 'reply' && !replyText.trim()) return;

        setIsSending(true);
        const timer = setTimeout(async () => {
            if (type === 'reply') await executeSendReply();
            else await executeSendNew();
            setUndoTimer(null);
            setIsSending(false);
        }, 5000);
        setUndoTimer(timer);
    };

    const cancelSend = () => {
        if (undoTimer) {
            clearTimeout(undoTimer);
            setUndoTimer(null);
            setIsSending(false);
            addToast('success', 'Envío cancelado');
        }
    };

    const executeSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        try {
            const body = `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${replyText.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`;
            const response = await fetch('/api/mail/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedMessage.from,
                    subject: `Re: ${selectedMessage.subject}`,
                    body,
                    fromName: userProfile.displayName || senderAccount.split('@')[0].toUpperCase(),
                    fromEmail: senderAccount
                })
            });

            if (response.ok) {
                await updateDoc(doc(db, 'incoming_messages', selectedMessage.id), { replied: true, status: 'READ' });
                await saveMessageToFirestore({
                    from: senderAccount,
                    to: selectedMessage.from,
                    subject: `Re: ${selectedMessage.subject}`,
                    body,
                    status: 'SENT'
                });
                playSound('send');
                addToast('success', 'Respuesta enviada');
                setReplyText('');
            }
        } catch (e) { console.error("Send reply error:", e); }
    };

    const executeSendNew = async () => {
        if (!composeTo || !composeSubject || !composeBody) return;
        try {
            const recipients = composeTo.split(/[,;]/).map(r => r.trim()).filter(Boolean);
            let attachments: Attachment[] = [];
            if (composeFiles.length > 0) attachments = await handleFileUpload(composeFiles);

            const body = `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${composeBody.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`;

            for (const recipient of recipients) {
                const response = await fetch('/api/mail/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: recipient,
                        subject: composeSubject,
                        body,
                        fromName: userProfile.displayName || senderAccount.split('@')[0].toUpperCase(),
                        fromEmail: senderAccount,
                        attachments
                    })
                });

                if (response.ok) {
                    await saveMessageToFirestore({
                        from: senderAccount,
                        to: recipient,
                        subject: composeSubject,
                        body,
                        status: 'SENT',
                        attachments
                    });
                }
            }
            playSound('send');
            addToast('success', `Mensaje enviado a ${recipients.length} destinatario(s)`);
            setShowCompose(false);
            setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]);
        } catch (e) { console.error("Send new error:", e); }
    };

    // Advanced Filtering
    const filteredMessages = messages.filter(m => {
        const matchesAccount = filterAccount === 'all' || m.to === filterAccount;
        const matchesSearch = !searchQuery ||
            [m.subject || '', m.from || '', m.body || ''].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesAccount || !matchesSearch) return false;

        switch (currentFolder) {
            case 'inbox': return !['ARCHIVED', 'SENT', 'DRAFT', 'TRASH'].includes(m.status);
            case 'sent': return m.status === 'SENT';
            case 'drafts': return m.status === 'DRAFT';
            case 'archived': return m.status === 'ARCHIVED';
            case 'trash': return m.status === 'TRASH';
            default: return true;
        }
    });

    const accounts = Array.from(new Set(messages.map(m => m.to))).filter(Boolean);

    // ==========================================
    // RENDER LOGIC
    // ==========================================
    // ==========================================
    // RENDER HELPERS
    // ==========================================
    const renderGlassLayout = () => (
        <div className={`fixed inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center overflow-hidden flex ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            <div className={`absolute inset-0 backdrop-blur-[10px] ${theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/40'}`} />

            {/* Sidebar Glass */}
            <div className="relative z-10 w-20 lg:w-64 flex flex-col p-4 gap-2">
                <div className="flex items-center gap-3 px-4 py-6 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-900/20">
                        <Mail size={22} />
                    </div>
                    <span className={`hidden lg:block text-lg font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        Estrumetal <span className="text-green-600">Mail</span>
                    </span>
                </div>

                <button
                    onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                    className={`w-full p-4 rounded-3xl flex items-center justify-center gap-3 shadow-xl transition-all font-black text-xs uppercase tracking-widest mb-6 border ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-100'}`}
                >
                    <Plus size={20} className="text-green-600" />
                    <span className="hidden lg:inline">Redactar</span>
                </button>

                <div className="flex flex-col gap-1">
                    {[
                        { id: 'inbox', label: 'Recibidos', icon: Inbox },
                        { id: 'sent', label: 'Enviados', icon: Send },
                        { id: 'drafts', label: 'Borradores', icon: Clock },
                        { id: 'archived', label: 'Archivados', icon: Archive },
                        { id: 'trash', label: 'Papelera', icon: Trash2 },
                    ].map(folder => {
                        const unreadCount = folder.id === 'inbox' ? messages.filter(m => m.status === 'NEW' && !['SENT', 'TRASH', 'ARCHIVED', 'DRAFT'].includes(m.status)).length : 0;
                        const isActive = currentFolder === folder.id;
                        return (
                            <button
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder.id as any)}
                                className={`flex items-center gap-4 px-5 py-3 rounded-2xl transition-all group ${isActive ? (theme === 'dark' ? 'bg-green-600/20 text-green-400 font-bold' : 'bg-green-600/10 text-green-700 font-bold') : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-800/5')}`}
                            >
                                <folder.icon size={18} className={isActive ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-300'} />
                                <span className="hidden lg:block flex-1 text-left text-[11px] font-black uppercase tracking-wider">{folder.label}</span>
                                {unreadCount > 0 && <span className="hidden lg:block bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
                            </button>
                        );
                    })}
                </div>

                <div className={`mt-auto p-3 flex items-center gap-3 rounded-3xl border shadow-lg cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60' : 'bg-white/40 border-white/60 hover:bg-white/60'}`} onClick={() => setShowSubSettings(true)}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black overflow-hidden shadow-inner border ${theme === 'dark' ? 'bg-slate-800 text-slate-400 border-white/10' : 'bg-slate-200 text-slate-500 border-white'}`}>
                        {userProfile.photoURL ? <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover" /> : userProfile.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col min-w-0">
                        <p className={`text-[10px] font-black truncate uppercase tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{userProfile.displayName || 'Usuario'}</p>
                        <p className="text-[8px] font-bold text-slate-400 truncate tracking-tighter">{auth.currentUser?.email}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area Glass */}
            <div className="flex-1 p-6 flex flex-col gap-6 relative z-10 overflow-hidden">
                <div className="w-full flex items-center gap-6">
                    <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-2.5 bg-white/40 backdrop-blur-md text-slate-600 rounded-xl border border-white/60">
                        <Menu size={20} />
                    </button>
                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en el correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full border rounded-[2rem] py-3.5 pl-14 pr-6 text-xs font-bold placeholder:text-slate-400 outline-none transition-all shadow-lg ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white focus:bg-slate-900' : 'bg-white/80 border-white text-slate-800'}`}
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => setLayoutMode('modern')} className={`p-3 backdrop-blur-md text-slate-400 hover:text-green-600 rounded-2xl border transition-all shadow-lg ${theme === 'dark' ? 'bg-slate-800/80 border-white/10' : 'bg-white/80 border-white'}`}>
                            <Layout size={20} />
                        </button>
                        <div className={`flex items-center gap-2 border px-5 py-2.5 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-slate-800/80 border-white/10' : 'bg-white/80 border-white'}`}>
                            <ShieldCheck size={18} className="text-green-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                        </div>
                    </div>
                </div>

                <div className={`flex-1 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border overflow-hidden flex ${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white/90 border-white/60'}`}>
                    {/* List Area */}
                    <div className={`flex flex-col border-r transition-all duration-500 ${selectedMessage ? 'w-full lg:w-[420px]' : 'w-full'} ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className={`flex border-b px-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                            {['Principal', 'Promociones', 'Social'].map((tab, i) => (
                                <button key={tab} className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest relative ${i === 0 ? 'text-green-600 border-b-4 border-green-600' : 'text-slate-400 hover:text-slate-200'}`}>{tab}</button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {filteredMessages.map(msg => (
                                <button
                                    key={msg.id}
                                    onClick={() => { setSelectedMessage(msg); if (msg.status === 'NEW') markAsRead(msg.id); }}
                                    className={`w-full flex items-center px-6 py-5 transition-all border-b border-slate-50/10 ${selectedMessage?.id === msg.id ? 'bg-green-600/10' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 w-full min-w-0">
                                        <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-black text-sm uppercase bg-gradient-to-br from-green-500 to-green-700 shadow-md overflow-hidden">{msg.from.charAt(0)}</div>
                                        <div className="min-w-0 flex-1 flex flex-col items-start">
                                            <div className="flex justify-between w-full mb-0.5">
                                                <span className={`text-[12px] truncate uppercase ${msg.status === 'NEW' ? 'font-black' : 'font-medium opacity-60'}`}>{msg.from.split('<')[0].replace(/"/g, '') || msg.from}</span>
                                                <span className="text-[9px] font-black text-slate-400">{new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h4 className={`text-[11px] font-black uppercase tracking-tight line-clamp-1 ${msg.status === 'NEW' ? '' : 'opacity-60'}`}>{msg.subject}</h4>
                                            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 italic">{msg.body.replace(/<[^>]*>?/gm, '').substring(0, 60)}...</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detail Area Glass */}
                    {selectedMessage && (
                        <div className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/40'}`}>
                            <div className="p-8 border-b flex justify-between items-center bg-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 text-slate-400"><ArrowRight className="rotate-180" /></button>
                                    <h2 className="text-xl font-black tracking-tight uppercase line-clamp-1">{selectedMessage.subject}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsMaximized(true)} className="p-2.5 rounded-xl bg-white/20 hover:bg-green-600/20 text-slate-400 hover:text-green-600 transition-all"><Eye size={18} /></button>
                                    <button onClick={() => handleDelete(selectedMessage)} className="p-2.5 rounded-xl bg-white/20 hover:bg-red-600/20 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-black text-xl shadow-lg">{selectedMessage.from.charAt(0)}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-black">{selectedMessage.from}</p>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(selectedMessage.receivedAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PARA: {selectedMessage.to}</p>
                                    </div>
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />
                                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                    <div className="mt-12 flex flex-wrap gap-4">
                                        {selectedMessage.attachments.map((att, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-white/20 rounded-2xl border border-white/10 shadow-sm backdrop-blur-md group">
                                                <Paperclip size={18} className="text-green-600" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold truncate uppercase">{att.filename}</p>
                                                    <p className="text-[8px] font-bold text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <a href={att.url} download target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-green-600"><Download size={16} /></a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-8 border-t bg-white/10 backdrop-blur-md">
                                <button onClick={() => { setReplyText(''); setShowCompose(true); setComposeTo(selectedMessage.from); setComposeSubject(`Re: ${selectedMessage.subject}`); }} className="px-8 py-3 bg-green-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all">
                                    Responder
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Actions Glass */}
            {!selectedMessage && (
                <button
                    onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                    className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce"
                >
                    <Plus size={24} />
                </button>
            )}
        </div>
    );

    const renderModernLayout = () => (
        <div className={`fixed inset-0 flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            {/* Header Modern */}
            <div className={`h-16 border-b flex items-center justify-between px-6 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-6">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                        <Menu size={20} className="text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">E</div>
                        <span className="text-lg font-bold tracking-tight">Estrumetal <span className="text-green-600">Mail</span></span>
                    </div>
                </div>
                <div className="flex-1 max-w-2xl px-12">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en el correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full border rounded-xl py-2.5 pl-12 pr-6 text-sm outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-900 focus:border-green-600' : 'bg-slate-100 border-transparent focus:bg-white focus:border-slate-200 focus:shadow-sm'}`}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setLayoutMode('glass')} className={`p-2 rounded-lg text-slate-400 hover:text-green-600 transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        <Layout size={20} />
                    </button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                    <button onClick={() => setShowSubSettings(true)} className={`p-1.5 rounded-full border border-transparent hover:border-slate-200 transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        {userProfile.photoURL ? <img src={userProfile.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">{userProfile.displayName?.charAt(0) || 'U'}</div>}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Modern */}
                <div className={`w-64 flex flex-col py-4 shrink-0 overflow-y-auto no-scrollbar ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                    <div className="px-4 mb-4">
                        <button
                            onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                            className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-6 py-4 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all font-bold text-sm shadow-sm border border-green-200 dark:border-green-800 w-full"
                        >
                            <Plus size={20} /> Redactar
                        </button>
                    </div>

                    {[
                        { id: 'inbox', label: 'Recibidos', icon: Inbox },
                        { id: 'sent', label: 'Enviados', icon: Send },
                        { id: 'drafts', label: 'Borradores', icon: Clock },
                        { id: 'archived', label: 'Archivados', icon: Archive },
                        { id: 'trash', label: 'Papelera', icon: Trash2 },
                    ].map(folder => {
                        const isActive = currentFolder === folder.id;
                        const unreadCount = folder.id === 'inbox' ? messages.filter(m => m.status === 'NEW').length : 0;
                        return (
                            <button
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder.id as any)}
                                className={`flex items-center gap-4 px-6 py-2.5 mx-2 rounded-r-full text-sm transition-all ${isActive ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <folder.icon size={18} className={isActive ? 'text-green-600' : 'text-slate-400'} />
                                <span className="flex-1 text-left">{folder.label}</span>
                                {unreadCount > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* List Area Modern */}
                <div className={`flex-1 flex flex-col min-w-0 border-l ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
                    {/* List Header */}
                    <div className={`h-12 border-b flex items-center px-4 gap-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                        <button className="p-1 text-slate-400 hover:text-slate-600"><SettingsIcon size={16} /></button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{currentFolder}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {filteredMessages.map(msg => (
                            <button
                                key={msg.id}
                                onClick={() => { setSelectedMessage(msg); if (msg.status === 'NEW') markAsRead(msg.id); }}
                                className={`w-full flex items-center px-4 py-2 border-b group transition-colors ${selectedMessage?.id === msg.id ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'} ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}
                            >
                                <div className="flex items-center gap-4 w-full min-w-0">
                                    <div className="shrink-0 flex items-center gap-2">
                                        <button className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-yellow-400 transition-colors"><Star size={16} /></button>
                                        <div className={`w-4 h-4 rounded border-2 ${msg.status === 'NEW' ? 'border-green-600 bg-green-600' : 'border-slate-200 dark:border-slate-700'}`} />
                                    </div>
                                    <span className={`w-40 shrink-0 text-sm truncate ${msg.status === 'NEW' ? 'font-black' : 'font-medium'}`}>{msg.from.split('<')[0].trim() || msg.from}</span>
                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                        <span className={`text-sm truncate ${msg.status === 'NEW' ? 'font-bold' : 'font-medium opacity-60'}`}>{msg.subject}</span>
                                        <span className="text-sm text-slate-400 truncate font-medium">- {msg.body.replace(/<[^>]*>?/gm, '').substring(0, 100)}</span>
                                    </div>
                                    <span className="shrink-0 text-[10px] font-bold text-slate-400 uppercase">{new Date(msg.receivedAt).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Area Modern (If selected and screen is large) */}
                {selectedMessage && (
                    <div className={`w-[500px] xl:w-[650px] border-l flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="p-6 border-b flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <h2 className="text-lg font-black uppercase line-clamp-1">{selectedMessage.subject}</h2>
                            <div className="flex gap-1">
                                <button onClick={() => setIsMaximized(true)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all"><Eye size={18} /></button>
                                <button onClick={() => handleDelete(selectedMessage)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all"><X size={18} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-sm">{selectedMessage.from.charAt(0)}</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedMessage.from}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Para: {selectedMessage.to} • {new Date(selectedMessage.receivedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />
                            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {selectedMessage.attachments.map((att, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group">
                                            <Paperclip size={14} className="text-green-600" />
                                            <div className="min-w-0 max-w-[120px]">
                                                <p className="text-[10px] font-bold truncate uppercase">{att.filename}</p>
                                                <p className="text-[8px] font-medium text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <a href={att.url} download target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-green-600"><Download size={14} /></a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-white/50 dark:bg-slate-900/50">
                            <button onClick={() => { setReplyText(''); setShowCompose(true); setComposeTo(selectedMessage.from); setComposeSubject(`Re: ${selectedMessage.subject}`); }} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-700 transition-all w-full flex items-center justify-center gap-2">
                                <Send size={16} /> Responder
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        return layoutMode === 'glass' ? renderGlassLayout() : renderModernLayout();
    };

    return (
        <>
            {renderContent()}

            {/* Maximized Message View */}
            {isMaximized && selectedMessage && (
                <div className="fixed inset-0 z-[2500] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full h-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-slate-800">
                        <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-black text-xl shadow-inner">
                                    {selectedMessage.from.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{selectedMessage.subject}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">DE: {selectedMessage.from}</span>
                                        <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">PARA: {selectedMessage.to}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMaximized(false)}
                                className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-16 text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed font-medium bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950">
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />

                            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                <div className="mt-12 p-8 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <Paperclip size={16} />
                                        Documentos Adjuntos ({selectedMessage.attachments.length})
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedMessage.attachments.map((att, i) => (
                                            <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-green-100 dark:hover:border-green-900 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                                        {att.contentType.includes('pdf') ? <Eye size={20} className="text-red-400" /> : <Paperclip size={20} className="text-slate-400" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate uppercase tracking-tight">{att.filename}</p>
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

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        onClick={() => setShowCompose(false)}
                    />
                    <div className={`relative w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border h-full md:h-[80vh] md:rounded-[32px] transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <div className={`p-4 md:p-6 border-b flex justify-between items-center shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
                                    <Send size={20} />
                                </div>
                                <div>
                                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Nuevo Mensaje</h3>
                                    <p className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">@ciaestrumetal.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={`p-2 rounded-lg text-slate-400 hover:text-green-600 transition-all ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                    {theme === 'dark' ? <Smile size={18} /> : <Clock size={18} />}
                                </button>
                                <button
                                    onClick={() => setShowCompose(false)}
                                    className={`p-2 rounded-lg text-slate-400 transition-all ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 flex flex-col gap-4 overflow-y-auto flex-1">
                            {/* Templates Toolbar */}
                            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => {
                                        setComposeSubject('PRESENTACIÓN ESTRUMETAL - SOLUCIONES METALMECÁNICAS');
                                        setComposeBody('Estimado cliente,\n\nEs un gusto saludarle. Adjunto enviamos nuestra presentación corporativa resaltando la capacidad de nuestra planta para sus proyectos...\n\nAtentamente,\nEquipo Estrumetal');
                                    }}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                                >
                                    ✨ Presentación
                                </button>
                                <button
                                    onClick={() => {
                                        setComposeSubject('COTIZACIÓN ESTRUMETAL - REF: ');
                                        setComposeBody('Saludos cordiales,\n\nEn respuesta a su solicitud, adjunto encontrará la cotización formal para los servicios industriales requeridos.\n\nQuedamos atentos a sus comentarios.\n\nAtentamente,\nDepartamento de Ventas');
                                    }}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                                >
                                    📄 Cotización Base
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Para (Separar con coma)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ejemplo@cliente.com, otro@mail.com"
                                            value={composeTo}
                                            onChange={(e) => {
                                                setComposeTo(e.target.value);
                                                setShowRecipientsSuggest(true);
                                            }}
                                            onFocus={() => setShowRecipientsSuggest(true)}
                                            className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/10 transition-all placeholder:text-slate-400 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
                                        />
                                        {showRecipientsSuggest && composeTo.length > 0 && !composeTo.includes(',') && (
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
                                                            className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors border-b last:border-none ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 border-slate-700' : 'text-slate-600 hover:bg-green-50 hover:text-green-700 border-slate-50'}`}
                                                        >
                                                            {contact}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
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

                            <div className="flex flex-col gap-1.5 flex-1 min-h-[250px]">
                                <div className={`flex items-center gap-2 p-1 border-b mb-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <button onClick={() => setBodyFont('sans')} className={`p-2 rounded-lg text-[9px] font-black uppercase ${bodyFont === 'sans' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Sans</button>
                                    <button onClick={() => setBodyFont('serif')} className={`p-2 rounded-lg text-[9px] font-black uppercase ${bodyFont === 'serif' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Serif</button>
                                    <button onClick={() => setBodyFont('mono')} className={`p-2 rounded-lg text-[9px] font-black uppercase ${bodyFont === 'mono' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Mono</button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-400 hover:text-green-600"><Smile size={18} /></button>
                                    <label className="p-2 text-slate-400 hover:text-green-600 cursor-pointer">
                                        <Paperclip size={18} />
                                        <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setComposeFiles(Array.from(e.target.files)); }} />
                                    </label>
                                </div>
                                <textarea
                                    className={`w-full flex-1 border rounded-xl px-4 py-3 text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-green-500/10 transition-all resize-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-600'} ${bodyFont === 'serif' ? 'font-serif' : bodyFont === 'mono' ? 'font-mono' : 'font-sans'}`}
                                    placeholder="Escribe el cuerpo del correo aquí..."
                                    value={composeBody}
                                    onChange={(e) => setComposeBody(e.target.value)}
                                />
                                {composeFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {composeFiles.map((file, i) => (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                <Paperclip size={12} /> {file.name}
                                                <button onClick={() => setComposeFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`p-4 md:p-6 border-t flex justify-between items-center shrink-0 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/30 border-slate-50'}`}>
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
                                className="px-4 py-3 text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-all flex items-center gap-2"
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
                                                const recipients = composeTo.split(/[,;]/).map(r => r.trim()).filter(Boolean);
                                                let attachments: Attachment[] = [];
                                                if (composeFiles.length > 0) {
                                                    attachments = await handleFileUpload(composeFiles);
                                                }

                                                for (const recipient of recipients) {
                                                    const response = await fetch('/api/mail/send', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            to: recipient,
                                                            subject: composeSubject,
                                                            body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${composeBody.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                                                            fromName: auth.currentUser?.displayName || senderAccount.split('@')[0].toUpperCase(),
                                                            fromEmail: senderAccount,
                                                            attachments: attachments
                                                        })
                                                    });

                                                    if (response.ok) {
                                                        await addDoc(collection(db, 'incoming_messages'), {
                                                            from: senderAccount,
                                                            to: recipient,
                                                            subject: composeSubject,
                                                            body: `<div style="font-family: ${bodyFont === 'serif' ? 'serif' : bodyFont === 'mono' ? 'monospace' : 'sans-serif'}">${composeBody.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                                                            receivedAt: new Date().toISOString(),
                                                            status: 'SENT',
                                                            attachments: attachments
                                                        });
                                                    }
                                                }

                                                addToast('success', 'Envío procesado correctamente');
                                                setShowCompose(false);
                                                setComposeTo('');
                                                setComposeSubject('');
                                                setComposeBody('');
                                                setComposeFiles([]);
                                            } catch (e) {
                                                addToast('success', 'Error en el servidor');
                                            } finally {
                                                setIsSending(false);
                                                setUndoTimer(null);
                                            }
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

            {/* SubSettings Modal */}
            {showSubSettings && (
                <div className="fixed inset-0 z-[2800] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowSubSettings(false)} />
                    <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Mi Cuenta</h3>
                            <button onClick={() => setShowSubSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-10 flex flex-col items-center gap-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-600/20 shadow-2xl group-hover:border-green-600 transition-all cursor-pointer">
                                    {userProfile.photoURL ? <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-slate-400">{userProfile.displayName?.charAt(0)}</div>}
                                </div>
                                <label className="absolute bottom-1 right-1 p-2.5 bg-green-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-green-700 transition-all">
                                    <ImageIcon size={18} />
                                    <input type="file" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const storageRef = ref(storage, `profiles/${auth.currentUser?.uid}/${Date.now()}_${file.name}`);
                                            await uploadBytes(storageRef, file);
                                            const url = await getDownloadURL(storageRef);
                                            await updateProfile?.({ photoURL: url });
                                            setUserProfile(prev => ({ ...prev, photoURL: url }));
                                            addToast('success', 'Imagen de perfil actualizada');
                                        }
                                    }} />
                                </label>
                            </div>
                            <div className="w-full space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Público</label>
                                    <input
                                        type="text"
                                        value={userProfile.displayName}
                                        onChange={(e) => setUserProfile(prev => ({ ...prev, displayName: e.target.value }))}
                                        onBlur={async () => {
                                            await updateProfile?.({ displayName: userProfile.displayName });
                                            addToast('success', 'Nombre actualizado');
                                        }}
                                        className={`w-full border rounded-2xl px-5 py-3 text-xs font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:bg-slate-900 focus:border-green-600' : 'bg-slate-50 border-slate-100 text-slate-800 focus:bg-white focus:border-green-600'}`}
                                    />
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Modo de Diseño</p>
                                        <div className="p-1 bg-white dark:bg-slate-900 rounded-xl flex gap-1 shadow-inner border border-slate-100 dark:border-white/5">
                                            <button onClick={() => setLayoutMode('glass')} className={`p-2 rounded-lg transition-all ${layoutMode === 'glass' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}><Layout size={16} /></button>
                                            <button onClick={() => setLayoutMode('modern')} className={`p-2 rounded-lg transition-all ${layoutMode === 'modern' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}><Inbox size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Tema Oscuro</p>
                                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-12 h-6 rounded-full relative transition-all ${theme === 'dark' ? 'bg-green-600' : 'bg-slate-200 shadow-inner'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
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
        </>
    );
};

export default MailPage;
