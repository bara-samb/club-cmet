// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase, safeInsert, safeUpdate } from "../../config/supabaseClient";
import { Pencil, Trash2, AlertTriangle, UserPlus, Image as ImageIcon, Save, Loader2, Users, ChevronDown } from "lucide-react";
import Toast from '../../components/ui/Toast';

const POSTES = [
    "Président", "Vice-Président", "Secrétaire Général(e)",
    "Responsable C.Finances", "Adjoint(e) C.Finance",
    "Responsable C.Pédagogique", "Adjoint(e) C.Pédagogique",
    "Responsable C.Partenariat", "Adjoint(e) C.Partenariat",
    "Responsable C.Communication", "Adjoint(e) C.Communication",
    "Responsable C.Social", "Adjoint(e) C.Social",
    "Responsable C.Organisation", "Adjoint(e) C.Organisation",


];
import { NIVEAUX } from "../../config/constants";
const VIDE = { nom: "", poste: "", classe: "", imageUrl: "", estAncien: false, annee: "" };

export default function ManageUsers() {
    const [membres, setMembres] = useState([]);
    const [form, setForm] = useState(VIDE);
    const [editId, setEditId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('actuels');

    const membresActuels = membres.filter(m => !m.estAncien);
    const membresAnciens = membres.filter(m => m.estAncien);

    // Grouping anciens by year
    const groupedAnciens = membresAnciens.reduce((groups, member) => {
        const year = member.annee || "Mandat précédent";
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(member);
        return groups;
    }, {});
    const sortedAnciensYears = Object.keys(groupedAnciens).sort((a, b) => b.localeCompare(a));

    useEffect(() => {
        let active = true;
        let channel;

        const fetchMembres = async () => {
            const { data } = await supabase.from("bureau").select("*").order("createdAt", { ascending: false });
            if (data && active) {
                const parsed = data.map(m => {
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
                setMembres(parsed);
            }
            if (active) setLoading(false);
        };

        const init = async () => {
            await fetchMembres();
            if (!active) return;

            channel = supabase.channel('bureau-manage-users')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, () => { fetchMembres(); })
                .subscribe();
        };

        init();

        return () => {
            active = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const uploadImage = async () => {
        if (!imageFile) return form.imageUrl || "";

        const cleanName = imageFile.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}_${cleanName}`;
        const filePath = `bureau/${fileName}`;

        setProgress(20);
        const { error: uploadError } = await supabase.storage
            .from('club-met-storage')
            .upload(filePath, imageFile, { upsert: true });

        if (uploadError) throw uploadError;
        setProgress(80);

        const { data: { publicUrl } } = supabase.storage
            .from('club-met-storage')
            .getPublicUrl(filePath);

        setProgress(100);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nom.trim() || !form.poste || !form.classe) {
            showToast("Remplis tous les champs obligatoires.", "error"); return;
        }
        if (form.estAncien && (!form.annee || !form.annee.trim())) {
            showToast("Veuillez renseigner l'année de mandat pour un ancien membre.", "error"); return;
        }
        setUploading(true);
        try {
            const imageUrl = await uploadImage();
            const data = {
                nom: form.nom,
                poste: form.poste,
                classe: form.classe,
                imageUrl,
                estAncien: form.estAncien,
                annee: form.estAncien ? form.annee.trim() : null
            };
            if (editId) {
                const { error } = await safeUpdate("bureau", data, q => q.eq("id", editId));
                if (error) throw error;
                showToast("Membre mis à jour.");
            } else {
                const { error } = await safeInsert("bureau", data);
                if (error) throw error;
                showToast("Membre ajouté.");
            }
            resetForm();
        } catch (err) { showToast("Erreur : " + err.message, "error"); }
        finally { setUploading(false); setProgress(0); }
    };

    const handleDelete = async (m) => {
        try {
            const { error: dbErr } = await supabase.from("bureau").delete().eq("id", m.id);
            if (dbErr) throw dbErr;

            if (m.imageUrl) {
                const parts = m.imageUrl.split('/club-met-storage/');
                if (parts.length > 1) {
                    const filePath = parts[1];
                    await supabase.storage.from('club-met-storage').remove([filePath]);
                }
            }
            showToast("Membre supprimé.");
        } catch (err) { showToast("Erreur : " + err.message, "error"); }
        setConfirmDel(null);
    };

    const resetForm = () => { setForm(VIDE); setEditId(null); setImageFile(null); setPreview(null); };

    return (
        <div className="anim-fade-up min-h-screen p-6">

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {/* Modal suppression */}
            {confirmDel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-ucak-dark-card rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-300" />
                        </div>
                        <h3 className="font-black text-xl text-[#003058] dark:text-white mb-2">Supprimer ce membre ?</h3>
                        <p className="text-sm text-slate-500 mb-8"><strong>{confirmDel.nom}</strong> sera définitivement retiré du bureau.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)} className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">Annuler</button>
                            <button onClick={() => handleDelete(confirmDel)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm shadow-red-500/20">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] dark:text-white tracking-tight">Gestion du Bureau</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Ajouter, modifier ou supprimer les membres officiels du bureau.</p>
                </div>

                {/* Formulaire */}
                <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 md:p-8">
                    <h2 className="font-bold text-lg text-[#003058] dark:text-white mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-[#187840]/10 rounded-2xl flex items-center justify-center">
                            {editId ? <Pencil className="w-5 h-5 text-[#187840]" /> : <UserPlus className="w-5 h-5 text-[#187840]" />}
                        </span>
                        {editId ? "Modifier le membre" : "Ajouter un membre"}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Photo */}
                        <div className="md:col-span-2 flex items-center gap-6 p-4 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl border border-slate-100 dark:border-white/10">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0 bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                {preview
                                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                    : <ImageIcon className="w-8 h-8 text-slate-300" />
                                }
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Photo du membre</label>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-[#187840] hover:text-[#187840] text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2"
                                >
                                    <ImageIcon size={16} />
                                    {imageFile ? imageFile.name : "Choisir une photo"}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if (e.target.files[0]) { setImageFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} className="hidden" />
                                </button>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">JPG, PNG — max 5 MB</p>
                            </div>
                        </div>

                        {/* Nom */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom complet *</label>
                            <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                                placeholder="Ex: Mamadou Diop"
                                className="input-field" />
                        </div>

                        {/* Poste */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Poste *</label>
                            <div className="relative">
                                <select value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })}
                                    className="input-field appearance-none pr-10 bg-white dark:bg-ucak-dark-card font-semibold cursor-pointer">
                                    <option value="">— Sélectionner un poste —</option>
                                    {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Niveau */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Niveau / Classe *</label>
                            <div className="relative">
                                <select value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })}
                                    className="input-field appearance-none pr-10 bg-white dark:bg-ucak-dark-card font-semibold cursor-pointer">
                                    <option value="">— Sélectionner un niveau —</option>
                                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Statut Membre */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Statut du membre *</label>
                            <div className="relative">
                                <select value={form.estAncien ? "ancien" : "actuel"} onChange={e => setForm({ ...form, estAncien: e.target.value === "ancien" })}
                                    className="input-field appearance-none pr-10 bg-white dark:bg-ucak-dark-card font-semibold cursor-pointer">
                                    <option value="actuel">Membre Actuel (Bureau en cours)</option>
                                    <option value="ancien">Ancien Membre (Mandats passés)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Année (uniquement si Ancien) */}
                        {form.estAncien && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Année de Mandat *</label>
                                <input type="text" value={form.annee || ""} onChange={e => setForm({ ...form, annee: e.target.value })}
                                    placeholder="Ex: 2024 ou 2023-2024"
                                    className="input-field" />
                            </div>
                        )}

                        {uploading && (
                            <div className="md:col-span-2 bg-[#f1f5f9] dark:bg-ucak-dark p-4 rounded-xl border border-slate-100 dark:border-white/10">
                                <div className="flex justify-between text-[11px] font-bold text-[#003058] dark:text-white mb-2">
                                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#187840]" /> Upload en cours...</span>
                                    <span className="text-[#187840]">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#187840] h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                            {editId && (
                                <button type="button" onClick={resetForm}
                                    className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                                    Annuler
                                </button>
                            )}
                            <button type="submit" disabled={uploading}
                                className="btn-primary w-full mt-2">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {editId ? "Mettre à jour" : "Ajouter le membre"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Liste */}
                <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100 dark:border-white/10">
                        <h2 className="font-black text-xl text-[#003058] dark:text-white flex items-center gap-3">
                            <Users className="text-[#187840]" size={24} />
                            Membres enregistrés
                            <span className="bg-[#187840]/10 text-[#187840] text-sm px-3 py-1 rounded-full">{membres.length}</span>
                        </h2>
                        
                        {/* Onglets d'administration */}
                        <div className="flex gap-2 bg-[#f1f5f9] dark:bg-ucak-dark p-1 rounded-xl border border-slate-200/50 dark:border-white/10">
                            <button type="button" onClick={() => setActiveTab('actuels')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'actuels' ? 'bg-white dark:bg-ucak-dark-card text-[#187840] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                Actuels ({membresActuels.length})
                            </button>
                            <button type="button" onClick={() => setActiveTab('anciens')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'anciens' ? 'bg-white dark:bg-ucak-dark-card text-[#187840] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                Anciens ({membresAnciens.length})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Chargement...</p>
                        </div>
                    ) : activeTab === 'actuels' ? (
                        membresActuels.length === 0 ? (
                            <div className="text-center py-20 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl border border-slate-100 dark:border-white/10 border-dashed">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500">Aucun membre actuel enregistré.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
                                {membresActuels.map(m => (
                                    <div key={m.id} className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:border-[#187840]/30 transition-all group relative">
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditId(m.id); setForm({ nom: m.nom, poste: m.poste, classe: m.classe, imageUrl: m.imageUrl || "", estAncien: m.estAncien || false, annee: m.annee || "" }); setPreview(m.imageUrl || null); setImageFile(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-[#187840] hover:text-[#187840] text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Modifier">
                                                <Pencil size={14} strokeWidth={2.5} />
                                            </button>
                                            <button onClick={() => setConfirmDel(m)}
                                                className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Supprimer">
                                                <Trash2 size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 dark:border-white/5 shadow-sm">
                                            {m.imageUrl
                                                ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-[#003058] flex items-center justify-center text-[#187840] text-2xl font-black">{m.nom?.[0]}</div>
                                            }
                                        </div>
                                        <h4 className="font-bold text-sm text-[#003058] dark:text-white truncate">{m.nom}</h4>
                                        <p className="text-xs text-[#187840] font-semibold mt-1 leading-tight">{m.poste}</p>
                                        <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                                            <span className="text-[9px] font-bold text-slate-500 bg-[#f1f5f9] dark:bg-ucak-dark py-0.5 px-2 rounded border border-slate-100 dark:border-white/10 uppercase tracking-wider">{m.classe}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        membresAnciens.length === 0 ? (
                            <div className="text-center py-20 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl border border-slate-100 dark:border-white/10 border-dashed">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500">Aucun ancien membre enregistré.</p>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                {sortedAnciensYears.map(year => (
                                    <div key={year} className="space-y-4">
                                        <h3 className="font-black text-xs text-[#187840] uppercase tracking-wider border-b border-slate-100 dark:border-white/10 pb-2 flex items-center gap-2">
                                            <span>Mandat {year}</span>
                                            <span className="bg-[#187840]/10 text-[#187840] text-[10px] px-2.5 py-0.5 rounded-full">{groupedAnciens[year].length}</span>
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {groupedAnciens[year].map(m => (
                                                <div key={m.id} className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:border-[#187840]/30 transition-all group relative flex flex-col justify-between">
                                                    <div>
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setEditId(m.id); setForm({ nom: m.nom, poste: m.poste, classe: m.classe, imageUrl: m.imageUrl || "", estAncien: m.estAncien || false, annee: m.annee || "" }); setPreview(m.imageUrl || null); setImageFile(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                                className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-[#187840] hover:text-[#187840] text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                                title="Modifier">
                                                                <Pencil size={14} strokeWidth={2.5} />
                                                            </button>
                                                            <button onClick={() => setConfirmDel(m)}
                                                                className="w-7 h-7 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                                title="Supprimer">
                                                                <Trash2 size={14} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                        <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 dark:border-white/5 shadow-sm">
                                                            {m.imageUrl
                                                                ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full bg-[#003058] flex items-center justify-center text-[#187840] text-2xl font-black">{m.nom?.[0]}</div>
                                                            }
                                                        </div>
                                                        <h4 className="font-bold text-sm text-[#003058] dark:text-white truncate">{m.nom}</h4>
                                                        <p className="text-xs text-[#187840] font-semibold mt-1 leading-tight">{m.poste}</p>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-bold text-slate-500 bg-[#f1f5f9] dark:bg-ucak-dark py-0.5 px-2 rounded border border-slate-100 dark:border-white/10 uppercase tracking-wider">{m.classe}</span>
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
            </div>
        </div>
    );
}