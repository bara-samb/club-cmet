// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from "react";
import { supabase, safeInsert, safeUpdate } from "../../config/supabaseClient";
import { Pencil, Trash2, AlertTriangle, UserPlus, Image as ImageIcon, Save, Loader2, Users } from "lucide-react";

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
    const [activeTab, setActiveTab] = useState('actuels');

    const membresActuels = membres.filter(m => !m.annee || m.annee.trim() === "");
    const membresAnciens = membres.filter(m => m.annee && m.annee.trim() !== "");

    // Grouping anciens by year
    const groupedAnciens = membresAnciens.reduce((groups, member) => {
        const year = member.annee;
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
                    const match = m.classe.match(/\s*\(?(\d{4}-\d{4})\)?/);
                    if (match) {
                        const annee = match[1];
                        const classeSansAnnee = m.classe.replace(/\s*\(?\d{4}-\d{4}\)?/, "").trim();
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
        setUploading(true);
        try {
            const imageUrl = await uploadImage();
            const isAncien = !!(form.annee && form.annee.trim() !== "");
            
            let finalClasse = form.classe;
            if (isAncien) {
                finalClasse = `${form.classe} (${form.annee.trim()})`;
            }

            const data = {
                nom: form.nom,
                poste: form.poste,
                classe: finalClasse,
                imageUrl
            };
            if (editId) {
                const { error } = await safeUpdate("bureau", data, q => q.eq("id", editId));
                if (error) throw error;
                showToast("Membre mis à jour ✓");
            } else {
                const { error } = await safeInsert("bureau", data);
                if (error) throw error;
                showToast("Membre ajouté ✓");
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
        <div className="min-h-screen bg-[#F8F0F0] p-6 animate-in fade-in duration-500">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white text-xs font-bold shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-[#187840]"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Modal suppression */}
            {confirmDel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="font-black text-xl text-[#003058] mb-2">Supprimer ce membre ?</h3>
                        <p className="text-sm text-slate-500 mb-8"><strong>{confirmDel.nom}</strong> sera définitivement retiré du bureau.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 transition-colors">Annuler</button>
                            <button onClick={() => handleDelete(confirmDel)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm shadow-red-500/20">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] tracking-tight">Gestion du Bureau</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Ajouter, modifier ou supprimer les membres officiels du bureau.</p>
                </div>

                {/* Formulaire */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                    <h2 className="font-bold text-lg text-[#003058] mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-[#187840]/10 rounded-2xl flex items-center justify-center">
                            {editId ? <Pencil className="w-5 h-5 text-[#187840]" /> : <UserPlus className="w-5 h-5 text-[#187840]" />}
                        </span>
                        {editId ? "Modifier le membre" : "Ajouter un membre"}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Photo */}
                        <div className="md:col-span-2 flex items-center gap-6 p-4 bg-[#F8F0F0] rounded-2xl border border-slate-100">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                                {preview
                                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                    : <ImageIcon className="w-8 h-8 text-slate-300" />
                                }
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Photo du membre</label>
                                <label className="cursor-pointer bg-white border border-[#C8C8C8] hover:border-[#187840] hover:text-[#187840] text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2">
                                    <ImageIcon size={16} />
                                    {imageFile ? imageFile.name : "Choisir une photo"}
                                    <input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
                                </label>
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
                            <select value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })}
                                className="input-field">
                                <option value="">— Sélectionner un poste —</option>
                                {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Niveau */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Niveau / Classe *</label>
                            <select value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })}
                                className="input-field">
                                <option value="">— Sélectionner un niveau —</option>
                                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {/* Année de Mandat (Optionnel — classifie comme ancien membre si renseigné) */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Année de Mandat (Optionnel)</label>
                            <input type="text" value={form.annee || ""} onChange={e => setForm({ ...form, annee: e.target.value })}
                                placeholder="Ex: 2024 (laisser vide pour le Bureau Actuel)"
                                className="input-field" />
                        </div>

                        {uploading && (
                            <div className="md:col-span-2 bg-[#F8F0F0] p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between text-[11px] font-bold text-[#003058] mb-2">
                                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#187840]" /> Upload en cours...</span>
                                    <span className="text-[#187840]">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#187840] h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            {editId && (
                                <button type="button" onClick={resetForm}
                                    className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
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
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
                        <h2 className="font-black text-xl text-[#003058] flex items-center gap-3">
                            <Users className="text-[#187840]" size={24} />
                            Membres enregistrés
                            <span className="bg-[#187840]/10 text-[#187840] text-sm px-3 py-1 rounded-full">{membres.length}</span>
                        </h2>
                        
                        {/* Onglets d'administration */}
                        <div className="flex gap-2 bg-[#F8F0F0] p-1 rounded-xl border border-slate-200/50">
                            <button type="button" onClick={() => setActiveTab('actuels')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'actuels' ? 'bg-white text-[#187840] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                Actuels ({membresActuels.length})
                            </button>
                            <button type="button" onClick={() => setActiveTab('anciens')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'anciens' ? 'bg-white text-[#187840] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
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
                            <div className="text-center py-20 bg-[#F8F0F0] rounded-2xl border border-slate-100 border-dashed">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500">Aucun membre actuel enregistré.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
                                {membresActuels.map(m => (
                                    <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:border-[#187840]/30 transition-all group relative">
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditId(m.id); setForm({ nom: m.nom, poste: m.poste, classe: m.classe, imageUrl: m.imageUrl || "", estAncien: m.estAncien || false, annee: m.annee || "" }); setPreview(m.imageUrl || null); setImageFile(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                className="w-7 h-7 bg-white border border-[#C8C8C8] hover:border-[#187840] hover:text-[#187840] text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Modifier">
                                                <Pencil size={14} strokeWidth={2.5} />
                                            </button>
                                            <button onClick={() => setConfirmDel(m)}
                                                className="w-7 h-7 bg-white border border-[#C8C8C8] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Supprimer">
                                                <Trash2 size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 shadow-sm">
                                            {m.imageUrl
                                                ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-[#003058] flex items-center justify-center text-[#187840] text-2xl font-black">{m.nom?.[0]}</div>
                                            }
                                        </div>
                                        <h4 className="font-bold text-sm text-[#003058] truncate">{m.nom}</h4>
                                        <p className="text-xs text-[#187840] font-semibold mt-1 leading-tight">{m.poste}</p>
                                        <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                                            <span className="text-[9px] font-bold text-slate-500 bg-[#F8F0F0] py-0.5 px-2 rounded border border-slate-100 uppercase tracking-wider">{m.classe}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        membresAnciens.length === 0 ? (
                            <div className="text-center py-20 bg-[#F8F0F0] rounded-2xl border border-slate-100 border-dashed">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500">Aucun ancien membre enregistré.</p>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                {sortedAnciensYears.map(year => (
                                    <div key={year} className="space-y-4">
                                        <h3 className="font-black text-xs text-[#187840] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <span>Mandat {year}</span>
                                            <span className="bg-[#187840]/10 text-[#187840] text-[10px] px-2.5 py-0.5 rounded-full">{groupedAnciens[year].length}</span>
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {groupedAnciens[year].map(m => (
                                                <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md hover:border-[#187840]/30 transition-all group relative flex flex-col justify-between">
                                                    <div>
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setEditId(m.id); setForm({ nom: m.nom, poste: m.poste, classe: m.classe, imageUrl: m.imageUrl || "", estAncien: m.estAncien || false, annee: m.annee || "" }); setPreview(m.imageUrl || null); setImageFile(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                                                className="w-7 h-7 bg-white border border-[#C8C8C8] hover:border-[#187840] hover:text-[#187840] text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                                title="Modifier">
                                                                <Pencil size={14} strokeWidth={2.5} />
                                                            </button>
                                                            <button onClick={() => setConfirmDel(m)}
                                                                className="w-7 h-7 bg-white border border-[#C8C8C8] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                                title="Supprimer">
                                                                <Trash2 size={14} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                        <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-4 border-slate-50 shadow-sm">
                                                            {m.imageUrl
                                                                ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full bg-[#003058] flex items-center justify-center text-[#187840] text-2xl font-black">{m.nom?.[0]}</div>
                                                            }
                                                        </div>
                                                        <h4 className="font-bold text-sm text-[#003058] truncate">{m.nom}</h4>
                                                        <p className="text-xs text-[#187840] font-semibold mt-1 leading-tight">{m.poste}</p>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-bold text-slate-500 bg-[#F8F0F0] py-0.5 px-2 rounded border border-slate-100 uppercase tracking-wider">{m.classe}</span>
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