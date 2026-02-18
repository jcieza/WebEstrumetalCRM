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
import { getGravatarUrl, initGravatarHovercards, openGravatarQuickEditor, getGravatarQRUrl } from '@/utils/gravatar';
import GravatarHoverCard from './GravatarHoverCard';
import GmailCompose from './GmailCompose';
import { useSearchParams } from 'next/navigation';

const GMAIL_THEME = {
    dark: {
        bg: '#1A1C1E',
        surface: '#212429',
        surfaceVariant: '#2D2F33',
        textPrimary: '#E2E2E6',
        textSecondary: '#C4C6D0',
        textMuted: '#8E9199',
        accent: '#D3E3FD',
        onAccent: '#041E49',
        accentBlue: '#7CACEA',
        selection: 'rgba(211, 227, 253, 0.08)'
    },
    light: {
        bg: '#F6F8FC',
        surface: '#FFFFFF',
        surfaceVariant: '#EAF1FB',
        textPrimary: '#1F1F1F',
        textSecondary: '#444746',
        textMuted: '#707070',
        accent: '#0B57D0',
        onAccent: '#FFFFFF',
        accentBlue: '#0B57D0',
        selection: '#E2E7FF'
    }
};

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
    const [layoutMode, setLayoutMode] = useState<'modern' | 'glass' | 'gmail'>('gmail');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showCompose, setShowCompose] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSubSettings, setShowSubSettings] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [activeTab, setActiveTab] = useState<'mail' | 'meet'>('mail');
    const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'new' | 'info'; message: string }[]>([]);

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
    const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    const [userProfile, setUserProfile] = useState({
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || '',
        email: auth.currentUser?.email || '',
    });

    const addToast = (type: 'success' | 'new' | 'info', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const searchParams = useSearchParams();
    const [gravatarToken, setGravatarToken] = useState<string | null>(null);

    useEffect(() => {
        // Init Hovercards
        initGravatarHovercards();

        // Handle URL Params for Toast
        const gravatarStatus = searchParams.get('gravatar_status');
        if (gravatarStatus === 'success') {
            addToast('success', 'Gravatar vinculado correctamente');
        } else if (gravatarStatus === 'error') {
            const errorType = searchParams.get('error');
            if (errorType === 'not_configured') {
                addToast('info', 'Gravatar: Se requiere configuración de API');
            } else {
                addToast('info', 'Error al vincular Gravatar');
            }
        }

        // Read Token from Cookie
        const tokenMatch = document.cookie.match(/gravatar_token=([^;]+)/);
        if (tokenMatch) {
            setGravatarToken(tokenMatch[1]);
        }
    }, [searchParams]);

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

    // Isolated Email Viewer Component
    const EmailBodyViewer = ({ html, theme }: { html: string; theme: 'light' | 'dark' }) => {
        const iframeRef = React.useRef<HTMLIFrameElement>(null);

        const adjustHeight = () => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const body = iframeRef.current.contentWindow.document.body;
                const html = iframeRef.current.contentWindow.document.documentElement;
                const height = Math.max(
                    body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight
                );
                iframeRef.current.style.height = `${height + 40}px`;
            }
        };

        useEffect(() => {
            const iframe = iframeRef.current;
            if (!iframe) return;

            // Inyectar el HTML con estilos base para asegurar legibilidad si el mail no trae estilos
            const baseStyles = `
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: ${theme === 'dark' ? '#cbd5e1' : '#334155'};
                        margin: 0;
                        padding: 0;
                    }
                    img { max-width: 100%; height: auto; display: block; }
                    a { color: #16a34a; }
                    /* Prevenir scrollbars internos duplicados */
                    html, body { overflow: hidden; }
                </style>
            `;

            iframe.srcdoc = `${baseStyles}${html}`;

            // Ajustar altura inicial y en cada carga
            iframe.onload = adjustHeight;

            // Resize observer para emails dinámicos
            const observer = new ResizeObserver(adjustHeight);
            if (iframe.contentWindow?.document.body) {
                observer.observe(iframe.contentWindow.document.body);
            }

            return () => observer.disconnect();
        }, [html, theme]);

        return (
            <iframe
                ref={iframeRef}
                title="Email Content"
                className="w-full border-none transition-all duration-300 pointer-events-auto"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
                loading="lazy"
            />
        );
    };

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
        // Mejorado: El filtro de cuenta debe considerar tanto el receptor como el emisor
        const matchesAccount = filterAccount === 'all' || m.to === filterAccount || m.from === filterAccount;
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
                        <img
                            src={userProfile.photoURL || getGravatarUrl(userProfile.email) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
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
                                                <span
                                                    className={`text-[12px] truncate uppercase ${msg.status === 'NEW' ? 'font-black' : 'font-medium opacity-60'}`}
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setHoverPosition({ x: rect.left, y: rect.bottom });
                                                        setHoveredEmail(msg.from.includes('<') ? msg.from.split('<')[1].split('>')[0] : msg.from);
                                                    }}
                                                    onMouseLeave={() => setHoveredEmail(null)}
                                                >
                                                    {msg.from.split('<')[0].replace(/"/g, '') || msg.from}
                                                </span>
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
                                <div className={`prose prose-slate max-w-none text-slate-700 leading-relaxed text-base ${theme === 'dark' ? 'prose-invert' : ''}`}>
                                    <EmailBodyViewer html={selectedMessage.body} theme={theme} />
                                </div>
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

    const renderModernLayout = () => {
        const colors = theme === 'dark' ? GMAIL_THEME.dark : GMAIL_THEME.light;

        return (
            <div
                className={`fixed inset-0 flex flex-col transition-colors duration-300`}
                style={{ backgroundColor: colors.bg, color: colors.textPrimary, fontFamily: 'Roboto, sans-serif' }}
            >
                {/* Header Modern - Rediseñado para Mobile */}
                <div
                    className={`h-14 md:h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-50`}
                    style={{ borderBottom: `1px solid ${theme === 'dark' ? '#2D2F33' : '#E0E0E0'}` }}
                >
                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all"
                        >
                            <Menu size={22} style={{ color: colors.textSecondary }} />
                        </button>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0B57D0] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">E</div>
                            <span className="text-lg font-bold tracking-tight">Estrumetal <span className="text-[#0B57D0]">Mail</span></span>
                        </div>
                    </div>

                    {/* Search Bar - Gmail Style 28px Radius */}
                    <div className="flex-1 max-w-2xl px-2 md:px-12">
                        <div
                            className="relative group flex items-center px-4 py-2 md:py-3 transition-all cursor-text shadow-sm"
                            style={{
                                borderRadius: '28px',
                                backgroundColor: theme === 'dark' ? colors.surfaceVariant : colors.surfaceVariant
                            }}
                        >
                            <Search className="text-slate-400 group-focus-within:text-green-600 transition-colors mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar en el correo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm md:text-base font-normal placeholder:text-slate-500"
                                style={{ color: colors.textPrimary }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setLayoutMode('glass')}
                            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-green-600 transition-all hover:bg-white/5"
                        >
                            <Layout size={20} />
                        </button>
                        <button
                            onClick={() => setShowSubSettings(true)}
                            className="p-1 rounded-full border-2 border-transparent hover:border-slate-300 transition-all shrink-0"
                        >
                            <img
                                src={userProfile.photoURL || getGravatarUrl(userProfile.email) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                alt="User"
                                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover"
                            />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar Modern / Mobile Drawer */}
                    <div
                        className={`fixed md:relative inset-y-0 left-0 w-72 md:w-64 z-[60] flex flex-col py-4 shrink-0 transition-transform duration-300 ease-in-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                        style={{ backgroundColor: colors.bg }}
                    >
                        <div className="px-4 mb-6 hidden md:block">
                            <button
                                onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                                className="bg-[#C2E7FF] text-[#001D35] px-6 py-4 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all font-bold text-sm shadow-sm w-full"
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
                                    onClick={() => { setCurrentFolder(folder.id as any); setShowMobileSidebar(false); }}
                                    className={`flex items-center gap-4 px-6 py-3.5 mx-2 rounded-full text-sm transition-all group ${isActive ? 'bg-[#C2E7FF] text-[#001D35] font-bold shadow-sm' : 'hover:bg-white/5'}`}
                                    style={{ color: isActive ? '#001D35' : colors.textSecondary }}
                                >
                                    <folder.icon size={20} className={isActive ? 'text-[#001D35]' : colors.textSecondary} />
                                    <span className="flex-1 text-left uppercase text-[11px] font-black tracking-widest">{folder.label}</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] bg-[#0B57D0] text-white px-2.5 py-0.5 rounded-full font-black">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Overlay for Mobile Sidebar */}
                    {showMobileSidebar && (
                        <div
                            className="md:hidden fixed inset-0 bg-black/60 z-[55] backdrop-blur-sm"
                            onClick={() => setShowMobileSidebar(false)}
                        />
                    )}

                    {/* List Area Modern */}
                    <div
                        className={`flex-1 flex flex-col min-w-0 transition-opacity duration-300 ${showMobileDetail ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
                    >
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {filteredMessages.length > 0 ? filteredMessages.map(msg => {
                                const isUnread = msg.status === 'NEW';
                                return (
                                    <button
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (isUnread) markAsRead(msg.id);
                                            if (window.innerWidth < 768) setShowMobileDetail(true);
                                        }}
                                        className={`w-full flex items-center px-4 md:px-6 py-4 transition-colors border-none relative group`}
                                        style={{ backgroundColor: selectedMessage?.id === msg.id ? colors.surfaceVariant : 'transparent' }}
                                    >
                                        <div className="flex items-start gap-4 w-full min-w-0">
                                            {/* Avatar circular 40px */}
                                            <div className="shrink-0 pt-0.5">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shadow-sm" style={{ backgroundColor: '#0B57D0' }}>
                                                    {msg.from.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                                                <div className="flex justify-between w-full">
                                                    <span
                                                        className={`text-base truncate tracking-tight gravatar-hovercard`}
                                                        data-gravatar-email={msg.from.includes('<') ? msg.from.split('<')[1].split('>')[0] : msg.from}
                                                        style={{
                                                            fontWeight: isUnread ? 700 : 400,
                                                            color: isUnread ? colors.textPrimary : colors.textSecondary
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setHoverPosition({ x: rect.left, y: rect.bottom });
                                                            setHoveredEmail(msg.from.includes('<') ? msg.from.split('<')[1].split('>')[0] : msg.from);
                                                        }}
                                                        onMouseLeave={() => setHoveredEmail(null)}
                                                    >
                                                        {msg.from.split('<')[0].trim() || msg.from}
                                                    </span>
                                                    <span
                                                        className={`shrink-0 text-xs font-medium ml-2`}
                                                        style={{ color: isUnread ? colors.accentBlue : colors.textMuted }}
                                                    >
                                                        {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col w-full text-left">
                                                    <span
                                                        className={`text-sm truncate`}
                                                        style={{
                                                            fontWeight: isUnread ? 700 : 400,
                                                            color: colors.textPrimary
                                                        }}
                                                    >
                                                        {msg.subject}
                                                    </span>
                                                    <p
                                                        className="text-sm line-clamp-1 italic"
                                                        style={{ color: colors.textMuted }}
                                                    >
                                                        {msg.body.replace(/<[^>]*>?/gm, '').substring(0, 100)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Unread Indicator Dot */}
                                        {isUnread && (
                                            <div className="absolute left-2 w-1 h-3 bg-[#0B57D0] rounded-r-full" />
                                        )}
                                    </button>
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center p-12">
                                    <Mail size={64} className="mb-4" />
                                    <p className="text-xl font-bold uppercase tracking-widest">Bandeja Vacía</p>
                                    <p className="text-xs font-medium mt-2">No hay mensajes en esta categoría</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Area Modern / Mobile Slide-in Detail */}
                    {selectedMessage && (
                        <div
                            className={`fixed md:relative inset-0 z-50 md:z-0 md:flex w-full xl:w-[650px] flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${showMobileDetail ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
                            style={{ backgroundColor: colors.bg, borderLeft: `1px solid ${theme === 'dark' ? '#2D2F33' : '#E0E0E0'}` }}
                        >
                            <div className="p-4 md:p-6 border-b flex justify-between items-center" style={{ borderColor: theme === 'dark' ? '#2D2F33' : '#E0E0E0' }}>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowMobileDetail(false)}
                                        className="md:hidden p-2 hover:bg-white/10 rounded-full"
                                    >
                                        <ArrowRight size={22} className="rotate-180" style={{ color: colors.textSecondary }} />
                                    </button>
                                    <h2 className="text-lg md:text-xl font-bold tracking-tight line-clamp-1">{selectedMessage.subject}</h2>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => setIsMaximized(true)} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-all"><Eye size={20} /></button>
                                    <button onClick={() => handleDelete(selectedMessage)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                    <button onClick={() => { setSelectedMessage(null); setShowMobileDetail(false); }} className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-all"><X size={20} /></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold text-sm">
                                        {selectedMessage.from.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{selectedMessage.from}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Para: {selectedMessage.to} • {new Date(selectedMessage.receivedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mb-20">
                                    <EmailBodyViewer html={selectedMessage.body} theme={theme} />
                                </div>
                                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {selectedMessage.attachments.map((att, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl border group transition-all" style={{ backgroundColor: colors.surface, borderColor: theme === 'dark' ? '#2D2F33' : '#E0E0E0' }}>
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
                            <div className="p-6 border-t" style={{ backgroundColor: colors.bg, borderColor: theme === 'dark' ? '#2D2F33' : '#E0E0E0' }}>
                                <button
                                    onClick={() => { setReplyText(''); setShowCompose(true); setComposeTo(selectedMessage.from); setComposeSubject(`Re: ${selectedMessage.subject}`); }}
                                    className="px-6 py-3 bg-[#0B57D0] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#0842a0] transition-all w-full flex items-center justify-center gap-2"
                                >
                                    <Send size={18} /> Responder
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FAB - Redactar Mobile Gmail Style */}
                <button
                    onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                    className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#D3E3FD] text-[#041E49] rounded-2xl shadow-xl flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={28} />
                </button>
            </div>
        );
    };

    const renderGmailLayout = () => {
        const colors = theme === 'dark' ? GMAIL_THEME.dark : GMAIL_THEME.light;

        return (
            <div
                className={`fixed inset-0 flex flex-col transition-colors duration-300`}
                style={{ backgroundColor: colors.bg, color: colors.textPrimary, fontFamily: 'Roboto, sans-serif' }}
            >
                {/* Header Gmail Style */}
                <div
                    className={`h-14 md:h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-50`}
                    style={{ borderBottom: `1px solid ${theme === 'dark' ? '#2D2F33' : '#E0E0E0'}` }}
                >
                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all"
                        >
                            <Menu size={22} style={{ color: colors.textSecondary }} />
                        </button>
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#0B57D0] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">E</div>
                            <span className="text-xl font-bold tracking-tight">Estrumetal <span className="text-[#0B57D0]">Mail</span></span>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl px-2 md:px-12">
                        <div
                            className="relative group flex items-center px-4 md:px-6 py-2.5 md:py-3 transition-all cursor-text shadow-sm"
                            style={{
                                borderRadius: '28px',
                                backgroundColor: theme === 'dark' ? colors.surfaceVariant : '#f1f3f4'
                            }}
                        >
                            <Search className="text-slate-500 group-focus-within:text-green-600 transition-colors mr-3 md:mr-4" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar en el correo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm md:text-base font-normal placeholder:text-slate-500"
                                style={{ color: colors.textPrimary }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setLayoutMode('glass')}
                            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-green-600 transition-all hover:bg-white/5"
                        >
                            <Layout size={20} />
                        </button>
                        <button
                            onClick={() => setShowSubSettings(true)}
                            className="p-1 rounded-full border-2 border-transparent hover:border-slate-300 transition-all shrink-0"
                        >
                            <img
                                src={userProfile.photoURL || getGravatarUrl(userProfile.email) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                alt="User"
                                className="w-9 h-9 rounded-full object-cover"
                            />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar Gmail Style */}
                    <div
                        className={`fixed md:relative inset-y-0 left-0 w-72 md:w-64 z-[60] flex flex-col py-4 shrink-0 transition-transform duration-300 ease-in-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                        style={{ backgroundColor: colors.bg }}
                    >
                        <div className="px-4 mb-4">
                            <button
                                onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                                className="hidden md:flex bg-[#C2E7FF] text-[#001D35] px-6 py-5 rounded-2xl items-center gap-4 hover:shadow-lg transition-all font-bold text-sm shadow-sm"
                            >
                                <Plus size={24} /> <span className="text-base">Redactar</span>
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
                            const unreadCount = folder.id === 'inbox' ? messages.filter(m => m.status === 'NEW' && !['SENT', 'TRASH', 'ARCHIVED', 'DRAFT'].includes(m.status)).length : 0;
                            return (
                                <button
                                    key={folder.id}
                                    onClick={() => { setCurrentFolder(folder.id as any); setSelectedMessage(null); setShowMobileSidebar(false); }}
                                    className={`flex items-center gap-4 px-6 py-3 mr-2 rounded-r-full text-sm transition-all group ${isActive ? 'bg-[#D3E3FD] text-[#041E49] font-bold' : 'hover:bg-slate-200/50'}`}
                                    style={{ color: isActive ? '#041E49' : colors.textSecondary }}
                                >
                                    <folder.icon size={20} className={isActive ? 'text-[#041E49]' : colors.textSecondary} />
                                    <span className="flex-1 text-left text-sm font-normal">{folder.label}</span>
                                    {unreadCount > 0 && (
                                        <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Overlay for Mobile Sidebar */}
                    {showMobileSidebar && (
                        <div
                            className="md:hidden fixed inset-0 bg-black/50 z-[55]"
                            onClick={() => setShowMobileSidebar(false)}
                        />
                    )}

                    {/* Email List - Gmail Canvas Style */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white md:m-2 md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {currentFolder === 'inbox' && (
                                <div className="flex border-b border-slate-100">
                                    {['Principal', 'Promociones', 'Social'].map((tab, i) => (
                                        <button
                                            key={tab}
                                            className={`px-8 py-4 text-sm font-medium relative transition-colors ${i === 0 ? 'text-[#0B57D0] border-b-[3px] border-[#0B57D0]' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {i === 0 && <Inbox size={18} />}
                                                {tab}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {filteredMessages.length > 0 ? filteredMessages.map(msg => {
                                const isUnread = msg.status === 'NEW';
                                return (
                                    <button
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (isUnread) markAsRead(msg.id);
                                        }}
                                        className={`w-full flex items-start md:items-center px-4 md:px-6 py-4 md:py-3 transition-colors border-b border-slate-50 group ${isUnread ? 'bg-white shadow-sm ring-1 ring-inset ring-slate-100 z-10' : 'bg-[#f2f6fc]/50'}`}
                                    >
                                        <div className="flex items-start md:items-center gap-4 w-full min-w-0">
                                            {/* Left side: Selection and Star (Desktop only) */}
                                            <div className="hidden md:flex shrink-0 items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-sm group-hover:border-slate-400" />
                                                <Star size={18} className="text-slate-300 hover:text-yellow-400" />
                                            </div>

                                            {/* Mobile Avatar */}
                                            <div className="md:hidden shrink-0 mt-1">
                                                <div className="w-10 h-10 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {msg.from.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4">
                                                {/* Sender - Row 1 Mobile, Col 1 Desktop */}
                                                <div className="flex justify-between items-center md:block md:w-48 md:shrink-0">
                                                    <span
                                                        className={`text-sm md:text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'text-slate-600'}`}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setHoverPosition({ x: rect.left, y: rect.bottom });
                                                            setHoveredEmail(msg.from.includes('<') ? msg.from.split('<')[1].split('>')[0] : msg.from);
                                                        }}
                                                        onMouseLeave={() => setHoveredEmail(null)}
                                                    >
                                                        {msg.from.split('<')[0].trim() || msg.from}
                                                    </span>
                                                    {/* Date - Desktop remains far right, Mobile moves here */}
                                                    <span className={`md:hidden shrink-0 text-xs ${isUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                                        {new Date(msg.receivedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>

                                                {/* Subject and Body - Row 2 & 3 Mobile, Row 1 Desktop */}
                                                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-baseline md:gap-2">
                                                    <span className={`text-sm md:text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                        {msg.subject}
                                                    </span>
                                                    <span className="text-sm text-slate-500 truncate font-normal line-clamp-2 md:line-clamp-1">
                                                        {window.innerWidth < 768 ? '' : '- '}{msg.body.replace(/<[^>]*>?/gm, '').substring(0, 100)}
                                                    </span>
                                                </div>

                                                {/* Date - Desktop far right */}
                                                <span className={`hidden md:block shrink-0 text-xs ${isUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                                    {new Date(msg.receivedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center p-12">
                                    <Mail size={80} className="mb-6 text-slate-200" />
                                    <p className="text-xl font-medium text-slate-400">Tu bandeja de entrada está vacía</p>
                                </div>
                            )}
                        </div>

                        {/* Overlay Message View */}
                        {selectedMessage && (
                            <div
                                className="absolute inset-0 z-40 bg-white flex flex-col md:rounded-2xl animate-in slide-in-from-bottom-4 duration-200"
                            >
                                {/* Gmail Toolbar */}
                                <div className="h-14 md:h-12 flex items-center justify-between px-2 md:px-4 border-b border-slate-100 shrink-0">
                                    <div className="flex items-center gap-1 md:gap-4">
                                        <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600">
                                            <ArrowRight size={20} className="rotate-180" />
                                        </button>
                                        <div className="flex items-center gap-0.5 md:gap-1">
                                            {[
                                                { icon: Archive, label: 'Archivar', action: () => handleArchive(selectedMessage) },
                                                { icon: Trash2, label: 'Eliminar', action: () => handleDelete(selectedMessage) },
                                                { icon: Mail, label: 'Marcar no leído', action: () => markAsUnread(selectedMessage.id) },
                                                { icon: Clock, label: 'Pospuesto', action: () => { } },
                                                { icon: Menu, label: 'Más', action: () => { } },
                                            ].map((btn, i) => (
                                                <button
                                                    key={i}
                                                    onClick={btn.action}
                                                    title={btn.label}
                                                    className={`p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600 ${i > 2 ? 'hidden md:flex' : 'flex'}`}
                                                >
                                                    <btn.icon size={18} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        <span>4 de 37</span>
                                        <div className="flex items-center gap-1">
                                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-300"><ChevronRight size={18} className="rotate-180" /></button>
                                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ChevronRight size={18} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    <div className="max-w-4xl mx-auto px-6 py-8 md:px-12">
                                        {/* Subject */}
                                        <div className="flex items-start justify-between mb-6 md:mb-8">
                                            <h1 className="text-xl md:text-[22px] font-normal text-[#1f1f1f] leading-tight flex-1">
                                                {selectedMessage.subject}
                                                <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded uppercase tracking-wider inline-block align-middle">Recibidos</span>
                                            </h1>
                                            <div className="flex items-center gap-2 md:gap-4 ml-4">
                                                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><Star size={20} /></button>
                                            </div>
                                        </div>

                                        {/* Sender Metadata */}
                                        <div className="flex items-start gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                {selectedMessage.from.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900">{selectedMessage.from.split('<')[0].trim() || selectedMessage.from}</span>
                                                        <span className="text-xs text-slate-500">&lt;{selectedMessage.from.includes('<') ? selectedMessage.from.split('<')[1].split('>')[0] : selectedMessage.from}&gt;</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-slate-500">{new Date(selectedMessage.receivedAt).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        <div className="flex items-center gap-1">
                                                            <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Star size={18} /></button>
                                                            <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Smile size={18} /></button>
                                                            <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowRight size={18} className="rotate-180" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">para {selectedMessage.to === senderAccount ? 'mí' : selectedMessage.to}</p>
                                            </div>
                                        </div>

                                        {/* Email Content */}
                                        <div className="mb-12">
                                            <EmailBodyViewer html={selectedMessage.body} theme={theme} />
                                        </div>

                                        {/* Attachments */}
                                        {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                            <div className="mt-8 border-t border-slate-100 pt-8">
                                                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                    <Paperclip size={16} /> Adjuntos ({selectedMessage.attachments.length})
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    {selectedMessage.attachments.map((att, i) => (
                                                        <div key={i} className="flex flex-col w-48 rounded-lg border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
                                                            <div className="h-28 bg-slate-50 flex items-center justify-center relative">
                                                                <ImageIcon size={32} className="text-slate-200" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <a href={att.url} download target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-lg text-[#0B57D0]"><Download size={18} /></a>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-white">
                                                                <p className="text-[11px] font-bold truncate text-slate-700">{att.filename}</p>
                                                                <p className="text-[9px] text-slate-400 font-medium">{(att.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Actions */}
                                        <div className="mt-12 flex gap-3">
                                            <button
                                                onClick={() => { setReplyText(''); setShowCompose(true); setComposeTo(selectedMessage.from); setComposeSubject(`Re: ${selectedMessage.subject}`); }}
                                                className="flex items-center gap-3 px-6 py-2.5 rounded-full border border-[#747775] text-[#1f1f1f] text-sm font-medium hover:bg-slate-50 transition-all"
                                            >
                                                <ArrowRight size={18} className="rotate-180" /> Responder
                                            </button>
                                            <button className="flex items-center gap-3 px-6 py-2.5 rounded-full border border-[#747775] text-[#1f1f1f] text-sm font-medium hover:bg-slate-50 transition-all">
                                                <ArrowRight size={18} /> Reenviar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FAB Gmail M3 Style */}
                {!selectedMessage && (
                    <button
                        onClick={() => { setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeFiles([]); setShowCompose(true); }}
                        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#C2E7FF] text-[#001D35] rounded-2xl shadow-xl flex items-center justify-center z-50 transition-all active:scale-95 shadow-[#C2E7FF]/20"
                        style={{ borderRadius: '16px' }}
                    >
                        <Plus size={28} />
                    </button>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (layoutMode === 'gmail') return renderGmailLayout();
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
                        <div className="flex-1 overflow-y-auto p-8 md:p-16 text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed font-medium bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950 no-scrollbar">
                            <div className="prose dark:prose-invert max-w-none">
                                <EmailBodyViewer html={selectedMessage.body} theme={theme} />
                            </div>

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

            {/* Compose Dockable Window */}
            {showCompose && (
                <GmailCompose
                    theme={theme}
                    onClose={() => setShowCompose(false)}
                    initialTo={composeTo}
                    initialSubject={composeSubject}
                    initialBody={composeBody}
                    onSend={async (data) => {
                        setIsSending(true);
                        try {
                            const recipients = data.to.split(/[,;]/).map(r => r.trim()).filter(Boolean);
                            let attachments: Attachment[] = [];
                            if (data.files.length > 0) {
                                attachments = await handleFileUpload(data.files);
                            }

                            for (const recipient of recipients) {
                                const response = await fetch('/api/mail/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        to: recipient,
                                        subject: data.subject,
                                        body: `<div style="font-family: sans-serif">${data.body.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
                                        fromName: auth.currentUser?.displayName || senderAccount.split('@')[0].toUpperCase(),
                                        fromEmail: senderAccount,
                                        attachments: attachments
                                    })
                                });

                                if (response.ok) {
                                    await addDoc(collection(db, 'incoming_messages'), {
                                        from: senderAccount,
                                        to: recipient,
                                        subject: data.subject,
                                        body: `<div style="font-family: sans-serif">${data.body.replace(/\n/g, '<br/>')}${ESTRUMETAL_SIGNATURE}</div>`,
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
                        } catch (e) {
                            addToast('success', 'Error en el servidor');
                        } finally {
                            setIsSending(false);
                        }
                    }}
                />
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
                                    <img
                                        src={userProfile.photoURL || getGravatarUrl(userProfile.email) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <label className="absolute bottom-1 right-1 p-2.5 bg-green-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-green-700 transition-all">
                                    <ImageIcon size={18} />
                                    <input type="file" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const storageRef = ref(storage, `profiles/${auth.currentUser?.uid}/${Date.now()}_${file.name}`);
                                            await uploadBytes(storageRef, file);
                                            const url = await getDownloadURL(storageRef);
                                            await updateProfile?.(undefined, url);
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
                                            await updateProfile?.(userProfile.displayName);
                                            addToast('success', 'Nombre actualizado');
                                        }}
                                        className={`w-full border rounded-2xl px-5 py-3 text-xs font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:bg-slate-900 focus:border-green-600' : 'bg-slate-50 border-slate-100 text-slate-800 focus:bg-white focus:border-green-600'}`}
                                    />
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Modo de Diseño</p>
                                        <div className="p-1 bg-white dark:bg-slate-900 rounded-xl flex gap-1 shadow-inner border border-slate-100 dark:border-white/5">
                                            <button onClick={() => setLayoutMode('glass')} className={`p-2 rounded-lg transition-all ${layoutMode === 'glass' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`} title="Glass Mode"><Layout size={16} /></button>
                                            <button onClick={() => setLayoutMode('modern')} className={`p-2 rounded-lg transition-all ${layoutMode === 'modern' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`} title="Modern Mode"><Inbox size={16} /></button>
                                            <button onClick={() => setLayoutMode('gmail')} className={`p-2 rounded-lg transition-all ${layoutMode === 'gmail' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`} title="Gmail Mode"><Mail size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Tema Oscuro</p>
                                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-12 h-6 rounded-full relative transition-all ${theme === 'dark' ? 'bg-green-600' : 'bg-slate-200 shadow-inner'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Gravatar Social</p>
                                            <p className="text-[8px] font-bold text-slate-500">Vincular para bio y redes</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    window.open('https://gravatar.com/connect', '_blank');
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                Crear Cuenta
                                            </button>

                                            {gravatarToken ? (
                                                <button
                                                    onClick={() => openGravatarQuickEditor(gravatarToken)}
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-green-600/20 text-green-500 hover:bg-green-600/30`}
                                                >
                                                    Editar Perfil
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        window.location.href = '/api/auth/gravatar/authorize';
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                                >
                                                    Vincular API
                                                </button>
                                            )}
                                        </div>
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
                        className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 animate-in slide-in-from-right fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600/90 text-white' :
                            toast.type === 'info' ? 'bg-blue-500/90 text-white' :
                                'bg-blue-600/90 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? <ShieldCheck size={20} /> : <Mail size={20} />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">
                                {toast.type === 'success' ? 'Éxito' : toast.type === 'info' ? 'Info' : 'Notificación'}
                            </p>
                            <p className="text-[12px] font-bold">{toast.message}</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Hover Card for Gravatar */}
            {hoveredEmail && (
                <div
                    className="fixed z-[9000] pointer-events-none"
                    style={{
                        left: Math.min(hoverPosition.x + 20, window.innerWidth - 300),
                        top: Math.min(hoverPosition.y + 20, window.innerHeight - 300)
                    }}
                >
                    <div className="pointer-events-auto">
                        <GravatarHoverCard email={hoveredEmail} theme={theme} />
                    </div>
                </div>
            )}
        </>
    );
};

export default MailPage;
