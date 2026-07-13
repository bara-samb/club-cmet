import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import useAuth from '../../hooks/useAuth';
import { CreditCard, TrendingUp, CheckCircle, Loader2, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';

const DEFAULT_WAVE_LINK = "https://pay.wave.com/m/M_sn_UGcGdaAUDasK/c/sn/";
const GOAL_TARGET = 500000; // Objectif de cotisation global (500 000 FCFA)

export default function Cotisations() {
    const { user } = useAuth();
    const [waveLink, setWaveLink] = useState(DEFAULT_WAVE_LINK);
    const [mesCotisations, setMesCotisations] = useState([]);
    const [stats, setStats] = useState({ totalCollecte: 0, contributorsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            try {
                // 1. Charger le lien Wave depuis la config
                const { data: configData } = await supabase
                    .from('config')
                    .select('valeur')
                    .eq('cle', 'wave_link')
                    .single();
                if (configData && configData.valeur && active) {
                    setWaveLink(configData.valeur);
                }

                // 2. Charger les cotisations validées de l'étudiant
                const { data: userCotisations } = await supabase
                    .from('cotisations')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('statut', 'valide')
                    .order('created_at', { ascending: false });
                if (userCotisations && active) {
                    setMesCotisations(userCotisations);
                }

                // 3. Charger les statistiques globales (toutes les cotisations validées)
                const { data: allValidated } = await supabase
                    .from('cotisations')
                    .select('montant, user_id')
                    .eq('statut', 'valide');
                
                if (allValidated && active) {
                    const total = allValidated.reduce((sum, item) => sum + Number(item.montant), 0);
                    const uniqueContributors = new Set(allValidated.map(item => item.user_id)).size;
                    setStats({
                        totalCollecte: total,
                        contributorsCount: uniqueContributors
                    });
                }
            } catch (err) {
                console.error("Erreur de chargement des cotisations:", err);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchData();

        const channel = supabase.channel('student-cotisations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cotisations' }, fetchData)
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    const monTotalValide = mesCotisations.reduce((sum, item) => sum + Number(item.montant), 0);
    const progressPercent = Math.min(Math.round((stats.totalCollecte / GOAL_TARGET) * 100), 100);

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#003058] flex items-center gap-3">
                    <CreditCard className="text-[#187840] w-8 h-8" /> Cotisations du Club-MET
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Participez au financement des activités du club, suivez l'état de vos versements et l'objectif de collecte.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement des données...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COLONNE GAUCHE: Stats et Paiement */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Cartes stats rapides */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#187840] flex items-center justify-center border border-green-100">
                                    <CheckCircle size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ma contribution totale</p>
                                    <p className="text-2xl font-black text-[#003058] mt-0.5">{monTotalValide.toLocaleString()} FCFA</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <TrendingUp size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collecte globale du Club</p>
                                    <p className="text-2xl font-black text-[#003058] mt-0.5">{stats.totalCollecte.toLocaleString()} FCFA</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar de l'objectif */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="font-extrabold text-sm text-[#003058]">Objectif Annuel du Club</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Financement de la journée d'intégration, tutorat et activités sociales.</p>
                                </div>
                                <span className="text-sm font-black text-[#187840]">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/40">
                                <div className="bg-[#187840] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>{stats.totalCollecte.toLocaleString()} FCFA récoltés</span>
                                <span>Cible : {GOAL_TARGET.toLocaleString()} FCFA</span>
                            </div>
                        </div>

                        {/* Payer ma cotisation */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                            <h3 className="font-extrabold text-base text-[#003058] flex items-center gap-2">
                                <DollarSign className="text-[#187840]" size={20} /> Règlement de la cotisation
                            </h3>
                            <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 leading-relaxed text-justify">
                                Cliquez sur le bouton ci-dessous pour régler votre cotisation via le portail de paiement sécurisé **Wave Marchand**. Les versements validés par l'administration apparaîtront automatiquement dans votre historique ci-contre.
                            </div>
                            <a 
                                href={waveLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full bg-[#187840] hover:bg-[#125e31] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#187840]/25 transition-all hover:scale-[1.01]"
                            >
                                Effectuer le paiement Wave <ArrowUpRight size={16} />
                            </a>
                        </div>

                    </div>

                    {/* COLONNE DROITE: Historique de paiement direct */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-[#003058]">Historique de mes versements</h3>
                            {mesCotisations.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs font-semibold leading-relaxed">
                                    Aucun versement enregistré à votre nom pour le moment.
                                </div>
                            ) : (
                                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                                    {mesCotisations.map(c => (
                                        <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-[#003058]">{Number(c.montant).toLocaleString()} FCFA</p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Calendar size={10} /> {c.date_paiement}</p>
                                            </div>
                                            <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                <CheckCircle size={10} /> Enregistré
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
