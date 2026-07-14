// src/pages/admin/Medias.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Image as ImageIcon, Video } from 'lucide-react';

const extraireCheminStockage = (url, bucket) => {
    if (!url) return null;
    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    return idx === -1 ? null : url.slice(idx + marker.length);
};

export default function Medias() {
    const [medias, setMedias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    /* ── Champs du formulaire ── */
    const [type, setType] = useState('Photo');
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [existingUrl, setExistingUrl] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchMedias();
    }, []);

    const fetchMedias = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('medias')
            .select('*')
            .order('date_ajout', { ascending: false });
        if (!error) setMedias(data || []);
        setLoading(false);
    };

    const resetForm = () => {
        setType('Photo');
        setTitre('');
        setDescription('');
        setExistingUrl('');
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setEditingId(null);
    };

    const ouvrirAjout = () => {
        resetForm();
        setShowForm(true);
    };

    const ouvrirEdition = (m) => {
        setEditingId(m.id);
        setType(m.type || 'Photo');
        setTitre(m.titre || '');
        setDescription('');
        setExistingUrl(m.url || '');
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setShowForm(true);
    };

    const fermerFormulaire = () => {
        setShowForm(false);
        resetForm();
    };

    const onFileSelected = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (preview) URL.revokeObjectURL(preview);
        setFile(f);
        setPreview(URL.createObjectURL(f));
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titre.trim() || (!file && !existingUrl)) return;
        setSubmitting(true);
        try {
            let url = existingUrl;
            if (file) {
                const ext = file.name.split('.').pop();
                const chemin = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
                const filePath = `medias/${chemin}`;
                const { error: uploadError } = await supabase.storage.from('club-met-storage').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('club-met-storage').getPublicUrl(filePath);
                url = data.publicUrl;
            }
            const payload = { type, titre: titre.trim(), url };
            let error;
            if (editingId) {
                ({ error } = await supabase.from('medias').update(payload).eq('id', editingId));
            } else {
                ({ error } = await supabase.from('medias').insert([payload]));
            }
            if (error) throw error;
            await fetchMedias();
            fermerFormulaire();
        } catch (err) {
            console.error("Erreur lors de l'enregistrement du média :", err);
            alert("Une erreur est survenue lors de l'enregistrement : " + (err.message || JSON.stringify(err)));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (m) => {
        if (!window.confirm(`Supprimer définitivement le média « ${m.titre} » ?`)) return;
        try {
            const { error } = await supabase.from('medias').delete().eq('id', m.id);
            if (error) throw error;
            const chemin = extraireCheminStockage(m.url, 'club-met-storage');
            if (chemin) await supabase.storage.from('club-met-storage').remove([chemin]);
            setMedias(prev => prev.filter(x => x.id !== m.id));
        } catch (err) {
            console.error('Erreur lors de la suppression :', err);
            alert('Impossible de supprimer ce média.');
        }
    };

    return (
        <div className="anim-fade-up p-6 md:p-10">
            {/* ── En-tête ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0a1628]">Galerie Médias</h1>
                    <p className="text-sm text-slate-400 mt-1">Gérez les photos et vidéos affichées dans la galerie du site.</p>
                </div>
                {!showForm && (
                    <button onClick={ouvrirAjout}
                        className="flex items-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors">
                        <Plus size={16} /> Ajouter un média
                    </button>
                )}
            </div>

            {/* ── Formulaire (style document) ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8">
                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-black text-[#0a1628]">
                                    {editingId ? 'Modifier le média' : 'Nouveau média'}
                                </h2>
                                <button onClick={fermerFormulaire}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Type de média
                                    </label>
                                    <div className="flex gap-2">
                                        {['Photo', 'Vidéo'].map(t => (
                                            <button key={t} type="button" onClick={() => setType(t)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${type === t ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-sm' : 'bg-[#F8F0F0] text-slate-500 border-[#C8C8C8]/60 hover:border-[#16a34a] hover:text-[#16a34a]'}`}>
                                                {t === 'Photo' ? '🖼️ Photo' : '🎬 Vidéo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Titre
                                    </label>
                                    <input type="text" required value={titre} onChange={e => setTitre(e.target.value)}
                                        placeholder="Ex: Hackathon 2026 - Finale"
                                        className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all font-semibold" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Fichier {type === 'Photo' ? '(image)' : '(vidéo)'}
                                    </label>
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#C8C8C8] rounded-2xl py-8 px-4 text-center cursor-pointer hover:border-[#16a34a] hover:bg-[#16a34a]/5 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-500">
                                            Cliquez pour {existingUrl || preview ? 'remplacer' : 'choisir'} un fichier
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {type === 'Photo' ? 'PNG, JPG, WEBP' : 'MP4, WEBM'}
                                        </p>
                                        <input ref={fileInputRef} type="file" accept={type === 'Photo' ? 'image/*' : 'video/*'} hidden onChange={onFileSelected} />
                                    </div>

                                    {(preview || existingUrl) && (
                                        <div className="mt-4 w-40 aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-slate-100">
                                            {type === 'Photo' ? (
                                                <img src={preview || existingUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={preview || existingUrl} className="w-full h-full object-cover" muted controls preload="metadata" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" disabled={submitting}
                                        className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50">
                                        {submitting
                                            ? <><Loader2 className="animate-spin w-4 h-4" /> Enregistrement...</>
                                            : (editingId ? 'Enregistrer les modifications' : 'Publier le média')}
                                    </button>
                                    <button type="button" onClick={fermerFormulaire}
                                        className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Liste des médias ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6 mr-2" /> Chargement...
                </div>
            ) : medias.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl text-sm text-slate-400">
                    Aucun média enregistré pour le moment. Cliquez sur « Ajouter un média » pour publier le premier.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {medias.map(m => (
                        <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col justify-between">
                            <div>
                                <div className="aspect-[4/3] bg-slate-100 relative">
                                    {m.type === 'Vidéo' ? (
                                        <video src={m.url} className="w-full h-full object-cover" muted preload="metadata" />
                                    ) : (
                                        <img src={m.url} alt={m.titre} className="w-full h-full object-cover" />
                                    )}
                                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#0a1628] text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                                        {m.type === 'Vidéo' ? <Video size={10} /> : <ImageIcon size={10} />} {m.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 flex items-center justify-between gap-2 border-t border-slate-50 bg-slate-50/20">
                                <h4 className="text-xs font-extrabold text-[#0a1628] truncate flex-grow" title={m.titre}>{m.titre}</h4>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => ouvrirEdition(m)}
                                        className="w-7 h-7 bg-white border border-[#C8C8C8]/60 hover:border-[#16a34a] hover:text-[#16a34a] text-slate-500 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                        title="Modifier">
                                        <Pencil size={12} />
                                    </button>
                                    <button onClick={() => handleDelete(m)}
                                        className="w-7 h-7 bg-white border border-[#C8C8C8]/60 hover:border-red-500 hover:text-red-500 text-slate-500 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                        title="Supprimer">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}