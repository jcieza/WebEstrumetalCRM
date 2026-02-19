'use client';

import React, { useState, useEffect } from 'react';
import { fetchGravatarProfile, getGravatarUrl, getGravatarQRUrl } from '@/utils/gravatar';
import { Globe, Twitter, Github, Linkedin, MapPin, User, ExternalLink, Loader2, QrCode } from 'lucide-react';

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
            const data = await fetchGravatarProfile(email);
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
        surface: 'bg-white/5'
    } : {
        bg: 'bg-white',
        border: 'border-slate-100',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-500',
        surface: 'bg-slate-50'
    };

    return (
        <div className={`w-72 overflow-hidden rounded-[2rem] shadow-2xl border ${colors.bg} ${colors.border} animate-in fade-in zoom-in duration-200`}>
            {/* Header / Avatar Section */}
            <div className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-600/20 shadow-xl">
                    <img src={getGravatarUrl(email, 200)} alt={profile.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className={`text-lg font-black tracking-tight ${colors.textPrimary}`}>
                        {profile.display_name || profile.displayName || profile.preferredUsername || email.split('@')[0]}
                    </h4>
                    {(profile.location || profile.currentLocation) && (
                        <p className={`text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 mt-1 ${colors.textSecondary}`}>
                            <MapPin size={10} /> {profile.location || profile.currentLocation}
                        </p>
                    )}
                </div>
            </div>

            {/* Bio Section */}
            {(profile.about_me || profile.aboutMe) && (
                <div className={`px-6 pb-4 text-center`}>
                    <p className={`text-xs font-medium leading-relaxed italic ${colors.textSecondary}`}>
                        "{(profile.about_me || profile.aboutMe).substring(0, 100)}{(profile.about_me || profile.aboutMe).length > 100 ? '...' : ''}"
                    </p>
                </div>
            )}

            {/* Social Links & Info Section */}
            <div className={`p-4 space-y-2 border-t mt-2 ${colors.border}`}>
                <div className="flex flex-wrap justify-center gap-2">
                    {profile.urls?.map((url: any, i: number) => (
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
                    {/* QR Code Trigger */}
                    <button
                        onClick={async () => {
                            const url = await getGravatarQRUrl(email);
                            window.open(url, '_blank');
                        }}
                        className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-orange-500`}
                        title="Ver Código QR del Perfil"
                    >
                        <QrCode size={16} />
                    </button>

                    {/* Gravatar always has a profile link */}
                    <a
                        href={profile.profile_url || profile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-xl transition-all hover:scale-110 ${colors.surface} ${colors.textSecondary} hover:text-blue-600`}
                        title="Ver Perfil Gravatar completo"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
                <div className="text-center pt-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Gravatar Verified Contact</p>
                </div>
            </div>
        </div>
    );
};

export default GravatarHoverCard;
