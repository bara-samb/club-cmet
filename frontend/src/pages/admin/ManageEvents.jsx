// src/pages/admin/Evenements.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2, X, Upload, Loader2, ImageOff } from 'lucide-react';

/* ── Types d'activités gérés par le club ── */
const TYPES_EVENEMENT = [
    'Génie en Herbe',
    'Journée d\'Intégration',
    'Accueil Nouveaux Étudiants',
    'Action Sociale',
    'Action Communautaire',
    'Tutorat',
    'Autre',
];

/* ── Helpers ── */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const extraireCheminStockage = (url, bucket) => {
    if (!url) return null;
    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    return idx === -1 ? null : url.slice(idx + marker.length);
};

export default function Evenements() {
    const [evenements, setEvenements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    /* ── Champs du formulaire ── */
    const [titre, setTitre] = useState('');
    const [type, setType] = useState(TYPES_EVENEMENT[0]);
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    const [existingImages, setExistingImages] = useState([]); // URLs déjà en ligne
    const [newFiles, setNewFiles] = useState([]);              // Fichiers à téléverser
    const [previews, setPreviews] = useState([]);              // Aperçus locaux des nouveaux fichiers

    useEffect(() => {
        fetchEvenements();
        return () => previews.forEach(p => URL.revokeObjectURL(p));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEvenements = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('activites')
            .select('*')
            .order('date', { ascending: true });
        if (!error && data) {
            const parsed = data.map(ev => {
                let descText = ev.description || '';
                let imgs = [];

                // Priorité : lire depuis la colonne `img`
                if (ev.img) {
                    try {
                        imgs = JSON.parse(ev.img);
                    } catch (e) {
                        // Si ce n'est pas du JSON, traiter comme URL unique
                        imgs = [ev.img];
                    }
                }

                // Fallback : ancien format ||IMAGES|| dans description (migration)
                if (imgs.length === 0 && descText.includes("||IMAGES||")) {
                    const parts = descText.split("||IMAGES||");
                    descText = parts[0];
                    try {
                        imgs = JSON.parse(parts[1]);
                    } catch (e) {
                        imgs = [];
                    }
                }

                return {
                    ...ev,
                    descriptionText: descText,
                    images: imgs
                };
            });
            setEvenements(parsed);
        } else {
            setEvenements([]);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setTitre('');
        setType(TYPES_EVENEMENT[0]);
        setDate('');
        setDescription('');

        setExistingImages([]);
        previews.forEach(p => URL.revokeObjectURL(p));
        setNewFiles([]);
        setPreviews([]);
        setEditingId(null);
    };

    const ouvrirAjout = () => {
        resetForm();
        setShowForm(true);
    };

    const ouvrirEdition = (ev) => {
        setEditingId(ev.id);
        setTitre(ev.titre || '');
        setType(ev.type || TYPES_EVENEMENT[0]);
        setDate(ev.date || '');
        setDescription(ev.descriptionText || ev.description || '');

        setExistingImages(ev.images || []);
        previews.forEach(p => URL.revokeObjectURL(p));
        setNewFiles([]);
        setPreviews([]);
        setShowForm(true);
    };

    const fermerFormulaire = () => {
        setShowForm(false);
        resetForm();
    };

    const onFilesSelected = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setNewFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        e.target.value = '';
    };

    const retirerImageExistante = (url) => {
        setExistingImages(prev => prev.filter(u => u !== url));
    };

    const retirerNouveauFichier = (index) => {
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const televerserImages = async () => {
        const urls = [];
        for (const file of newFiles) {
            const ext = file.name.split('.').pop();
            const chemin = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const filePath = `evenements/${chemin}`;
            const { error } = await supabase.storage.from('club-met-storage').upload(filePath, file);
            if (error) throw error;
            const { data } = supabase.storage.from('club-met-storage').getPublicUrl(filePath);
            urls.push(data.publicUrl);
        }
        return urls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titre.trim() || !date || !type) return;
        setSubmitting(true);
        try {
            const urlsTeleversees = await televerserImages();
            const images = [...existingImages, ...urlsTeleversees];
            const payload = {
                titre: titre.trim(),
                type,
                date: date,
                description: description.trim(),
                img: images.length > 0 ? JSON.stringify(images) : null,
            };
            let error;
            if (editingId) {
                ({ error } = await supabase.from('activites').update(payload).eq('id', editingId));
            } else {
                ({ error } = await supabase.from('activites').insert([payload]));
            }
            if (error) throw error;
            await fetchEvenements();
            fermerFormulaire();
        } catch (err) {
            console.error("Erreur lors de l'enregistrement de l'activité :", err);
            alert("Une erreur est survenue lors de l'enregistrement : " + (err.message || JSON.stringify(err)));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ev) => {
        if (!window.confirm(`Supprimer définitivement l'événement « ${ev.titre} » ?`)) return;
        try {
            const { error } = await supabase.from('activites').delete().eq('id', ev.id);
            if (error) throw error;
            const chemins = (ev.images || []).map(u => extraireCheminStockage(u, 'club-met-storage')).filter(Boolean);
            if (chemins.length > 0) await supabase.storage.from('club-met-storage').remove(chemins);
            setEvenements(prev => prev.filter(e => e.id !== ev.id));
        } catch (err) {
            console.error('Erreur lors de la suppression :', err);
            alert("Impossible de supprimer cet événement.");
        }
    };

    return (
        <div className="anim-fade-up p-6 md:p-10">
            {/* ── En-tête ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0a1628]">Événements & Activités</h1>
                    <p className="text-sm text-slate-400 mt-1">Gérez les activités affichées sur le site public.</p>
                </div>
                {!showForm && (
                    <button onClick={ouvrirAjout}
                        className="flex items-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors">
                        <Plus size={16} /> Ajouter un événement
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
                                    {editingId ? "Modifier l'événement" : 'Nouvel événement'}
                                </h2>
                                <button onClick={fermerFormulaire}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Titre de l'événement
                                        </label>
                                        <input type="text" required value={titre} onChange={e => setTitre(e.target.value)}
                                            placeholder="Ex: Hackathon UCAK 2026"
                                            className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Type d'activité
                                        </label>
                                        <select value={type} onChange={e => setType(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all font-semibold">
                                            {TYPES_EVENEMENT.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Date de l'événement
                                    </label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all font-semibold" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Description
                                    </label>
                                    <textarea rows={4} required value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="Décrivez l'activité, son contenu et ses objectifs..."
                                        className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all font-semibold resize-none" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Images de l'événement
                                    </label>
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#C8C8C8] rounded-2xl py-8 px-4 text-center cursor-pointer hover:border-[#16a34a] hover:bg-[#16a34a]/5 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-500">Cliquez pour ajouter des images</p>
                                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG — plusieurs fichiers possibles</p>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onFilesSelected} />
                                    </div>

                                    {(existingImages.length > 0 || previews.length > 0) && (
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            {existingImages.map((url) => (
                                                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => retirerImageExistante(url)}
                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {previews.map((src, i) => (
                                                <div key={src} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#16a34a]/40 group">
                                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                                    <span className="absolute bottom-1 left-1 bg-[#16a34a] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">Nouveau</span>
                                                    <button type="button" onClick={() => retirerNouveauFichier(i)}
                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" disabled={submitting}
                                        className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50">
                                        {submitting
                                            ? <><Loader2 className="animate-spin w-4 h-4" /> Enregistrement...</>
                                            : (editingId ? 'Enregistrer les modifications' : "Publier l'événement")}
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

            {/* ── Liste des événements ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6 mr-2" /> Chargement...
                </div>
            ) : evenements.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl text-sm text-slate-400">
                    Aucun événement enregistré pour le moment. Cliquez sur « Ajouter un événement » pour publier le premier.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evenements.map(ev => (
                        <div key={ev.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                            <div className="h-40 bg-slate-100 relative">
                                {ev.images?.[0] ? (
                                    <img src={ev.images[0]} alt={ev.titre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageOff className="w-8 h-8" />
                                    </div>
                                )}
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0a1628] text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                    {ev.type}
                                </span>
                                {ev.images?.length > 1 && (
                                    <span className="absolute top-3 right-3 bg-black/50 text-white text-[9px] font-bold px-2 py-1 rounded-full">
                                        +{ev.images.length - 1}
                                    </span>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-[10px] font-extrabold text-[#16a34a] mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <Calendar size={12} /> {formatDate(ev.date)}
                                </div>
                                <h3 className="text-sm font-extrabold text-[#0a1628] mb-2">{ev.titre}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{ev.descriptionText}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => ouvrirEdition(ev)}
                                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(ev)}
                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}