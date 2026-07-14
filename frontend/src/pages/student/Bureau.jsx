import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Users, Phone, Linkedin, Loader2, AlertCircle, Award } from 'lucide-react';

const POSTE_ORDER = {
    "Président": 1,
    "Vice-Président": 2,
    "Secrétaire Général": 3,
    "Secrétaire Générale": 3,
    "Secrétaire Général(e)": 3,
};

const getPosteOrder = (poste) => {
    if (POSTE_ORDER[poste]) return POSTE_ORDER[poste];
    if (poste.toLowerCase().includes('responsable')) return 4;
    if (poste.toLowerCase().includes('adjoint')) return 5;
    return 10;
};

export default function Bureau() {
    const [bureau, setBureau] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('actuels'); // 'actuels' or 'anciens'

    useEffect(() => {
        let active = true;

        const fetchBureau = async () => {
            try {
                const { data, error: fetchErr } = await supabase
                    .from('bureau')
                    .select('*')
                    .order('createdAt', { ascending: false });

                if (fetchErr) throw fetchErr;
                if (active) {
                    const parsed = (data || []).map(m => {
                        // Check if database has the new columns and they are populated
                        if (m.estAncien !== undefined && m.estAncien !== null) {
                            return {
                                ...m,
                                estAncien: !!m.estAncien,
                                annee: m.annee || ""
                            };
                        }
                        const match = m.classe.match(/\s*\(?(\d{4}-\d{4}|\d{4})\)?/);
                        if (match) {
                            const annee = match[1];
                            const classeSansAnnee = m.classe.replace(/\s*\(?(\d{4}-\d{4}|\d{4})\)?/, "").trim();
                            return {
                                ...m,
                                estAncien: true,
                                annee: annee,
                                classe: classeSansAnnee || "Ancien"
                            };
                        }
                        return {
                            ...m,
                            estAncien: false,
                            annee: ""
                        };
                    });
                    setBureau(parsed);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur chargement bureau:", err);
                if (active) {
                    setError("Impossible de charger les membres du bureau.");
                    setLoading(false);
                }
            }
        };

        fetchBureau();

        const channel = supabase.channel('student-bureau-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, fetchBureau)
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, []);

    const membresActuels = bureau
        .filter(m => !m.estAncien)
        .sort((a, b) => getPosteOrder(a.poste) - getPosteOrder(b.poste));

    const anciensMembresAAfficher = bureau
        .filter(m => m.estAncien)
        .sort((a, b) => getPosteOrder(a.poste) - getPosteOrder(b.poste));

    // Grouping anciens by year
    const groupedAnciens = anciensMembresAAfficher.reduce((groups, member) => {
        const year = member.annee || "Mandat précédent";
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(member);
        return groups;
    }, {});
    const sortedAnciensYears = Object.keys(groupedAnciens).sort((a, b) => b.localeCompare(a));

    return (
        <div className="anim-fade-up p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#003058] flex items-center gap-3">
                    <Users className="text-[#187840] w-8 h-8" /> Organes de Direction du Club
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Découvrez les membres dirigeants du Club-MET, mandats en cours et promotions précédentes.
                </p>
            </div>

            {/* Onglets de filtres */}
            <div className="flex justify-center mb-6">
                <div className="bg-white p-1.5 rounded-2xl border border-gray-200/60 shadow-sm flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('actuels')}
                        className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'actuels' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Award size={15} /> Membres Actuels
                    </button>
                    <button
                        onClick={() => setActiveTab('anciens')}
                        className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'anciens' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users size={15} /> Anciens Membres
                    </button>
                </div>
            </div>

            {/* Contenu */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement des membres...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            ) : activeTab === 'actuels' ? (
                membresActuels.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-500">Aucun membre enregistré dans cette section.</p>
                    </div>
                ) : (
                    <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-4 pb-4 md:pb-0 scrollbar-none scroll-smooth shrink-0 -mx-4 px-4 md:mx-0 md:px-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in duration-300">
                        {membresActuels.map(m => (
                            <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between snap-start shrink-0 w-[200px] sm:w-[240px] md:w-auto">
                                <div>
                                    <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                                        {m.imageUrl ? (
                                            <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-[#003058] to-[#187840] flex items-center justify-center text-white text-2xl font-black">
                                                {m.nom?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm text-[#003058] truncate">{m.nom}</h4>
                                    <p className="text-xs text-[#187840] font-bold mt-0.5 leading-tight">{m.poste}</p>
                                </div>
                                <div className="mt-4">
                                    <span className="inline-block text-[9px] font-black text-slate-500 bg-[#f1f5f9] px-2.5 py-1 rounded border border-slate-200/50 uppercase tracking-wider">
                                        {m.classe}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                sortedAnciensYears.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-500">Aucun ancien membre enregistré.</p>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in duration-300">
                        {sortedAnciensYears.map(year => (
                            <div key={year} className="space-y-4">
                                <h3 className="font-black text-sm text-[#187840] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span>Mandat {year}</span>
                                    <span className="bg-[#187840]/10 text-[#187840] text-[10px] px-2.5 py-0.5 rounded-full">{groupedAnciens[year].length}</span>
                                </h3>
                                <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-4 pb-4 md:pb-0 scrollbar-none scroll-smooth shrink-0 -mx-4 px-4 md:mx-0 md:px-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {groupedAnciens[year].map(m => (
                                        <div key={m.id || m.nom} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between snap-start shrink-0 w-[200px] sm:w-[240px] md:w-auto">
                                            <div>
                                                <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                                                    {m.imageUrl ? (
                                                        <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-tr from-[#003058] to-[#187840] flex items-center justify-center text-white text-2xl font-black">
                                                            {m.nom?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-sm text-[#003058] truncate">{m.nom}</h4>
                                                <p className="text-xs text-[#187840] font-bold mt-0.5 leading-tight">{m.poste}</p>
                                            </div>
                                            <div className="mt-4">
                                                <span className="inline-block text-[9px] font-black text-slate-500 bg-[#f1f5f9] px-2.5 py-1 rounded border border-slate-200/50 uppercase tracking-wider">
                                                    {m.classe}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
