import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X } from '../../components/ui/Icons';

const POSTE_ORDER = {
    "Président": 1,
    "Vice-Président": 2,
    "Secrétaire Général": 3,
    "Secrétaire Générale": 3,
    "Secrétaire Général(e)": 3,
};

const getPosteOrder = (poste) => {
    if (!poste) return 10;
    if (POSTE_ORDER[poste]) return POSTE_ORDER[poste];
    if (poste.toLowerCase().includes('responsable')) return 4;
    if (poste.toLowerCase().includes('adjoint')) return 5;
    return 10;
};

export default function BureauPublic() {
    const [bureau, setBureau] = useState([]);
    const [isAnciensOpen, setIsAnciensOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBureau = async () => {
        setLoading(true);
        const { data } = await supabase.from('bureau').select('*');
        if (data) {
            const parsed = data.map(m => {
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
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBureau();

        const channel = supabase.channel('bureau-public')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, () => { fetchBureau(); })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const membresActuels = bureau
        .filter(m => !m.estAncien)
        .sort((a, b) => getPosteOrder(a.poste) - getPosteOrder(b.poste));

    const anciensMembres = bureau
        .filter(m => m.estAncien)
        .sort((a, b) => getPosteOrder(a.poste) - getPosteOrder(b.poste));

    // Grouping anciens by year
    const groupedAnciens = anciensMembres.reduce((groups, member) => {
        const year = member.annee || "Mandat précédent";
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(member);
        return groups;
    }, {});
    const sortedAnciensYears = Object.keys(groupedAnciens).sort((a, b) => b.localeCompare(a));

    return (
        <div className="bg-white/85 dark:bg-ucak-dark/90 min-h-screen">
            {/* Header Banner */}
            <div className="bg-[#003058] text-white py-14 px-6 text-center border-b border-white/5">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight">Le Bureau du Club-MET</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Découvrez l'équipe dirigeante élue pour l'exercice en cours, ainsi que les promotions précédentes.
                </p>
            </div>

            {/* ── BUREAU ACTUEL ── */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        Chargement de l'équipe...
                    </div>
                ) : membresActuels.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-sm text-slate-400">
                        Aucun membre du bureau actif enregistré pour le moment.
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {membresActuels.map((m) => (
                                <div key={m.id} className="group relative bg-white dark:bg-ucak-dark-card border border-[#e2e8f0]/60 rounded-3xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                    <div className="relative w-28 h-28 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#187840] to-[#003058] opacity-50 group-hover:rotate-180 transition-transform duration-700 ease-out" style={{ padding: '2px' }}>
                                            <div className="w-full h-full bg-white dark:bg-ucak-dark-card rounded-full" />
                                        </div>
                                        <div className="absolute inset-1.5 rounded-full overflow-hidden border-2 border-white shadow-inner bg-slate-100 dark:bg-white/10">
                                            {m.imageUrl ? (
                                                <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#003058] to-[#187840] flex items-center justify-center text-white text-3xl font-black">{m.nom?.[0]}</div>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="font-extrabold text-base text-[#003058] dark:text-white truncate mb-1 group-hover:text-[#187840] transition-colors">{m.nom}</h4>
                                    <p className="text-xs text-[#187840] font-black uppercase tracking-wider mb-4">{m.poste}</p>
                                    <div>
                                        <span className="inline-block text-[9px] font-black text-slate-500 bg-[#f1f5f9] dark:bg-ucak-dark px-3.5 py-1.5 rounded-full border border-[#e2e8f0]/50 uppercase tracking-widest shadow-sm">
                                            {m.classe}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bouton Anciens Membres */}
                        <div className="flex justify-center mt-16">
                            <button
                                onClick={() => setIsAnciensOpen(true)}
                                className="bg-transparent hover:bg-[#003058] text-[#003058] dark:text-white hover:text-white px-6 py-3 rounded-xl font-bold text-xs border-2 border-[#003058] transition-all flex items-center gap-2 hover:scale-105 shadow-sm"
                            >
                                <Users size={16} />
                                Voir les Anciens membres
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Modal Anciens Membres */}
            <AnimatePresence>
                {isAnciensOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsAnciensOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-ucak-dark-card rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-slate-800 dark:text-slate-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setIsAnciensOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 dark:hover:bg-white/15 rounded-full">
                                <X size={20} />
                            </button>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-[#003058] dark:text-white">Anciens Membres du Bureau</h3>
                                <p className="text-xs text-slate-400 mt-1">Les promotions précédentes qui ont fait grandir le Club-MET.</p>
                            </div>
                            <div className="space-y-8 max-h-[55vh] overflow-y-auto p-1">
                                {sortedAnciensYears.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 border-dashed rounded-2xl text-slate-400 text-xs font-bold">
                                        Aucun ancien membre enregistré pour le moment.
                                    </div>
                                ) : sortedAnciensYears.map((year) => (
                                    <div key={year} className="space-y-3">
                                        <h4 className="font-extrabold text-xs text-[#187840] uppercase tracking-wider border-b border-slate-100 dark:border-white/10 pb-1.5 flex items-center gap-2">
                                            <span>Mandat {year}</span>
                                            <span className="bg-[#187840]/10 text-[#187840] text-[9px] px-2 py-0.5 rounded-full">{groupedAnciens[year].length}</span>
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {groupedAnciens[year].map((m) => (
                                                <div key={m.id || m.nom} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 text-center shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all">
                                                    <div>
                                                        <div className="w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full border-2 border-slate-200 dark:border-white/10 shadow-inner bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                                            {m.imageUrl ? (
                                                                <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-tr from-[#003058] to-[#187840] flex items-center justify-center text-white text-lg font-black">
                                                                    {m.nom?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-xs text-[#003058] dark:text-white truncate">{m.nom}</h4>
                                                        <p className="text-[10px] text-[#187840] font-bold mt-0.5 leading-tight">{m.poste}</p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <span className="inline-block text-[8px] font-black text-slate-500 bg-[#f1f5f9] dark:bg-ucak-dark px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/10 uppercase tracking-wider">
                                                            {m.classe}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <button onClick={() => setIsAnciensOpen(false)} className="bg-[#003058] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#002850] transition">Fermer</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
