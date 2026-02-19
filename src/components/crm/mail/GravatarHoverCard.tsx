'use client';

import React, { useState, useEffect } from 'react';
import { fetchGravatarProfile, getGravatarUrl, getGravatarQRUrl } from '@/utils/gravatar';
import { Globe, MapPin, ExternalLink, Loader2, QrCode, Briefcase, Building2, Clock, Languages } from 'lucide-react';

/**
 * Mapeo de servicios verificados a sus iconos SVG inline.
 * Evitamos dependencias externas; usamos paths SVG directos de marcas conocidas.
 */
const VERIFIED_SERVICE_ICONS: Record<string, React.ReactNode> = {
    github: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    wordpress: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.539.82-2.771.82-3.864 0-.397-.026-.765-.07-1.109zm-7.981.105c.647-.034 1.233-.1 1.233-.1.582-.075.514-.921-.066-.888 0 0-1.749.138-2.874.138-.066 0-.14-.003-.217-.006C10.037 4.442 8.382 3 6.478 3 4.842 3 3.475 3.958 2.748 5.33c.203.007.395.011.565.011 1.126 0 2.871-.137 2.871-.137.579-.034.648.811.069.878 0 0-.584.068-1.233.1l3.927 11.683 2.36-7.08-1.68-4.603c-.645-.034-1.256-.1-1.256-.1-.58-.068-.513-.914.065-.878 0 0 1.775.137 2.838.137 1.126 0 2.871-.137 2.871-.137.579-.034.648.812.066.878zM12 22c-1.504 0-2.94-.295-4.255-.826l4.52-13.126 4.63 12.683c.03.074.068.14.109.203A9.948 9.948 0 0112 22zM2.213 12c0-1.617.373-3.147 1.036-4.51L7.95 20.853C4.535 19.216 2.213 15.866 2.213 12zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
    ),
    tumblr: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.168z" />
        </svg>
    ),
};

/**
 * Detecta el servicio de una cuenta verificada por su label o URL
 */
function getServiceKey(account: { service_type?: string; service_label?: string; url?: string }): string {
    const label = (account.service_label || account.service_type || '').toLowerCase();
    if (label.includes('github')) return 'github';
    if (label.includes('twitter') || label.includes('x.com')) return 'twitter';
    if (label.includes('linkedin')) return 'linkedin';
    if (label.includes('wordpress')) return 'wordpress';
    if (label.includes('tumblr')) return 'tumblr';

    const url = (account.url || '').toLowerCase();
    if (url.includes('github.com')) return 'github';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('wordpress')) return 'wordpress';
    if (url.includes('tumblr.com')) return 'tumblr';

    return '';
}

/**
 * Formatea timezone a hora local legible
 */
function formatTimezone(tz: string): string {
    try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('es', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: tz,
            hour12: false
        }).format(now);
        return `${formatted} (${tz.split('/').pop()?.replace(/_/g, ' ')})`;
    } catch {
        return tz;
    }
}

interface GravatarHoverCardProps {
    email: string;
    theme: 'light' | 'dark';
}

const GravatarHoverCard: React.FC<GravatarHoverCardProps> = ({ email, theme }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            // Intentar usar token para datos completos
            const tokenMatch = document.cookie.match(/gravatar_token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : undefined;
            const data = await fetchGravatarProfile(email, token);
            setProfile(data);
            setLoading(false);
        };
        loadProfile();
    }, [email]);

    if (loading) {
        return (
            <div className={`p-4 w-64 flex items-center justify-center rounded-2xl shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <Loader2 size={24} className="animate-spin text-green-600" />
            </div>
        );
    }

    if (!profile) return null;

    const colors = theme === 'dark' ? {
        bg: 'bg-slate-900',
        border: 'border-white/10',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        textTertiary: 'text-slate-500',
        surface: 'bg-white/5'
    } : {
        bg: 'bg-white',
        border: 'border-slate-100',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        textTertiary: 'text-slate-400',
        surface: 'bg-slate-50'
    };

    const displayName = profile.display_name || profile.displayName || profile.preferredUsername || email.split('@')[0];
    const location = profile.location || profile.currentLocation;
    const bio = profile.description || profile.about_me || profile.aboutMe;
    const jobTitle = profile.job_title;
    const company = profile.company;
    const timezone = profile.timezone;
    const verifiedAccounts = profile.verified_accounts || [];
    const languages = profile.languages || [];
    const profileUrl = profile.profile_url || profile.profileUrl;

    return (
        <div className={`w-80 overflow-hidden rounded-[2rem] shadow-2xl border ${colors.bg} ${colors.border} animate-in fade-in zoom-in duration-200`}>
            {/* Header / Avatar Section */}
            <div className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-600/20 shadow-xl">
                    <img src={getGravatarUrl(email, 200)} alt={displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className={`text-lg font-black tracking-tight ${colors.textPrimary}`}>
                        {displayName}
                    </h4>

                    {/* Job Title + Company */}
                    {(jobTitle || company) && (
                        <p className={`text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 mt-1 ${colors.textSecondary}`}>
                            <Briefcase size={10} />
                            {jobTitle}{jobTitle && company ? ' @ ' : ''}{company}
                        </p>
                    )}

                    {/* Location */}
                    {location && (
                        <p className={`text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 mt-1 ${colors.textTertiary}`}>
                            <MapPin size={10} /> {location}
                        </p>
                    )}
                </div>
            </div>

            {/* Bio Section */}
            {bio && (
                <div className="px-6 pb-3 text-center">
                    <p className={`text-xs font-medium leading-relaxed italic ${colors.textSecondary}`}>
                        &ldquo;{bio.substring(0, 120)}{bio.length > 120 ? '...' : ''}&rdquo;
                    </p>
                </div>
            )}

            {/* Timezone + Languages */}
            {(timezone || languages.length > 0) && (
                <div className={`px-6 pb-3 flex flex-wrap items-center justify-center gap-3`}>
                    {timezone && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${colors.textTertiary}`}>
                            <Clock size={10} /> {formatTimezone(timezone)}
                        </span>
                    )}
                    {languages.length > 0 && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${colors.textTertiary}`}>
                            <Languages size={10} /> {languages.map((l: any) => l.name || l.code).join(', ')}
                        </span>
                    )}
                </div>
            )}

            {/* Verified Accounts + Actions */}
            <div className={`p-4 space-y-2 border-t ${colors.border}`}>
                <div className="flex flex-wrap justify-center gap-2">
                    {/* Verified Accounts with specific icons */}
                    {verifiedAccounts.map((account: any, i: number) => {
                        const serviceKey = getServiceKey(account);
                        const icon = VERIFIED_SERVICE_ICONS[serviceKey];
                        return (
                            <a
                                key={i}
                                href={account.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-green-600`}
                                title={`${account.service_label || account.service_type || 'Verified'} (verificado)`}
                            >
                                {icon || <Globe size={16} />}
                            </a>
                        );
                    })}

                    {/* Fallback: generic URL links si no hay verified accounts */}
                    {verifiedAccounts.length === 0 && profile.urls?.map((url: any, i: number) => (
                        <a
                            key={i}
                            href={url.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-green-600`}
                            title={url.title}
                        >
                            <Globe size={16} />
                        </a>
                    ))}

                    {/* QR Code */}
                    <button
                        onClick={async () => {
                            const url = await getGravatarQRUrl(email);
                            window.open(url, '_blank');
                        }}
                        className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-orange-500`}
                        title="Ver Codigo QR del Perfil"
                    >
                        <QrCode size={16} />
                    </button>

                    {/* Profile Link */}
                    {profileUrl && (
                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-blue-600`}
                            title="Ver Perfil Gravatar completo"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
                <div className="text-center pt-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Gravatar Verified Contact</p>
                </div>
            </div>
        </div>
    );
};

export default GravatarHoverCard;
