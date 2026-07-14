import React, { useState, useEffect } from 'react';
import { supabase, safeInsert, safeUpdate } from '../../config/supabaseClient';
import { FolderOpen, Plus, Trash2, Eye, FileText, Loader2, AlertTriangle, Save, X } from 'lucide-react';

const CATEGORIES = [
    { id: 'reglement', label: 'Règlement Intérieur (Espace Documents)' },
    { id: 'rapports', label: 'Rapport d\'Activité (Espace Documents)' },
    { id: 'comptes_rendus', label: 'Compte Rendu d\'AG (Espace Documents)' },
    { id: 'maquette', label: 'Maquette de Filière (Espace Documents)' },
    { id: 'cours', label: 'Cours & Supports (Bibliothèque)' },
    { id: 'td', label: 'TD & Exercices (Bibliothèque)' },
    { id: 'examens', label: 'Examens & Corrigés (Bibliothèque)' },
    { id: 'projets', label: 'Projets & Mémoires (Bibliothèque)' },
    { id: 'autres', label: 'Autres documents (Bibliothèque)' }
];

export default function ManageDocs() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    const [form, setForm] = useState({ nom: "", url: "", categorie: "reglement", description: "", filiere: "IT", niveau: "Commun" });
    const [docFile, setDocFile] = useState(null);

    useEffect(() => {
        let active = true;
        let c1, c2, c3;

        const fetchDocs = async () => {
            try {
                const [ressourcesData, maquettesData, biblioData] = await Promise.all([
                    supabase.from('ressources').select('*'),
                    supabase.from('maquettes').select('*'),
                    supabase.from('bibliotheque').select('*')
                ]);
                
                if (active) {
                    const rList = (ressourcesData.data || []).map(r => ({ 
                        ...r, 
                        sourceTable: 'ressources',
                        createdAt: r.createdAt || r.created_at || new Date(0).toISOString()
                    }));
                    const mList = (maquettesData.data || []).map(m => ({
                        ...m,
                        categorie: 'maquette',
                        description: `Filière: ${m.filiere}`,
                        sourceTable: 'maquettes',
                        createdAt: m.createdAt || m.created_at || new Date(0).toISOString(),
                        date: new Date(m.createdAt || m.created_at || new Date()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                        typeDoc: 'PDF'
                    }));
                    const bList = (biblioData.data || []).map(b => ({
                        ...b,
                        sourceTable: 'bibliotheque',
                        createdAt: b.date_ajout || b.createdAt || new Date(0).toISOString(),
                        date: new Date(b.date_ajout || b.createdAt || new Date()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                        typeDoc: 'PDF'
                    }));

                    const merged = [...rList, ...mList, ...bList].sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });

                    setDocs(merged);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching docs:", err);
            }
        };

        fetchDocs();

        c1 = supabase.channel('admin-docs-changes-ressources')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, fetchDocs)
            .subscribe();

        c2 = supabase.channel('admin-docs-changes-maquettes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, fetchDocs)
            .subscribe();

        c3 = supabase.channel('admin-docs-changes-bibliotheque')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bibliotheque' }, fetchDocs)
            .subscribe();

        return () => {
            active = false;
            if (c1) supabase.removeChannel(c1);
            if (c2) supabase.removeChannel(c2);
            if (c3) supabase.removeChannel(c3);
        };
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleUpload = async () => {
        if (!docFile) return form.url;

        const cleanName = docFile.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}_${cleanName}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('club-met-storage')
            .upload(filePath, docFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('club-met-storage')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nom.trim() || (!form.url && !docFile) || !form.categorie) {
            showToast("Veuillez remplir tous les champs requis.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const finalUrl = await handleUpload();
            const typeDoc = docFile ? docFile.name.split('.').pop().toUpperCase() : 'Lien';

            let error;
            if (form.categorie === 'maquette') {
                const payload = {
                    nom: form.nom,
                    url: finalUrl,
                    filiere: form.filiere || 'IT'
                };
                ({ error } = await safeInsert('maquettes', payload));
            } else if (['cours', 'td', 'examens', 'projets', 'autres'].includes(form.categorie)) {
                const payload = {
                    nom: form.nom,
                    url: finalUrl,
                    categorie: form.categorie,
                    niveau: form.niveau || 'Commun',
                    description: form.description
                };
                ({ error } = await safeInsert('bibliotheque', payload));
            } else {
                const payload = {
                    nom: form.nom,
                    url: finalUrl,
                    categorie: form.categorie,
                    description: form.description,
                    typeDoc,
                    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                };
                ({ error } = await safeInsert('ressources', payload));
            }

            if (error) throw error;

            showToast("Document ajouté avec succès ! ✓");
            setForm({ nom: "", url: "", categorie: "reglement", description: "", filiere: "IT", niveau: "Commun" });
            setDocFile(null);
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (doc) => {
        try {
            const { error } = await supabase.from(doc.sourceTable).delete().eq('id', doc.id);
            if (error) throw error;

            if (doc.url && doc.url.includes('/club-met-storage/')) {
                const parts = doc.url.split('/club-met-storage/');
                if (parts.length > 1) {
                    const filePath = parts[1];
                    await supabase.storage.from('club-met-storage').remove([filePath]);
                }
            }
            showToast("Document supprimé avec succès.");
        } catch (err) {
            showToast("Erreur : " + err.message, "error");
        } finally {
            setConfirmDel(null);
        }
    };

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
                        <h3 className="font-black text-xl text-[#003058] mb-2">Supprimer ce document ?</h3>
                        <p className="text-sm text-slate-500 mb-8">Le fichier <strong>{confirmDel.nom}</strong> sera définitivement effacé.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 transition-colors">Annuler</button>
                            <button onClick={() => handleDelete(confirmDel)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] tracking-tight">Gestion des Documents</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Ajouter ou supprimer des règlements officiels, des rapports d'activité et des comptes rendus.</p>
                </div>

                {/* Formulaire */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                    <h2 className="font-bold text-lg text-[#003058] mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-[#187840]/10 rounded-2xl flex items-center justify-center">
                            <Plus className="w-5 h-5 text-[#187840]" />
                        </span>
                        Ajouter un nouveau document
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fichier */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Fichier du document</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#F8F0F0] rounded-2xl border border-slate-100 w-full">
                                <label className="w-full sm:w-auto text-center cursor-pointer bg-white border border-[#C8C8C8] hover:border-[#187840] hover:text-[#187840] text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                    <FolderOpen size={16} />
                                    {docFile ? docFile.name : "Choisir un fichier"}
                                    <input type="file" onChange={e => { setDocFile(e.target.files[0]); if(e.target.files[0]) setForm({...form, url:""}); }} className="hidden" />
                                </label>
                                <span className="text-slate-400 text-xs">— OU —</span>
                                <input 
                                    type="url" 
                                    value={form.url} 
                                    onChange={e => { setForm({ ...form, url: e.target.value }); if(e.target.value) setDocFile(null); }}
                                    placeholder="Coller un lien URL externe" 
                                    className="input-field flex-grow w-full bg-white" 
                                />
                            </div>
                        </div>

                        {/* Titre */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Titre du document *</label>
                            <input 
                                type="text" 
                                required 
                                value={form.nom} 
                                onChange={e => setForm({ ...form, nom: e.target.value })}
                                placeholder="Ex: Règlement Intérieur 2026"
                                className="input-field" 
                            />
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Catégorie *</label>
                            <select 
                                value={form.categorie} 
                                onChange={e => setForm({ ...form, categorie: e.target.value })}
                                className="input-field bg-white"
                            >
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            </select>
                        </div>

                        {/* Filière (seulement pour les maquettes) */}
                        {form.categorie === 'maquette' && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Filière *</label>
                                <select 
                                    value={form.filiere} 
                                    onChange={e => setForm({ ...form, filiere: e.target.value })}
                                    className="input-field bg-white"
                                >
                                    <option value="IT">Informatique & Télécommunications (IT)</option>
                                    <option value="HEC">Hautes Études Commerciales (HEC)</option>
                                </select>
                            </div>
                        )}

                        {/* Niveau (seulement pour la bibliothèque) */}
                        {['cours', 'td', 'examens', 'projets', 'autres'].includes(form.categorie) && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Niveau / Classe *</label>
                                <select 
                                    value={form.niveau} 
                                    onChange={e => setForm({ ...form, niveau: e.target.value })}
                                    className="input-field bg-white"
                                >
                                    <option value="Commun">Tronc Commun / Général</option>
                                    <option value="L1">Licence 1 (Général)</option>
                                    <option value="L1IT">L1IT - Technologies de l'Information</option>
                                    <option value="L1HEC">L1HEC - Hautes Études Commerciales</option>
                                    <option value="L2">Licence 2 (Général)</option>
                                    <option value="L2IT">L2IT - Technologies de l'Information</option>
                                    <option value="L2HEC">L2HEC - Hautes Études Commerciales</option>
                                    <option value="L3">Licence 3 (Général)</option>
                                    <option value="L3IT - DAR">L3IT - Développement d'Applications Réseaux (DAR)</option>
                                    <option value="L3IT - ASR">L3IT - Administration Systèmes & Réseaux (ASR)</option>
                                    <option value="L3IT - RT">L3IT - Réseaux & Télécoms (RT)</option>
                                    <option value="L3HEC - Entrepreneuriat & Création d'Entreprise">L3HEC - Entrepreneuriat & Création d'Entreprise</option>
                                    <option value="L3HEC - Comptabilité & Gestion">L3HEC - Comptabilité & Gestion</option>
                                    <option value="M1">Master 1</option>
                                    <option value="M2">Master 2</option>
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description (optionnelle)</label>
                            <textarea 
                                value={form.description} 
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Description succincte de la ressource..."
                                rows="3"
                                className="input-field resize-none" 
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-end pt-4 border-t border-slate-100">
                            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Publier le document
                            </button>
                        </div>
                    </form>
                </div>

                {/* Liste des documents */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                    <h2 className="font-black text-xl text-[#003058] flex items-center gap-3 mb-8">
                        <FolderOpen className="text-[#187840]" size={24} />
                        Documents publiés
                        <span className="bg-[#187840]/10 text-[#187840] text-sm px-3 py-1 rounded-full">{docs.length}</span>
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                            <p className="text-sm font-medium text-slate-500">Chargement...</p>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="text-center py-20 bg-[#F8F0F0] rounded-2xl border border-slate-100 border-dashed">
                            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-500">Aucun document publié pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docs.map(doc => (
                                <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative">
                                    <button 
                                        onClick={() => setConfirmDel(doc)}
                                        className="absolute top-3 right-3 w-7 h-7 bg-white border border-[#C8C8C8] hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div>
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 bg-[#F8F0F0] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                                <FileText size={20} className="text-[#003058]" />
                                            </div>
                                            <div className="flex-grow min-w-0 pr-6">
                                                <h3 className="text-xs font-bold text-[#003058] leading-tight mb-1.5 line-clamp-2" title={doc.nom}>
                                                    {doc.nom}
                                                </h3>
                                                <span className="text-[9px] font-black text-slate-500 bg-[#F8F0F0] border border-slate-200 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                                    {doc.categorie}
                                                </span>
                                            </div>
                                        </div>
                                        {doc.description && (
                                            <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 italic">
                                                "{doc.description}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                        <span>📅 {doc.date}</span>
                                        <span>📄 {doc.typeDoc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
