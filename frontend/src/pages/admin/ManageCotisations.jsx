import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import useAuth from '../../hooks/useAuth';
import { CreditCard, Save, Check, Trash2, Loader2, Users, CheckCircle, Clock, AlertTriangle, Plus, ChevronDown } from 'lucide-react';

const DEFAULT_WAVE_LINK = "https://pay.wave.com/m/M_sn_UGcGdaAUDasK/c/sn/";

export default function ManageCotisations() {
    const { user } = useAuth();
    const [waveLink, setWaveLink] = useState(DEFAULT_WAVE_LINK);
    const [cotisations, setCotisations] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingLink, setUpdatingLink] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    // Formulaire d'ajout manuel
    const [selectedEtudiantId, setSelectedEtudiantId] = useState('');
    const [manualNom, setManualNom] = useState('');
    const [manualClasse, setManualClasse] = useState('');
    const [manualMontant, setManualMontant] = useState('');

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            try {
                // 1. Charger le lien Wave
                const { data: configData } = await supabase
                    .from('config')
                    .select('valeur')
                    .eq('cle', 'wave_link')
                    .maybeSingle();
                if (configData && configData.valeur && active) {
                    setWaveLink(configData.valeur);
                }

                // 2. Charger toutes les déclarations de cotisations
                const { data: cotisData } = await supabase
                    .from('cotisations')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (cotisData && active) {
                    setCotisations(cotisData);
                }

                // 3. Charger les comptes étudiants enregistrés
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, prenom, nom, niveau')
                    .eq('role', 'student');
                if (usersData && active) {
                    setEtudiants(usersData);
                }
            } catch (err) {
                console.error("Erreur de chargement:", err);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchData();

        const channel = supabase.channel('admin-cotisations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cotisations' }, fetchData)
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSaveWaveLink = async (e) => {
        e.preventDefault();
        if (!waveLink.trim()) {
            showToast("Le lien Wave ne peut pas être vide.", "error");
            return;
        }

        setUpdatingLink(true);
        try {
            const { error } = await supabase
                .from('config')
                .upsert({ cle: 'wave_link', valeur: waveLink }, { onConflict: 'cle' });
            
            if (error) throw error;
            showToast("Lien Wave marchand mis à jour.");
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        } finally {
            setUpdatingLink(false);
        }
    };

    const handleValidate = async (id) => {
        try {
            const adminName = user?.user_metadata?.prenom 
                ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` 
                : (user?.email || 'Admin');
            const { error } = await supabase
                .from('cotisations')
                .update({ statut: 'valide', enregistre_par: `${adminName} (Valide)` })
                .eq('id', id);
            
            if (error) throw error;
            showToast("Cotisation validée.");
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        }
    };

    const handleAddManualPayment = async (e) => {
        e.preventDefault();
        
        let finalNom = manualNom.trim();
        let finalClasse = manualClasse.trim();
        let userIdToInsert = null;

        if (selectedEtudiantId) {
            const selected = etudiants.find(et => et.id === selectedEtudiantId);
            if (selected) {
                finalNom = `${selected.prenom} ${selected.nom}`.trim();
                finalClasse = selected.niveau || 'Licence';
                userIdToInsert = selected.id;
            }
        }

        if (!finalNom || !manualMontant || Number(manualMontant) <= 0) {
            showToast("Veuillez renseigner le nom et un montant valide.", "error");
            return;
        }

        setSubmittingPayment(true);
        try {
            const adminName = user?.user_metadata?.prenom 
                ? `${user.user_metadata.prenom} ${user.user_metadata.nom}` 
                : (user?.email || 'Admin');

            const payload = {
                nom: finalNom,
                classe: finalClasse,
                montant: Number(manualMontant),
                date_paiement: new Date().toLocaleDateString('fr-FR'),
                statut: 'valide',
                enregistre_par: adminName
            };

            if (userIdToInsert) {
                payload.user_id = userIdToInsert;
            }

            const { error } = await supabase.from('cotisations').insert(payload);
            if (error) throw error;

            showToast("Cotisation enregistrée avec succès.");
            setSelectedEtudiantId('');
            setManualNom('');
            setManualClasse('');
            setManualMontant('');
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('cotisations').delete().eq('id', id);
            if (error) throw error;
            showToast("Déclaration de cotisation supprimée.");
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        } finally {
            setConfirmDel(null);
        }
    };

    return (
        <div className="anim-fade-up min-h-screen p-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white text-xs font-bold shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-[#187840]"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Modal Suppression */}
            {confirmDel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-ucak-dark-card rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-300" />
                        </div>
                        <h3 className="font-black text-xl text-[#003058] dark:text-white mb-2">Rejeter ce paiement ?</h3>
                        <p className="text-sm text-slate-500 mb-8">La déclaration de <strong>{confirmDel.nom}</strong> sera définitivement supprimée.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)} className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">Annuler</button>
                            <button onClick={() => handleDelete(confirmDel.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] dark:text-white tracking-tight">Gestion des Cotisations</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Configurez le lien de paiement marchand Wave, validez les déclarations des étudiants ou saisissez des cotisations manuelles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* CONFIGURATION LIEN WAVE (1/3) */}
                    <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 space-y-6">
                        <h2 className="font-bold text-base text-[#003058] dark:text-white flex items-center gap-2">
                            <CreditCard className="text-[#187840]" size={18} /> Lien Wave Marchand
                        </h2>
                        <form onSubmit={handleSaveWaveLink} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Lien marchand actuel *</label>
                                <input 
                                    type="url" 
                                    required 
                                    value={waveLink}
                                    onChange={e => setWaveLink(e.target.value)}
                                    placeholder="Ex: https://pay.wave.com/m/..."
                                    className="input-field" 
                                />
                            </div>
                            <button type="submit" disabled={updatingLink} className="btn-primary w-full mt-2">
                                {updatingLink ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Save size={16} />}
                                Sauvegarder le lien
                            </button>
                        </form>
                    </div>

                    {/* ENREGISTRER UNE COTISATION MANUELLE (2/3) */}
                    <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 md:col-span-2 space-y-6">
                        <h2 className="font-bold text-base text-[#003058] dark:text-white flex items-center gap-2">
                            <Plus className="text-[#187840]" size={18} /> Enregistrer une cotisation (Espèces / Wave direct)
                        </h2>
                        <form onSubmit={handleAddManualPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Associer à un compte étudiant</label>
                                <div className="relative">
                                    <select 
                                        value={selectedEtudiantId}
                                        onChange={e => {
                                            setSelectedEtudiantId(e.target.value);
                                            if (e.target.value) {
                                                const selected = etudiants.find(et => et.id === e.target.value);
                                                if (selected) {
                                                    setManualNom(`${selected.prenom} ${selected.nom}`);
                                                    setManualClasse(selected.niveau || '');
                                                }
                                            }
                                        }}
                                        className="input-field bg-white dark:bg-ucak-dark-card appearance-none pr-10 font-semibold cursor-pointer"
                                    >
                                        <option value="">— Sélectionner un étudiant inscrit (Optionnel) —</option>
                                        {etudiants.map(et => (
                                            <option key={et.id} value={et.id}>{et.prenom} {et.nom} ({et.niveau || 'Non défini'})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom complet *</label>
                                <input 
                                    type="text" 
                                    required 
                                    disabled={!!selectedEtudiantId}
                                    value={manualNom}
                                    onChange={e => setManualNom(e.target.value)}
                                    placeholder="Ex: Fatou Ndiaye" 
                                    className="input-field" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Classe *</label>
                                <input 
                                    type="text" 
                                    required 
                                    disabled={!!selectedEtudiantId}
                                    value={manualClasse}
                                    onChange={e => setManualClasse(e.target.value)}
                                    placeholder="Ex: Licence 2 HEC" 
                                    className="input-field" 
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Montant versé (FCFA) *</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={manualMontant}
                                    onChange={e => setManualMontant(e.target.value)}
                                    placeholder="Ex: 5000" 
                                    className="input-field" 
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                                <button type="submit" disabled={submittingPayment} className="btn-primary px-6 py-2.5">
                                    {submittingPayment ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer la cotisation
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* LISTE DES COTISATIONS SOUMISES */}
                <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 md:p-8">
                    <h2 className="font-black text-xl text-[#003058] dark:text-white flex items-center gap-3 mb-8">
                        <Users className="text-[#187840]" size={24} />
                        Déclarations & Cotisations
                        <span className="bg-[#187840]/10 text-[#187840] text-sm px-3 py-1 rounded-full">{cotisations.length}</span>
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Chargement des cotisations...</p>
                        </div>
                    ) : cotisations.length === 0 ? (
                        <div className="text-center py-20 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl border border-slate-100 dark:border-white/10 border-dashed">
                            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-500">Aucune cotisation enregistrée pour le moment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-4 px-4">Nom & Classe</th>
                                        <th className="py-4 px-4">Montant</th>
                                        <th className="py-4 px-4">Date de Paiement</th>
                                        <th className="py-4 px-4">Enregistré par</th>
                                        <th className="py-4 px-4">Statut</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {cotisations.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-[#003058] dark:text-white">{c.nom}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{c.classe}</div>
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-[#003058] dark:text-white">
                                                {Number(c.montant).toLocaleString()} FCFA
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 font-medium">
                                                {c.date_paiement}
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium text-xs">
                                                {c.enregistre_par || <span className="text-slate-300 italic text-[11px]">Système</span>}
                                            </td>
                                            <td className="py-4 px-4">
                                                {c.statut === 'valide' ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-600 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                        <CheckCircle size={10} /> Validé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                        <Clock size={10} /> En attente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {c.statut === 'en_attente' && (
                                                        <button 
                                                            onClick={() => handleValidate(c.id)}
                                                            className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-green-500 hover:text-green-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                            title="Valider la cotisation"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => setConfirmDel(c)}
                                                        className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                        title="Supprimer la déclaration"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
