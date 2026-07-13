import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import useAuth from '../../hooks/useAuth';
import { CreditCard, TrendingUp, CheckCircle, Loader2, ArrowUpRight, DollarSign, Calendar, Users, Eye } from 'lucide-react';

const DEFAULT_WAVE_LINK = "https://pay.wave.com/m/M_sn_UGcGdaAUDasK/c/sn/";

export default function Cotisations() {
    const { user } = useAuth();
    const [waveLink, setWaveLink] = useState(DEFAULT_WAVE_LINK);
    const [mesCotisations, setMesCotisations] = useState([]);
    const [toutesCotisations, setToutesCotisations] = useState([]);
    const [stats, setStats] = useState({ totalCollecte: 0, contributorsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mes-versements'); // 'mes-versements' or 'tous-versements'

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

                // 2. Charger les cotisations validées de l'étudiant connecté
                const { data: userCotisations } = await supabase
                    .from('cotisations')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('statut', 'valide')
                    .order('created_at', { ascending: false });
                if (userCotisations && active) {
                    setMesCotisations(userCotisations);
                }

                // 3. Charger toutes les cotisations validées (transparence collective)
                const { data: allValidated } = await supabase
                    .from('cotisations')
                    .select('*')
                    .eq('statut', 'valide')
                    .order('created_at', { ascending: false });
                
                if (allValidated && active) {
                    setToutesCotisations(allValidated);
                    const total = allValidated.reduce((sum, item) => sum + Number(item.montant), 0);
                    const uniqueContributors = new Set(allValidated.map(item => item.user_id).filter(Boolean)).size;
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

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#003058] flex items-center gap-3">
                    <CreditCard className="text-[#187840] w-8 h-8" /> Cotisations du Club-MET
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Participez au financement des activités du club, suivez vos versements enregistrés et accédez au registre transparent de la collecte globale.
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
                    <div className="lg:col-span-1 space-y-6">

                        {/* Ma contribution totale */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#187840] flex items-center justify-center border border-green-100 shrink-0">
                                <CheckCircle size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ma contribution totale</p>
                                <p className="text-xl font-black text-[#003058] mt-0.5">{monTotalValide.toLocaleString()} FCFA</p>
                            </div>
                        </div>

                        {/* Collecte globale du Club */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collecte globale du Club</p>
                                <p className="text-xl font-black text-[#003058] mt-0.5">{stats.totalCollecte.toLocaleString()} FCFA</p>
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

                    {/* COLONNE DROITE: Registres Transparent des Cotisations */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
                            
                            {/* Onglets navigation */}
                            <div className="flex border-b border-slate-100 pb-1">
                                <button 
                                    onClick={() => setActiveTab('mes-versements')}
                                    className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all mr-6 ${activeTab === 'mes-versements' ? 'border-[#187840] text-[#187840]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    Mes Versements ({mesCotisations.length})
                                </button>
                                <button 
                                    onClick={() => setActiveTab('tous-versements')}
                                    className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'tous-versements' ? 'border-[#187840] text-[#187840]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    Tous les Versements ({toutesCotisations.length})
                                </button>
                            </div>

                            {/* Contenu de l'onglet : Mes Versements */}
                            {activeTab === 'mes-versements' && (
                                <div className="space-y-4">
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
                            )}

                            {/* Contenu de l'onglet : Toutes les Cotisations (Transparence) */}
                            {activeTab === 'tous-versements' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-[#F8F0F0] rounded-xl p-3 border border-slate-100">
                                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Users size={14} /> Total des contributeurs</span>
                                        <span className="text-xs font-black text-[#003058]">{stats.contributorsCount} étudiants</span>
                                    </div>

                                    {toutesCotisations.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400 text-xs font-semibold leading-relaxed">
                                            Aucune cotisation enregistrée pour le moment.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                                                        <th className="py-2.5 px-2">Étudiant</th>
                                                        <th className="py-2.5 px-2">Montant</th>
                                                        <th className="py-2.5 px-2">Date</th>
                                                        <th className="py-2.5 px-2">Enregistré par</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {toutesCotisations.map(c => (
                                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-2.5 px-2">
                                                                <div className="font-bold text-[#003058]">{c.nom}</div>
                                                                <div className="text-[10px] text-slate-400">{c.classe}</div>
                                                            </td>
                                                            <td className="py-2.5 px-2 font-bold text-slate-700">
                                                                {Number(c.montant).toLocaleString()} FCFA
                                                            </td>
                                                            <td className="py-2.5 px-2 text-slate-500">
                                                                {c.date_paiement}
                                                            </td>
                                                            <td className="py-2.5 px-2 text-slate-400 text-[10px] italic">
                                                                {c.enregistre_par || 'Système'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
