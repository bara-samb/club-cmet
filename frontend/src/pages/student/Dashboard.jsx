import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Users, GraduationCap, BookOpen, User, Bell, MessageSquare, ChevronRight, FileText, Download } from 'lucide-react';
import NotificationFeed from '../../components/ui/NotificationFeed';
import useAuth from '../../hooks/useAuth';

export default function Dashboard() {
    const { user } = useAuth();
    const { isInstalled, handleInstallApp } = useOutletContext() || {};
    const [bureau, setBureau] = useState([]);
    const [bibliotheque, setBibliotheque] = useState([]);
    const [maquettes, setMaquettes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchBureau = async () => {
            const { data } = await supabase.from('bureau').select('*').order('createdAt', { ascending: false });
            if (data && active) setBureau(data);
        };
        const fetchBibliotheque = async () => {
            const { data } = await supabase.from('bibliotheque').select('*').order('id', { ascending: false });
            if (data && active) setBibliotheque(data);
        };
        const fetchMaquettes = async () => {
            const { data } = await supabase.from('maquettes').select('*').order('createdAt', { ascending: false });
            if (data && active) setMaquettes(data);
        };

        const init = async () => {
            await Promise.all([fetchBureau(), fetchBibliotheque(), fetchMaquettes()]);
            if (!active) return;
            const c1 = supabase.channel('bureau-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, fetchBureau).subscribe();
            const c2 = supabase.channel('bibliotheque-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'bibliotheque' }, fetchBibliotheque).subscribe();
            const c3 = supabase.channel('maquettes-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, fetchMaquettes).subscribe();
            channels.push(c1, c2, c3);
        };

        init();

        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const heure = new Date().getHours();
    const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

    const stats = [
        { label: 'Bibliothèque', value: bibliotheque.length, Icon: BookOpen, accent: '#187840', accentBg: 'rgba(24,120,64,0.08)' },
        { label: 'Maquettes', value: maquettes.length, Icon: Box, accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.08)' },
        { label: 'Bureau', value: bureau.length, Icon: Users, accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.08)' },
        { label: 'Filières', value: 2, Icon: GraduationCap, accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.08)' },
    ];

    const actions = [
        { label: 'Bibliothèque', desc: 'Accéder aux ressources pédagogiques', path: '/student/library', Icon: BookOpen, color: '#187840' },
        { label: 'Messages', desc: 'Communiquer avec le bureau du club', path: '/student/tutorat', Icon: MessageSquare, color: '#003058' },
        { label: 'Notifications', desc: 'Messages importants du bureau', path: '/student/notifications', Icon: Bell, color: '#1d4ed8' },
        { label: 'Mon Profil', desc: 'Consulter et modifier mes informations', path: '/student/profile', Icon: User, color: '#7c3aed' },
    ];

    const formatCategory = (cat) => {
        if (cat === 'cours') return 'Cours';
        if (cat === 'td') return 'TD / Exercices';
        if (cat === 'examens') return 'Examen';
        return cat;
    };

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            <NotificationFeed />

            {/* PWA Install Card — n'apparaît que si l'app n'est pas installée */}
            {!isInstalled && handleInstallApp && (
                <div className="anim-fade-up bg-gradient-to-r from-[#003058] to-[#004a8a] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg shadow-[#003058]/20 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <Download size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-extrabold text-sm leading-snug">Installer l'application Club-MET</p>
                            <p className="text-white/60 text-xs mt-0.5">Accès rapide depuis votre écran d'accueil</p>
                        </div>
                    </div>
                    <button
                        onClick={handleInstallApp}
                        className="shrink-0 bg-[#187840] hover:bg-[#125e31] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                    >
                        Télécharger
                    </button>
                </div>
            )}
            
            {/* Hero Welcome Card */}
            <div className="anim-fade-up relative bg-[#003058] rounded-2xl p-6 md:p-8 overflow-hidden shadow-lg border border-white/5">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt="Profil"
                                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/20 object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#187840] border-2 border-white/20 flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg">
                                {user?.prenom?.[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-slate-300 text-xs font-medium mb-1 tracking-wide">{salutation},</p>
                            <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight">
                                {user?.prenom} <span className="text-[#187840]">{user?.nom}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="inline-flex items-center text-[10px] font-bold bg-[#187840]/20 text-[#187840] px-2.5 py-0.5 rounded-full border border-[#187840]/20">
                                    {user?.niveau ?? '—'}
                                </span>
                                <span className="text-[10px] text-slate-300 font-medium">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="anim-fade-up card p-4 md:p-5 cursor-default hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.accentBg }}>
                            <s.Icon size={18} style={{ color: s.accent }} />
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-[#003058] dark:text-white tracking-tight">{s.value}</p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Access */}
            <div className="anim-fade-up space-y-3">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Accès rapide</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {actions.map((a, i) => (
                        <button key={i} onClick={() => navigate(a.path)} className="group relative overflow-hidden text-left rounded-2xl p-4 md:p-5 hover-lift shadow-sm active:scale-[0.98]" style={{ backgroundColor: a.color, boxShadow: `0 4px 12px -3px ${a.color}45`, animationDelay: `${i * 0.05}s` }}>
                            <div className="absolute inset-0 bg-white dark:bg-ucak-dark-card opacity-0 group-hover:opacity-[0.06] transition-opacity duration-200" />
                            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3 md:mb-4"><a.Icon size={16} className="text-white" /></div>
                            <p className="font-semibold text-xs md:text-sm text-white tracking-tight">{a.label}</p>
                            <p className="text-[10px] text-white/70 mt-0.5 leading-relaxed line-clamp-1">{a.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Last Additions */}
            <div className="anim-fade-up space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Derniers ajouts à la bibliothèque</h2>
                    <button onClick={() => navigate('/student/library')} className="text-xs font-semibold text-[#187840] hover:text-[#125e31] transition-colors flex items-center gap-0.5">Voir tout <ChevronRight size={14} /></button>
                </div>
                {bibliotheque.length === 0 ? (
                    <div className="card p-10 text-center"><p className="text-xs text-slate-400 font-medium">Aucune ressource disponible pour le moment.</p></div>
                ) : (
                    <div className="card divide-y divide-slate-50 dark:divide-white/5 overflow-hidden shadow-sm border border-slate-100 dark:border-white/10">
                        {bibliotheque.slice(0, 5).map((b) => (
                            <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 bg-[#187840]/10 rounded-lg flex items-center justify-center shrink-0 border border-[#187840]/15"><FileText size={16} className="text-[#187840]" /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{b.nom}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[9px] font-black text-[#003058] dark:text-white bg-[#003058]/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{formatCategory(b.categorie)}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{b.niveau}</span>
                                        </div>
                                    </div>
                                </div>
                                {b.url && (
                                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] font-bold text-[#187840] hover:text-[#125e31] border border-[#187840]/25 hover:border-[#187840]/50 px-3 py-1.5 rounded-lg bg-white dark:bg-ucak-dark-card shadow-sm transition-all duration-150">
                                        Consulter
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}