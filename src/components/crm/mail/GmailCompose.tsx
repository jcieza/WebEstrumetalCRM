import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Minus, Maximize2, Minimize2, Send, Paperclip,
    Link, Smile, Image as ImageIcon, Trash2,
    ChevronDown, MoreVertical, Type, Bold, Italic,
    Underline, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote,
    Strikethrough, Code, Trash, Check, User,
    Clock, Printer, Expand
} from 'lucide-react';
import { getGravatarUrl } from '@/utils/gravatar';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';

interface GmailComposeProps {
    onClose: () => void;
    theme: 'light' | 'dark';
    initialTo?: string;
    initialSubject?: string;
    initialBody?: string;
    initialDraftId?: string | null;
    senderAccount?: string;
    onSenderChange?: (account: string) => void;
    availableAccounts?: string[];
    onSend: (data: {
        to: string;
        subject: string;
        body: string;
        files: File[];
    }) => Promise<void>;
}

// Emojis comunes para negocios/comunicacion
const EMOJI_SET = [
    '👍', '👎', '✅', '❌', '⭐', '🔥', '💡', '📌',
    '📎', '📋', '📊', '📈', '💰', '🏗️', '🔧', '⚙️',
    '📞', '📧', '🕐', '📅', '🎯', '🚀', '💪', '🤝',
    '👏', '🙏', '😊', '😎', '🤔', '😅', '⚠️', '🔔',
];

const GmailCompose: React.FC<GmailComposeProps> = ({
    onClose,
    theme,
    initialTo = '',
    initialSubject = '',
    initialBody = '',
    initialDraftId = null,
    senderAccount,
    onSenderChange,
    availableAccounts = [],
    onSend
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSenderDropdown, setShowSenderDropdown] = useState(false);
    const [toInput, setToInput] = useState('');
    const [recipients, setRecipients] = useState<string[]>(initialTo ? initialTo.split(/[,;]/).map(e => e.trim()).filter(Boolean) : []);
    const [subject, setSubject] = useState(initialSubject);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [ccRecipients, setCcRecipients] = useState<string[]>([]);
    const [bccRecipients, setBccRecipients] = useState<string[]>([]);
    const [showFormatting, setShowFormatting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showSendOptions, setShowSendOptions] = useState(false);
    const [schedulingDate, setSchedulingDate] = useState<string>('');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [draftId, setDraftId] = useState<string | null>(initialDraftId);
    const [lastSaved, setLastSaved] = useState<number>(Date.now());
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [bodyTrigger, setBodyTrigger] = useState(0);

    const editorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const savedSelectionRef = useRef<Range | null>(null);

    const colors = theme === 'dark' ? {
        bg: '#1a1c1e',
        header: '#2d2f31',
        border: '#444746',
        text: '#e2e2e2',
        inputBg: 'transparent',
        toolbar: '#2d2f31'
    } : {
        bg: '#ffffff',
        header: '#f2f6fc',
        border: '#e0e0e0',
        text: '#1f1f1f',
        inputBg: 'transparent',
        toolbar: '#ffffff'
    };

    // Inicializar contenido del editor
    useEffect(() => {
        if (editorRef.current && initialBody) {
            editorRef.current.innerHTML = initialBody;
        }
    }, []);

    // Detectar formatos activos en la posicion del cursor
    const updateActiveFormats = useCallback(() => {
        const formats = new Set<string>();
        if (document.queryCommandState('bold')) formats.add('bold');
        if (document.queryCommandState('italic')) formats.add('italic');
        if (document.queryCommandState('underline')) formats.add('underline');
        if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
        if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
        if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
        setActiveFormats(formats);
    }, []);

    // Ejecutar comando de formato
    const execFormat = (command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        updateActiveFormats();
    };

    // Guardar seleccion antes de abrir dialogo
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
            setLinkText(sel.toString());
        }
    };

    // Restaurar seleccion
    const restoreSelection = () => {
        if (savedSelectionRef.current) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(savedSelectionRef.current);
        }
    };

    const handleAddRecipient = (val: string, type: 'to' | 'cc' | 'bcc') => {
        const email = val.trim();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (type === 'to') setRecipients([...recipients, email]);
            if (type === 'cc') setCcRecipients([...ccRecipients, email]);
            if (type === 'bcc') setBccRecipients([...bccRecipients, email]);
            return true;
        }
        return false;
    };

    const removeRecipient = (index: number, type: 'to' | 'cc' | 'bcc') => {
        if (type === 'to') setRecipients(recipients.filter((_, i) => i !== index));
        if (type === 'cc') setCcRecipients(ccRecipients.filter((_, i) => i !== index));
        if (type === 'bcc') setBccRecipients(bccRecipients.filter((_, i) => i !== index));
    };

    // Auto-save Draft
    useEffect(() => {
        const saveDraft = async () => {
            if (!senderAccount || (!toInput && !subject && !editorRef.current?.innerText)) return;
            setIsSavingDraft(true);
            try {
                const draftData = {
                    from: senderAccount,
                    to: recipients.join(', '),
                    subject,
                    body: editorRef.current?.innerHTML || '',
                    status: 'DRAFT',
                    receivedAt: new Date().toISOString(),
                    folder: 'drafts',
                    updatedAt: serverTimestamp()
                };

                if (draftId) {
                    await updateDoc(doc(db, 'incoming_messages', draftId), draftData);
                } else {
                    const docRef = await addDoc(collection(db, 'incoming_messages'), draftData);
                    setDraftId(docRef.id);
                }
                setLastSaved(Date.now());
            } catch (e) {
                console.error('Error saving draft:', e);
            } finally {
                setIsSavingDraft(false);
            }
        };

        const timer = setTimeout(saveDraft, 2000);
        return () => clearTimeout(timer);
    }, [toInput, subject, recipients, bodyTrigger, senderAccount, draftId]); // Body dependency might need handling if contentEditable doesn't update state directly

    const handleSend = async () => {
        const allTo = recipients.join(', ');
        if (!allTo) return;
        const bodyHtml = editorRef.current?.innerHTML || '';
        await onSend({
            to: allTo,
            subject,
            body: bodyHtml,
            files
        });
        // Delete draft after send
        if (draftId) {
            await deleteDoc(doc(db, 'incoming_messages', draftId));
        }
    };

    const handleScheduleSend = async () => {
        if (!schedulingDate) {
            alert('Por favor selecciona una fecha y hora');
            return;
        }

        const allTo = recipients.join(', ');
        if (!allTo || !senderAccount) return;

        setIsSavingDraft(true);
        try {
            const draftData = {
                from: senderAccount,
                to: allTo,
                subject,
                body: editorRef.current?.innerHTML || '',
                status: 'SCHEDULED', // Estado para la Cloud Function futura
                scheduledAt: new Date(schedulingDate).toISOString(),
                receivedAt: new Date().toISOString(),
                folder: 'outbox', // Simulando bandeja de salida
                updatedAt: serverTimestamp()
            };

            if (draftId) {
                await updateDoc(doc(db, 'incoming_messages', draftId), draftData);
            } else {
                await addDoc(collection(db, 'incoming_messages'), draftData);
            }

            // Cerrar y notificar (el MailPage u otra vista mostrara Toast si fuera un full prop, por ahora solo console o cerrar)
            onClose();
        } catch (e) {
            console.error('Error scheduling email:', e);
            alert('Hubo un error al programar el correo');
        } finally {
            setIsSavingDraft(false);
            setShowSendOptions(false);
        }
    };

    // Insertar enlace
    const handleInsertLink = () => {
        restoreSelection();
        if (linkUrl) {
            const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
            if (linkText && !window.getSelection()?.toString()) {
                // Insertar link con texto
                document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" style="color: #0b57d0; text-decoration: underline;">${linkText}</a>`);
            } else {
                document.execCommand('createLink', false, url);
            }
        }
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkText('');
    };

    // Insertar imagen inline
    const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            editorRef.current?.focus();
            document.execCommand('insertHTML', false,
                `<img src="${reader.result}" alt="${file.name}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`
            );
        };
        reader.readAsDataURL(file);
        if (e.target) e.target.value = '';
    };

    // Insertar emoji
    const handleEmojiInsert = (emoji: string) => {
        editorRef.current?.focus();
        document.execCommand('insertText', false, emoji);
        setShowEmojiPicker(false);
    };

    // Insertar bloque de cita
    const handleBlockQuote = () => {
        execFormat('formatBlock', 'blockquote');
        // Aplicar estilo visual al blockquote
        setTimeout(() => {
            const bqs = editorRef.current?.querySelectorAll('blockquote');
            bqs?.forEach(bq => {
                (bq as HTMLElement).style.borderLeft = '3px solid #ccc';
                (bq as HTMLElement).style.paddingLeft = '12px';
                (bq as HTMLElement).style.margin = '8px 0';
                (bq as HTMLElement).style.color = '#666';
            });
        }, 10);
    };

    // Insertar bloque de codigo
    const handleCodeBlock = () => {
        const sel = window.getSelection();
        const text = sel?.toString() || '';
        if (text) {
            document.execCommand('insertHTML', false,
                `<pre style="background: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'}; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; margin: 8px 0; overflow-x: auto;"><code>${text}</code></pre>`
            );
        } else {
            document.execCommand('insertHTML', false,
                `<code style="background: ${theme === 'dark' ? '#1e1e1e' : '#f0f0f0'}; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px;">&nbsp;</code>`
            );
        }
    };

    // Limpiar todo el formato
    const handleClearFormatting = () => {
        execFormat('removeFormat');
        // Tambien remover formatos de bloque
        execFormat('formatBlock', 'div');
    };

    if (isMinimized) {
        return (
            <div
                className={`fixed bottom-0 right-8 w-64 rounded-t-xl shadow-2xl border border-b-0 flex items-center justify-between px-4 py-3 cursor-pointer z-[2000]`}
                style={{ backgroundColor: colors.header, borderColor: colors.border, color: colors.text }}
                onClick={() => setIsMinimized(false)}
            >
                <span className="text-sm font-bold truncate">{subject || 'Mensaje nuevo'}</span>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="p-1 hover:bg-black/10 rounded"><Maximize2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-black/10 rounded"><X size={14} /></button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`fixed z-[2000] shadow-2xl flex flex-col transition-all duration-300 ${isMaximized ? 'inset-4 rounded-2xl' : 'bottom-0 right-8 w-[512px] h-[600px] rounded-t-xl border border-b-0'}`}
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between px-4 py-2 shrink-0 ${isMaximized ? 'rounded-t-2xl' : 'rounded-t-xl'}`}
                style={{ backgroundColor: colors.header, color: colors.text }}
            >
                <span className="text-sm font-bold">{subject || 'Mensaje nuevo'}</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-black/10 rounded transition-colors"><Minus size={18} /></button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-black/10 rounded transition-colors">{isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                    <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded transition-colors"><X size={18} /></button>
                </div>
            </div>

            {/* Recipients Section */}
            <div className="flex flex-col shrink-0">
                {/* Sender (De) Field */}
                {senderAccount && availableAccounts.length > 0 && (
                    <div className="relative flex items-center px-4 py-1.5 border-b gap-2 min-h-[40px]" style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1' }}>
                        <span className="text-sm text-slate-500 w-8">De</span>
                        <button
                            onClick={() => setShowSenderDropdown(!showSenderDropdown)}
                            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                        >
                            <img src={getGravatarUrl(senderAccount, 64)} alt="" className="w-6 h-6 rounded-full shadow-sm" />
                            <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#e2e2e2' : '#1f1f1f' }}>
                                {senderAccount}
                            </span>
                            <ChevronDown size={12} className={`text-slate-400 transition-transform ${showSenderDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSenderDropdown && (
                            <div className={`absolute left-12 top-full mt-1 z-50 rounded-xl shadow-2xl border overflow-hidden min-w-[280px] ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                <div className="px-3 py-2 border-b" style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1' }}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enviar como</span>
                                </div>
                                {availableAccounts.map((account) => (
                                    <button
                                        key={account}
                                        onClick={() => { onSenderChange?.(account); setShowSenderDropdown(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${account === senderAccount
                                            ? (theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50')
                                            : (theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                                            }`}
                                    >
                                        <img src={getGravatarUrl(account, 64)} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                                        <div className="flex-1 text-left">
                                            <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{account.split('@')[0]}</p>
                                            <p className="text-[10px] text-slate-400">{account}</p>
                                        </div>
                                        {account === senderAccount && <Check size={14} className="text-green-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* To Field */}
                <div className="flex items-center px-4 py-1.5 border-b gap-2 min-h-[40px] flex-wrap" style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1' }}>
                    <span className="text-sm text-slate-500 w-8">Para</span>
                    <div className="flex-1 flex flex-wrap gap-1 items-center">
                        {recipients.map((email, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 h-7 pl-1.5 pr-1 rounded-full border border-transparent hover:border-slate-400 group transition-all">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{email}</span>
                                <button onClick={() => removeRecipient(idx, 'to')} className="p-0.5 hover:bg-black/10 rounded-full text-slate-400 group-hover:text-slate-600">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <input
                            type="text"
                            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm py-1"
                            style={{ color: colors.text }}
                            value={toInput}
                            onChange={(e) => setToInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    if (handleAddRecipient(toInput, 'to')) setToInput('');
                                }
                                if (e.key === 'Backspace' && !toInput && recipients.length > 0) {
                                    removeRecipient(recipients.length - 1, 'to');
                                }
                            }}
                            onBlur={() => { if (toInput) { if (handleAddRecipient(toInput, 'to')) setToInput(''); } }}
                            placeholder=""
                        />
                    </div>
                    {!showCc && !showBcc && (
                        <div className="flex gap-2 mr-2">
                            <button onClick={() => setShowCc(true)} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cc</button>
                            <button onClick={() => setShowBcc(true)} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cco</button>
                        </div>
                    )}
                </div>

                {/* CC Field */}
                {showCc && (
                    <div className="flex items-center px-4 py-1.5 border-b gap-2 min-h-[40px] flex-wrap" style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1' }}>
                        <span className="text-sm text-slate-500 w-8">Cc</span>
                        <div className="flex-1 flex flex-wrap gap-1 items-center">
                            {ccRecipients.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 h-7 pl-1.5 pr-1 rounded-full border border-transparent hover:border-slate-400 group transition-all">
                                    <span className="text-xs font-medium ml-1 text-slate-700 dark:text-slate-200">{email}</span>
                                    <button onClick={() => removeRecipient(idx, 'cc')} className="p-0.5 hover:bg-black/10 rounded-full text-slate-400">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm py-1"
                                style={{ color: colors.text }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value;
                                        if (handleAddRecipient(val, 'cc')) (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Subject Field */}
                <div className="px-4 border-b" style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1' }}>
                    <input
                        type="text"
                        placeholder="Asunto"
                        className="w-full bg-transparent border-none outline-none text-sm py-3 font-medium"
                        style={{ color: colors.text }}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
            </div>

            {/* Body Editor Area - ContentEditable */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-white dark:bg-slate-950">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full flex-1 bg-transparent border-none outline-none text-sm md:text-base leading-relaxed min-h-[200px]"
                    style={{ color: colors.text, fontFamily: 'Roboto, sans-serif' }}
                    onSelect={updateActiveFormats}
                    onKeyUp={updateActiveFormats}
                    onMouseUp={updateActiveFormats}
                    onInput={() => setBodyTrigger(prev => prev + 1)}
                    data-placeholder="Escribe tu mensaje aqui..."
                />

                {files.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg">
                                <Paperclip size={14} className="text-slate-400" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{file.name}</span>
                                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Advanced Formatting Toolbar */}
            {showFormatting && (
                <div
                    className="shrink-0 flex items-center px-4 py-1.5 border-t border-b mx-4 gap-0.5"
                    style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1', backgroundColor: colors.toolbar }}
                >
                    {[
                        { icon: Bold, label: 'Negrita', cmd: 'bold' },
                        { icon: Italic, label: 'Cursiva', cmd: 'italic' },
                        { icon: Underline, label: 'Subrayado', cmd: 'underline' },
                        { icon: Strikethrough, label: 'Tachado', cmd: 'strikeThrough' },
                    ].map((tool, i) => (
                        <button
                            key={i}
                            onClick={() => execFormat(tool.cmd)}
                            className={`p-1.5 rounded transition-colors ${activeFormats.has(tool.cmd)
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                                }`}
                            title={tool.label}
                        >
                            <tool.icon size={16} />
                        </button>
                    ))}

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Alignment */}
                    <button onClick={() => execFormat('justifyLeft')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400" title="Alinear izquierda">
                        <AlignLeft size={16} />
                    </button>
                    <button onClick={() => execFormat('justifyCenter')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400" title="Centrar">
                        <AlignCenter size={16} />
                    </button>
                    <button onClick={() => execFormat('justifyRight')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400" title="Alinear derecha">
                        <AlignRight size={16} />
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Lists */}
                    <button
                        onClick={() => execFormat('insertOrderedList')}
                        className={`p-1.5 rounded transition-colors ${activeFormats.has('insertOrderedList')
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                            }`}
                        title="Lista numerada"
                    >
                        <ListOrdered size={16} />
                    </button>
                    <button
                        onClick={() => execFormat('insertUnorderedList')}
                        className={`p-1.5 rounded transition-colors ${activeFormats.has('insertUnorderedList')
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                            }`}
                        title="Lista con vinetas"
                    >
                        <List size={16} />
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Quote & Code */}
                    <button onClick={handleBlockQuote} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400" title="Cita">
                        <Quote size={16} />
                    </button>
                    <button onClick={handleCodeBlock} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400" title="Codigo">
                        <Code size={16} />
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Clear formatting */}
                    <button onClick={handleClearFormatting} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-slate-500 hover:text-red-500 transition-colors" title="Limpiar formato">
                        <Trash size={16} />
                    </button>
                </div>
            )}

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="shrink-0 mx-4 p-3 border rounded-lg mb-1 flex flex-col gap-2" style={{ borderColor: colors.border, backgroundColor: theme === 'dark' ? '#252628' : '#fafafa' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insertar enlace</span>
                        <button onClick={() => { setShowLinkDialog(false); setLinkUrl(''); setLinkText(''); }} className="p-1 hover:bg-black/10 rounded">
                            <X size={12} className="text-slate-400" />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Texto a mostrar"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        className="w-full text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                        style={{ color: colors.text }}
                    />
                    <input
                        type="url"
                        placeholder="https://ejemplo.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                        style={{ color: colors.text }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleInsertLink(); }}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowLinkDialog(false); setLinkUrl(''); setLinkText(''); }} className="text-xs text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            Cancelar
                        </button>
                        <button onClick={handleInsertLink} className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg font-bold">
                            Insertar
                        </button>
                    </div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className={`shrink-0 mx-4 p-3 border rounded-xl mb-1 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emojis</span>
                        <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-black/10 rounded">
                            <X size={12} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                        {EMOJI_SET.map((emoji, i) => (
                            <button
                                key={i}
                                onClick={() => handleEmojiInsert(emoji)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 text-lg"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Toolbar */}
            <div className="px-4 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {/* Send Button Group */}
                    <div className="relative flex items-center">
                        <button
                            onClick={handleSend}
                            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6 py-2.5 rounded-l-full text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                        >
                            Enviar
                        </button>
                        <button
                            onClick={() => setShowSendOptions(!showSendOptions)}
                            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white pr-3 pl-2 py-2.5 rounded-r-full border-l border-white/20 transition-all"
                        >
                            <ChevronDown size={14} />
                        </button>

                        {/* Send Options Dropdown */}
                        {showSendOptions && (
                            <div className={`absolute bottom-full mb-2 left-0 rounded-xl shadow-2xl border overflow-hidden min-w-[200px] ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                <button
                                    onClick={() => { handleSend(); setShowSendOptions(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                >
                                    <Send size={14} className="text-blue-600" />
                                    <div>
                                        <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Enviar ahora</p>
                                        <p className="text-[10px] text-slate-400">Enviar inmediatamente</p>
                                    </div>
                                </button>

                                <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
                                    <p className={`text-xs font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <Clock size={14} className="text-orange-500" /> Programar nvio
                                    </p>
                                    <input
                                        type="datetime-local"
                                        value={schedulingDate}
                                        onChange={(e) => setSchedulingDate(e.target.value)}
                                        className={`w-full text-sm p-2 rounded outline-none border mb-2 ${theme === 'dark' ? 'bg-slate-800 border-white/20 text-white color-scheme-dark' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                    />
                                    <button
                                        onClick={handleScheduleSend}
                                        disabled={!schedulingDate || isSavingDraft}
                                        className="w-full bg-[#0b57d0] text-white text-xs font-bold py-2 rounded hover:bg-[#0842a0] disabled:opacity-50 transition-colors"
                                    >
                                        Confirmar Programacion
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowFormatting(!showFormatting)}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${showFormatting ? 'bg-slate-100 dark:bg-slate-800 text-[#0b57d0]' : 'text-slate-600 dark:text-slate-400'}`}
                            title="Opciones de formato"
                        >
                            <Type size={18} />
                        </button>
                        <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-600 dark:text-slate-400" title="Adjuntar archivos">
                            <Paperclip size={18} />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]); }}
                            />
                        </label>
                        <button
                            onClick={() => { saveSelection(); setShowLinkDialog(!showLinkDialog); setShowEmojiPicker(false); setShowMoreMenu(false); }}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${showLinkDialog ? 'bg-slate-100 dark:bg-slate-800 text-[#0b57d0]' : 'text-slate-600 dark:text-slate-400'}`}
                            title="Insertar enlace"
                        >
                            <Link size={18} />
                        </button>
                        <button
                            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowLinkDialog(false); setShowMoreMenu(false); }}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${showEmojiPicker ? 'bg-slate-100 dark:bg-slate-800 text-[#0b57d0]' : 'text-slate-600 dark:text-slate-400'}`}
                            title="Insertar emoji"
                        >
                            <Smile size={18} />
                        </button>
                        <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-600 dark:text-slate-400" title="Insertar imagen inline">
                            <ImageIcon size={18} />
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageInsert}
                            />
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => { setShowMoreMenu(!showMoreMenu); setShowEmojiPicker(false); setShowLinkDialog(false); }}
                                className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${showMoreMenu ? 'bg-slate-100 dark:bg-slate-800 text-[#0b57d0]' : 'text-slate-600 dark:text-slate-400'}`}
                                title="Mas opciones"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {/* More Options Menu */}
                            {showMoreMenu && (
                                <div className={`absolute bottom-full mb-2 right-0 rounded-xl shadow-2xl border overflow-hidden min-w-[180px] ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                    <button
                                        onClick={() => { setIsMaximized(!isMaximized); setShowMoreMenu(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                    >
                                        <Expand size={14} className="text-slate-500" />
                                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {isMaximized ? 'Reducir' : 'Pantalla completa'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const printContent = editorRef.current?.innerHTML || '';
                                            const printWindow = window.open('', '_blank');
                                            if (printWindow) {
                                                printWindow.document.write(`<html><head><title>${subject}</title><style>body { font-family: Roboto, sans-serif; padding: 40px; }</style></head><body><h2>${subject}</h2><p style="color:#888">Para: ${recipients.join(', ')}</p><hr/>${printContent}</body></html>`);
                                                printWindow.document.close();
                                                printWindow.print();
                                            }
                                            setShowMoreMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                    >
                                        <Printer size={14} className="text-slate-500" />
                                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Imprimir</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const text = editorRef.current?.innerText || '';
                                            if (text) {
                                                const blob = new Blob([text], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${subject || 'borrador'}.txt`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }
                                            setShowMoreMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                    >
                                        <Paperclip size={14} className="text-slate-500" />
                                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Exportar como .txt</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                        {isSavingDraft ? 'Guardando...' : `Guardado ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                    <button onClick={async () => {
                        if (draftId) await deleteDoc(doc(db, 'incoming_messages', draftId));
                        onClose();
                    }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 group" title="Descartar">
                        <Trash2 size={18} className="group-hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* CSS for placeholder */}
            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #999;
                    pointer-events: none;
                }
            `}</style>
        </div >
    );
};

export default GmailCompose;
