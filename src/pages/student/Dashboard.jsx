// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FileText, Box, Users, GraduationCap, BookOpen, User, ChevronRight } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [bureau, setBureau] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [maquettes, setMaquettes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        let authSubscription;
        let channels = [];

        const fetchUserProfile = async (userId) => {
            const { data } = await supabase.from('users').select('*').eq('id', userId).single();
            if (data && active) setUser(data);
        };
        const fetchBureau = async () => {
            const { data } = await supabase.from('bureau').select('*').order('createdAt', { ascending: false });
            if (data && active) setBureau(data);
        };
        const fetchRessources = async () => {
            const { data } = await supabase.from('ressources').select('*').order('createdAt', { ascending: false });
            if (data && active) setRessources(data);
        };
        const fetchMaquettes = async () => {
            const { data } = await supabase.from('maquettes').select('*').order('createdAt', { ascending: false });
            if (data && active) setMaquettes(data);
        };

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await fetchUserProfile(session.user.id);
            await Promise.all([fetchBureau(), fetchRessources(), fetchMaquettes()]);
            if (!active) return;
            const c1 = supabase.channel('bureau-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, fetchBureau).subscribe();
            const c2 = supabase.channel('ressources-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, fetchRessources).subscribe();
            const c3 = supabase.channel('maquettes-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, fetchMaquettes).subscribe();
            channels.push(c1, c2, c3);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) fetchUserProfile(session.user.id);
            else if (active) setUser(null);
        });
        authSubscription = subscription;
        init();

        return () => {
            active = false;
            if (authSubscription) authSubscription.unsubscribe();
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const heure = new Date().getHours();
    const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

    const stats = [
        {
            label: 'Documents', value: ressources.length,
            Icon: FileText,
            accent: '#187840', accentBg: 'rgba(24,120,64,0.08)',
        },
        {
            label: 'Maquettes', value: maquettes.length,
            Icon: Box,
            accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.08)',
        },
        {
            label: 'Bureau', value: bureau.length,
            Icon: Users,
            accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.08)',
        },
        {
            label: 'Filières', value: 2,
            Icon: GraduationCap,
            accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.08)',
        },
    ];

    const actions = [
        {
            label: 'Bibliothèque',
            desc: 'Accéder aux ressources pédagogiques',
            path: '/student/library',
            Icon: BookOpen,
            color: '#187840',
        },
        {
            label: 'Tutorat',
            desc: 'Sessions d\'entraide entre étudiants',
            path: '/student/tutorat',
            Icon: Users,
            color: '#003058',
        },
        {
            label: 'Mon Profil',
            desc: 'Consulter et modifier mes informations',
            path: '/student/profile',
            Icon: User,
            color: '#7c3aed',
        },
    ];

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

            {/* ── Bannière de bienvenue ── */}
            <div className="anim-fade-up relative bg-[#003058] rounded-2xl p-6 md:p-8 overflow-hidden"
                style={{ boxShadow: '0 8px 24px -4px rgba(0,48,88,0.25)' }}>
                {/* Motif géométrique sobre */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-medium mb-1 tracking-wide">{salutation}</p>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {user?.prenom} <span className="text-[#187840]">{user?.nom}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center text-[11px] font-semibold bg-[#187840]/15 text-[#187840] px-3 py-1 rounded-full border border-[#187840]/25">
                            {user?.niveau ?? '—'}
                        </span>
                        <span className="text-[11px] text-slate-500">{user?.email}</span>
                    </div>
                </div>
            </div>

            {/* ── Statistiques ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="anim-fade-up card p-4 md:p-5 cursor-default"
                        style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: s.accentBg }}>
                            <s.Icon size={18} style={{ color: s.accent }} />
                        </div>
                        <p className="text-2xl font-bold text-[#003058] tracking-tight">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Accès rapide ── */}
            <div className="anim-fade-up delay-2">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Accès rapide</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {actions.map((a, i) => (
                        <button key={i} onClick={() => navigate(a.path)}
                            className="group relative overflow-hidden text-left rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                            style={{
                                backgroundColor: a.color,
                                boxShadow: `0 4px 14px -3px ${a.color}55`,
                            }}>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.06] transition-opacity duration-200" />
                            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-4">
                                <a.Icon size={16} className="text-white" />
                            </div>
                            <p className="font-semibold text-sm text-white tracking-tight">{a.label}</p>
                            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">{a.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Derniers documents ── */}
            <div className="anim-fade-up delay-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Derniers documents</h2>
                    <button onClick={() => navigate('/student/library')}
                        className="text-xs font-semibold text-[#187840] hover:text-[#125e31] transition-colors flex items-center gap-1">
                        Voir tout
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </div>
                {ressources.length === 0 ? (
                    <div className="card p-10 text-center">
                        <p className="text-sm text-slate-400 font-medium">Aucun document disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="card divide-y divide-slate-50 overflow-hidden">
                        {ressources.slice(0, 5).map((r, i) => (
                            <div key={r.id}
                                className="flex items-center gap-3 px-4 md:px-5 py-3.5 hover:bg-[#F8F0F0] transition-colors duration-150">
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0 border border-red-100">
                                    <FileText size={16} className="text-red-400" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{r.nom}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{r.typeDoc}{r.date ? ` · ${r.date}` : ''}</p>
                                </div>
                                {r.url && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 text-[11px] font-semibold text-[#187840] hover:text-[#125e31] border border-[#187840]/25 hover:border-[#187840]/50 px-3 py-1 rounded-lg transition-all duration-150">
                                        Ouvrir
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Membres du Bureau ── */}
            <div className="anim-fade-up delay-4">
                <h2 className="text-sm font-semibold text-slate-800 tracking-tight mb-3">Bureau Exécutif</h2>
                {bureau.length === 0 ? (
                    <div className="card p-10 text-center">
                        <p className="text-sm text-slate-400 font-medium">Aucun membre enregistré.</p>
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                        {bureau.map(m => (
                            <div key={m.id}
                                className="card shrink-0 w-36 p-4 text-center cursor-default">
                                <div className="w-14 h-14 mx-auto mb-3 overflow-hidden rounded-full border-2 border-slate-100">
                                    {m.imageUrl
                                        ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-[#003058] flex items-center justify-center text-[#187840] text-base font-bold">{m.nom?.[0]}</div>
                                    }
                                </div>
                                <p className="font-semibold text-xs text-[#003058] truncate leading-tight">{m.nom}</p>
                                <p className="text-[10px] text-[#187840] font-semibold mt-1 leading-tight">{m.poste}</p>
                                <div className="mt-2 text-[9px] text-slate-400 bg-[#F8F0F0] px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-wide font-medium">
                                    {m.classe}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}




