import React, { useState, useEffect, useRef } from 'react';
import {
    X, Minus, Maximize2, Minimize2, Send, Paperclip,
    Link, Smile, Image as ImageIcon, Trash2,
    ChevronDown, MoreVertical, Type, Bold, Italic,
    Underline, AlignLeft, List, ListOrdered, Quote,
    Strikethrough, Code, Trash, Check, User
} from 'lucide-react';

interface GmailComposeProps {
    onClose: () => void;
    theme: 'light' | 'dark';
    initialTo?: string;
    initialSubject?: string;
    initialBody?: string;
    onSend: (data: {
        to: string;
        subject: string;
        body: string;
        files: File[];
    }) => Promise<void>;
}

const GmailCompose: React.FC<GmailComposeProps> = ({
    onClose,
    theme,
    initialTo = '',
    initialSubject = '',
    initialBody = '',
    onSend
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [toInput, setToInput] = useState('');
    const [recipients, setRecipients] = useState<string[]>(initialTo ? initialTo.split(/[,;]/).map(e => e.trim()).filter(Boolean) : []);
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState(initialBody);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [ccRecipients, setCcRecipients] = useState<string[]>([]);
    const [bccRecipients, setBccRecipients] = useState<string[]>([]);
    const [showFormatting, setShowFormatting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

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

    const handleSend = async () => {
        const allTo = recipients.join(', ');
        if (!allTo) return;
        await onSend({
            to: allTo,
            subject,
            body,
            files
        });
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
                            onBlur={() => {
                                if (toInput) {
                                    if (handleAddRecipient(toInput, 'to')) setToInput('');
                                }
                            }}
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

            {/* Body Editor Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-white dark:bg-slate-950">
                <textarea
                    className="w-full flex-1 bg-transparent border-none outline-none text-sm md:text-base leading-relaxed resize-none h-full"
                    style={{ color: colors.text, fontFamily: 'Roboto, sans-serif' }}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
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

            {/* Advanced Formatting Toolbar (Floating/Docked) */}
            {showFormatting && (
                <div
                    className="shrink-0 flex items-center px-4 py-1.5 border-t border-b mx-4 gap-0.5"
                    style={{ borderColor: theme === 'dark' ? '#333' : '#f1f1f1', backgroundColor: colors.toolbar }}
                >
                    {[
                        { icon: Type, label: 'Font' },
                        { icon: Bold, label: 'Bold' },
                        { icon: Italic, label: 'Italic' },
                        { icon: Underline, label: 'Underline' },
                        { icon: Strikethrough, label: 'Strike' },
                        { icon: AlignLeft, label: 'Align' },
                        { icon: ListOrdered, label: 'List' },
                        { icon: List, label: 'Bullet' },
                        { icon: Quote, label: 'Quote' },
                        { icon: Code, label: 'Code' },
                    ].map((tool, i) => (
                        <button key={i} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-slate-500 dark:text-slate-400">
                            <tool.icon size={16} />
                        </button>
                    ))}
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
                    <button className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-slate-500"><Trash size={16} /></button>
                </div>
            )}

            {/* Bottom Toolbar */}
            <div className="px-4 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center">
                        <button
                            onClick={handleSend}
                            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6 py-2.5 rounded-l-full text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                        >
                            Enviar
                        </button>
                        <button className="bg-[#0b57d0] hover:bg-[#0842a0] text-white pr-3 pl-2 py-2.5 rounded-r-full border-l border-white/20 transition-all">
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowFormatting(!showFormatting)}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${showFormatting ? 'bg-slate-100 dark:bg-slate-800 text-[#0b57d0]' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            <Type size={18} />
                        </button>
                        <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-600 dark:text-slate-400">
                            <Paperclip size={18} />
                            <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
                        </label>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"><Link size={18} /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"><Smile size={18} /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"><ImageIcon size={18} /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"><MoreVertical size={18} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">Borrador guardado</span>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 group">
                        <Trash2 size={18} className="group-hover:text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GmailCompose;
