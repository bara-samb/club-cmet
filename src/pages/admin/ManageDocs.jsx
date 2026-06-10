// src/pages/admin/ManageDocs.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { FileText, FolderOpen, Plus, Pencil, Trash2, AlertTriangle, Upload, Loader2, ExternalLink, BookOpen, ClipboardList, GraduationCap, Save, X } from 'lucide-react';

const CATEGORIES_RESSOURCES = [
    { id: 'reglement', label: 'Règlement Intérieur' },
    { id: 'rapports', label: 'Rapports Mensuels' },
    { id: 'comptes_rendus', label: 'Comptes Rendus' },
];

const CATEGORIES_BIBLIO = [
    { id: 'cours', label: 'Cours & Supports' },
    { id: 'td', label: 'TD & Exercices' },
    { id: 'examens', label: 'Examens & Corrigés' },
    { id: 'projets', label: 'Projets & Mémoires' },
    { id: 'autres', label: 'Autres' },
];

const FILIERES = ['IT', 'HEC', 'Commun'];

const VIDE_R = { nom: '', categorie: 'reglement', date: '', typeDoc: '' };
const VIDE_M = { filiere: 'IT', nom: '', date: '' };
const VIDE_B = { nom: '', categorie: 'cours', filiere: 'Commun', date: '', description: '' };

export default function ManageDocs() {
    const [onglet, setOnglet] = useState('ressources');
    const [docs, setDocs] = useState([]);
    const [maquettes, setMaquettes] = useState([]);
    const [biblio, setBiblio] = useState([]);
    const [formDoc, setFormDoc] = useState(VIDE_R);
    const [formMaq, setFormMaq] = useState(VIDE_M);
    const [formBiblio, setFormBiblio] = useState(VIDE_B);
    const [editDocId, setEditDocId] = useState(null);
    const [editMaqId, setEditMaqId] = useState(null);
    const [editBibId, setEditBibId] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchDocs = async () => {
            const { data } = await supabase.from('ressources').select('*');
            if (data && active) setDocs(data);
            if (active) setLoading(false);
        };
        const fetchMaquettes = async () => {
            const { data } = await supabase.from('maquettes').select('*');
            if (data && active) setMaquettes(data);
        };
        const fetchBiblio = async () => {
            const { data } = await supabase.from('bibliotheque').select('*');
            if (data && active) setBiblio(data);
        };

        const init = async () => {
            await Promise.all([fetchDocs(), fetchMaquettes(), fetchBiblio()]);
            if (!active) return;

            const c1 = supabase.channel('ressources-manage')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, () => { fetchDocs(); })
                .subscribe();
            const c2 = supabase.channel('maquettes-manage')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, () => { fetchMaquettes(); })
                .subscribe();
            const c3 = supabase.channel('bibliotheque-manage')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bibliotheque' }, () => { fetchBiblio(); })
                .subscribe();

            channels.push(c1, c2, c3);
        };

        init();

        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const uploadPDF = async (folder) => {
        if (!pdfFile) return null;

        // 1. Nettoyer le nom du fichier (supprimer accents, espaces et caractères spéciaux)
        const cleanOriginalName = pdfFile.name
            .normalize("NFD")                           // Sépare les caractères de leurs accents
            .replace(/[\u0300-\u036f]/g, "")            // Supprime les accents
            .replace(/\s+/g, "_")                       // Remplace les espaces par des underscores
            .replace(/[^a-zA-Z0-9_.-]/g, "");           // Supprime tout ce qui n'est pas alphanumérique, _, . ou -

        // 2. Générer le nom final unique et propre
        const fileName = `${Date.now()}_${cleanOriginalName}`;
        const filePath = `${folder}/${fileName}`;

        setProgress(20);
        const { error: uploadError } = await supabase.storage
            .from('club-met-storage')
            .upload(filePath, pdfFile, { upsert: true });

        if (uploadError) throw uploadError;
        setProgress(80);

        const { data: { publicUrl } } = supabase.storage
            .from('club-met-storage')
            .getPublicUrl(filePath);

        setProgress(100);
        return publicUrl;
    };

    const handleDelete = async (item, col) => {
        try {
            const { error: dbErr } = await supabase.from(col).delete().eq('id', item.id);
            if (dbErr) throw dbErr;

            if (item.url) {
                const parts = item.url.split('/club-met-storage/');
                if (parts.length > 1) {
                    const filePath = parts[1];
                    await supabase.storage.from('club-met-storage').remove([filePath]);
                }
            }
            showToast('Supprimé avec succès.');
        } catch (err) { showToast('Erreur : ' + err.message, 'error'); }
        setConfirmDel(null);
    };

    /* ── RESSOURCES ── */
    const handleSubmitDoc = async (e) => {
        e.preventDefault();
        if (!formDoc.nom.trim()) { showToast('Nom requis.', 'error'); return; }
        setUploading(true);
        try {
            const url = await uploadPDF('ressources');
            const data = {
                nom: formDoc.nom,
                categorie: formDoc.categorie,
                typeDoc: formDoc.typeDoc,
                date: formDoc.date,
                url: url || (editDocId ? docs.find(d => d.id === editDocId)?.url || '' : ''),
                updatedAt: new Date().toISOString()
            };
            if (editDocId) {
                const { error } = await supabase.from('ressources').update(data).eq('id', editDocId);
                if (error) throw error;
                showToast('Document mis à jour ✓');
            } else {
                const { error } = await supabase.from('ressources').insert(data);
                if (error) throw error;
                showToast('Document ajouté ✓');
            }
            setFormDoc(VIDE_R); setEditDocId(null); setPdfFile(null);
        } catch (err) { showToast('Erreur : ' + err.message, 'error'); }
        finally { setUploading(false); setProgress(0); }
    };

    /* ── MAQUETTES ── */
    const handleSubmitMaq = async (e) => {
        e.preventDefault();
        if (!formMaq.nom.trim()) { showToast('Nom requis.', 'error'); return; }
        setUploading(true);
        try {
            const url = await uploadPDF('maquettes');
            const data = {
                nom: formMaq.nom,
                filiere: formMaq.filiere,
                typeDoc: 'Maquette Pédagogique',
                date: formMaq.date,
                url: url || (editMaqId ? maquettes.find(m => m.id === editMaqId)?.url || '' : ''),
                updatedAt: new Date().toISOString()
            };
            if (editMaqId) {
                const { error } = await supabase.from('maquettes').update(data).eq('id', editMaqId);
                if (error) throw error;
                showToast('Maquette mise à jour ✓');
            } else {
                const { error } = await supabase.from('maquettes').insert(data);
                if (error) throw error;
                showToast('Maquette ajoutée ✓');
            }
            setFormMaq(VIDE_M); setEditMaqId(null); setPdfFile(null);
        } catch (err) { showToast('Erreur : ' + err.message, 'error'); }
        finally { setUploading(false); setProgress(0); }
    };

    /* ── BIBLIOTHÈQUE ── */
    const handleSubmitBiblio = async (e) => {
        e.preventDefault();
        if (!formBiblio.nom.trim()) { showToast('Nom requis.', 'error'); return; }
        setUploading(true);
        try {
            const url = await uploadPDF('bibliotheque');
            const data = {
                nom: formBiblio.nom,
                categorie: formBiblio.categorie,
                filiere: formBiblio.filiere,
                date: formBiblio.date,
                description: formBiblio.description,
                url: url || (editBibId ? biblio.find(b => b.id === editBibId)?.url || '' : ''),
                updatedAt: new Date().toISOString()
            };
            if (editBibId) {
                const { error } = await supabase.from('bibliotheque').update(data).eq('id', editBibId);
                if (error) throw error;
                showToast('Document bibliothèque mis à jour ✓');
            } else {
                const { error } = await supabase.from('bibliotheque').insert(data);
                if (error) throw error;
                showToast('Document ajouté à la bibliothèque ✓');
            }
            setFormBiblio(VIDE_B); setEditBibId(null); setPdfFile(null);
        } catch (err) { showToast('Erreur : ' + err.message, 'error'); }
        finally { setUploading(false); setProgress(0); }
    };

    /* ── Composants réutilisables ── */
    const PdfField = () => (
        <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Fichier PDF {!editDocId && !editMaqId && !editBibId ? '*' : '(nouveau, optionnel)'}
            </label>
            <label className="flex items-center gap-4 cursor-pointer border-2 border-dashed border-slate-200 hover:border-[#22c55e] bg-slate-50 hover:bg-[#22c55e]/5 rounded-2xl px-5 py-4 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                    <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-700 block">{pdfFile ? pdfFile.name : 'Choisir un fichier PDF'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Glisser-déposer ou cliquer pour sélectionner</span>
                </div>
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="hidden" />
            </label>
        </div>
    );

    const ProgressBar = () => uploading ? (
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[11px] font-bold text-[#0f213a] mb-2">
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#22c55e]" /> Upload en cours...</span>
                <span className="text-[#22c55e]">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-[#22c55e] h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
        </div>
    ) : null;

    const ActionBtns = ({ label, onCancel }) => (
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancel && (
                <button type="button" onClick={onCancel}
                    className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                    Annuler
                </button>
            )}
            <button type="submit" disabled={uploading}
                className="bg-[#0f213a] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1e3a5f] transition-colors disabled:opacity-60 shadow-sm shadow-[#0f213a]/20 flex items-center gap-2">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {label}
            </button>
        </div>
    );

    const DocRow = ({ item, col, onEdit }) => (
        <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
                <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-[#0f213a] truncate">{item.nom}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {item.typeDoc || item.categorie}{item.date ? ` · ${item.date}` : ''}{item.filiere ? ` · ${item.filiere}` : ''}
                </p>
            </div>
            {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#22c55e] font-bold hover:underline shrink-0 flex items-center gap-1"><ExternalLink size={12} /> Voir</a>
            )}
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit}
                    className="w-8 h-8 bg-white border border-slate-200 hover:border-[#22c55e] hover:text-[#22c55e] text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <Pencil size={14} strokeWidth={2.5} />
                </button>
                <button onClick={() => setConfirmDel({ ...item, _col: col })}
                    className="w-8 h-8 bg-white border border-slate-200 hover:border-red-500 hover:text-red-500 text-slate-400 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <Trash2 size={14} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );

    const ONGLETS = [
        { key: 'ressources', label: 'Ressources', icon: FolderOpen },
        { key: 'maquettes', label: 'Maquettes', icon: ClipboardList },
        { key: 'bibliotheque', label: 'Bibliothèque', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 animate-in fade-in duration-500">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white text-xs font-bold shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#22c55e]'}`}>
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
                        <h3 className="font-black text-xl text-[#0f213a] mb-2">Supprimer ce fichier ?</h3>
                        <p className="text-sm text-slate-500 mb-8"><strong>{confirmDel.nom}</strong> sera définitivement supprimé.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => handleDelete(confirmDel, confirmDel._col)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm shadow-red-500/20">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-[#0f213a] tracking-tight">Gestion des Documents</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Ressources, maquettes et bibliothèque étudiante.</p>
                </div>

                {/* Onglets */}
                <div className="flex gap-2 flex-wrap">
                    {ONGLETS.map(o => (
                        <button key={o.key} onClick={() => { setOnglet(o.key); setEditDocId(null); setEditMaqId(null); setEditBibId(null); setPdfFile(null); }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${onglet === o.key ? 'bg-[#0f213a] text-white shadow-sm shadow-[#0f213a]/20' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'}`}>
                            <o.icon size={16} />
                            {o.label}
                        </button>
                    ))}
                </div>

                {/* ════ RESSOURCES ════ */}
                {onglet === 'ressources' && (
                    <>
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                            <h2 className="font-bold text-lg text-[#0f213a] mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center">
                                    {editDocId ? <Pencil className="w-5 h-5 text-[#22c55e]" /> : <Plus className="w-5 h-5 text-[#22c55e]" />}
                                </span>
                                {editDocId ? 'Modifier le document' : 'Ajouter un document'}
                            </h2>
                            <form onSubmit={handleSubmitDoc} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom du fichier *</label>
                                    <input type="text" value={formDoc.nom} onChange={e => setFormDoc({ ...formDoc, nom: e.target.value })}
                                        placeholder="Ex: Règlement Intérieur 2026"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Catégorie *</label>
                                    <select value={formDoc.categorie} onChange={e => setFormDoc({ ...formDoc, categorie: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors">
                                        {CATEGORIES_RESSOURCES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Type de document</label>
                                    <input type="text" value={formDoc.typeDoc} onChange={e => setFormDoc({ ...formDoc, typeDoc: e.target.value })}
                                        placeholder="Ex: Rapport Mensuel"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Période / Date</label>
                                    <input type="text" value={formDoc.date} onChange={e => setFormDoc({ ...formDoc, date: e.target.value })}
                                        placeholder="Ex: Mai 2026"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <PdfField />
                                <ProgressBar />
                                <ActionBtns label={editDocId ? 'Mettre à jour' : 'Ajouter'}
                                    onCancel={editDocId ? () => { setFormDoc(VIDE_R); setEditDocId(null); setPdfFile(null); } : null} />
                            </form>
                        </div>

                        {/* Liste ressources par catégorie */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
                                <p className="text-sm font-medium text-slate-500">Chargement...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {CATEGORIES_RESSOURCES.map(cat => {
                                    const items = docs.filter(d => d.categorie === cat.id);
                                    return (
                                        <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                                                <FolderOpen className="w-5 h-5 text-amber-500" />
                                                <span className="font-bold text-sm text-[#0f213a]">{cat.label}</span>
                                                <span className="ml-auto text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2.5 py-0.5 rounded-full font-bold">{items.length}</span>
                                            </div>
                                            {items.length === 0
                                                ? <p className="px-6 py-6 text-sm text-slate-400 italic">Aucun fichier.</p>
                                                : <div className="divide-y divide-slate-50">
                                                    {items.map(f => (
                                                        <DocRow key={f.id} item={f} col="ressources"
                                                            onEdit={() => { setEditDocId(f.id); setFormDoc({ nom: f.nom, categorie: f.categorie, date: f.date || '', typeDoc: f.typeDoc || '' }); setPdfFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                                                    ))}
                                                </div>
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ════ MAQUETTES ════ */}
                {onglet === 'maquettes' && (
                    <>
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                            <h2 className="font-bold text-lg text-[#0f213a] mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center">
                                    {editMaqId ? <Pencil className="w-5 h-5 text-[#22c55e]" /> : <Plus className="w-5 h-5 text-[#22c55e]" />}
                                </span>
                                {editMaqId ? 'Modifier la maquette' : 'Ajouter une maquette'}
                            </h2>
                            <form onSubmit={handleSubmitMaq} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom *</label>
                                    <input type="text" value={formMaq.nom} onChange={e => setFormMaq({ ...formMaq, nom: e.target.value })}
                                        placeholder="Ex: Maquette Officielle IT 2026"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Filière *</label>
                                    <select value={formMaq.filiere} onChange={e => setFormMaq({ ...formMaq, filiere: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors">
                                        <option value="IT">Informatique & Télécommunications (IT)</option>
                                        <option value="HEC">Hautes Études Commerciales (HEC)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Édition / Année</label>
                                    <input type="text" value={formMaq.date} onChange={e => setFormMaq({ ...formMaq, date: e.target.value })}
                                        placeholder="Ex: Édition 2026"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <PdfField />
                                <ProgressBar />
                                <ActionBtns label={editMaqId ? 'Mettre à jour' : 'Ajouter'}
                                    onCancel={editMaqId ? () => { setFormMaq(VIDE_M); setEditMaqId(null); setPdfFile(null); } : null} />
                            </form>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['IT', 'HEC'].map(filiere => {
                                const items = maquettes.filter(m => m.filiere === filiere);
                                return (
                                    <div key={filiere} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                                        <div className={`px-6 py-4 border-b flex items-center gap-3 ${filiere === 'IT' ? 'bg-[#0f213a]' : 'bg-amber-600'}`}>
                                            <GraduationCap className="w-5 h-5 text-white/80" />
                                            <span className="font-bold text-sm text-white">Filière {filiere}</span>
                                            <span className="ml-auto text-[11px] text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full font-bold">{items.length}</span>
                                        </div>
                                        {items.length === 0
                                            ? <p className="px-6 py-6 text-sm text-slate-400 italic">Aucune maquette.</p>
                                            : <div className="divide-y divide-slate-50">
                                                {items.map(m => (
                                                    <DocRow key={m.id} item={m} col="maquettes"
                                                        onEdit={() => { setEditMaqId(m.id); setFormMaq({ filiere: m.filiere, nom: m.nom, date: m.date || '' }); setPdfFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                                                ))}
                                            </div>
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ════ BIBLIOTHÈQUE ════ */}
                {onglet === 'bibliotheque' && (
                    <>
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                            <h2 className="font-bold text-lg text-[#0f213a] mb-2 flex items-center gap-3">
                                <span className="w-10 h-10 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center">
                                    {editBibId ? <Pencil className="w-5 h-5 text-[#22c55e]" /> : <Plus className="w-5 h-5 text-[#22c55e]" />}
                                </span>
                                {editBibId ? 'Modifier le document' : 'Ajouter à la bibliothèque'}
                            </h2>
                            <p className="text-sm text-slate-400 mb-6 ml-[52px]">Ces documents seront accessibles aux étudiants connectés.</p>
                            <form onSubmit={handleSubmitBiblio} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom du document *</label>
                                    <input type="text" value={formBiblio.nom} onChange={e => setFormBiblio({ ...formBiblio, nom: e.target.value })}
                                        placeholder="Ex: Cours Algorithmique L2 IT"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Catégorie *</label>
                                    <select value={formBiblio.categorie} onChange={e => setFormBiblio({ ...formBiblio, categorie: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors">
                                        {CATEGORIES_BIBLIO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Filière</label>
                                    <select value={formBiblio.filiere} onChange={e => setFormBiblio({ ...formBiblio, filiere: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors">
                                        {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Année / Semestre</label>
                                    <input type="text" value={formBiblio.date} onChange={e => setFormBiblio({ ...formBiblio, date: e.target.value })}
                                        placeholder="Ex: 2025-2026 · S1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors" />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description (optionnel)</label>
                                    <textarea value={formBiblio.description} onChange={e => setFormBiblio({ ...formBiblio, description: e.target.value })}
                                        placeholder="Brève description du contenu..."
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#22c55e] transition-colors resize-none" />
                                </div>
                                <PdfField />
                                <ProgressBar />
                                <ActionBtns label={editBibId ? 'Mettre à jour' : 'Ajouter à la bibliothèque'}
                                    onCancel={editBibId ? () => { setFormBiblio(VIDE_B); setEditBibId(null); setPdfFile(null); } : null} />
                            </form>
                        </div>

                        {/* Liste bibliothèque groupée par catégorie */}
                        <div className="space-y-6">
                            {CATEGORIES_BIBLIO.map(cat => {
                                const items = biblio.filter(b => b.categorie === cat.id);
                                if (items.length === 0) return null;
                                return (
                                    <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                                            <BookOpen className="w-5 h-5 text-[#0f213a]" />
                                            <span className="font-bold text-sm text-[#0f213a]">{cat.label}</span>
                                            <span className="ml-auto text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2.5 py-0.5 rounded-full font-bold">{items.length}</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {items.map(b => (
                                                <DocRow key={b.id} item={b} col="bibliotheque"
                                                    onEdit={() => { setEditBibId(b.id); setFormBiblio({ nom: b.nom, categorie: b.categorie, filiere: b.filiere || 'Commun', date: b.date || '', description: b.description || '' }); setPdfFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {biblio.length === 0 && (
                                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
                                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-500">Aucun document dans la bibliothèque.</p>
                                    <p className="text-xs text-slate-400 mt-1">Ajoutez-en un ci-dessus.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}