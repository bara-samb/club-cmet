import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { FolderOpen, Search, Eye, Download, FileText, Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'Tous les documents' },
    { id: 'maquette', label: 'Maquettes de Filière' },
    { id: 'reglement', label: 'Règlements Intérieurs' },
    { id: 'rapports', label: 'Rapports d\'Activité' },
    { id: 'comptes_rendus', label: 'Comptes Rendus ' }
];

export default function Resources() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [catActive, setCatActive] = useState('all');

    useEffect(() => {
        let active = true;
        let c1, c2;

        const fetchDocs = async () => {
            try {
                const [docsData, maqData] = await Promise.all([
                    supabase.from('ressources').select('*').order('createdAt', { ascending: false }),
                    supabase.from('maquettes').select('*')
                ]);

                if (docsData.error) throw docsData.error;
                if (maqData.error) throw maqData.error;

                if (active) {
                    const parsedDocs = docsData.data || [];
                    const parsedMaquettes = (maqData.data || []).map(m => ({
                        ...m,
                        categorie: 'maquette',
                        createdAt: m.created_at || new Date(0).toISOString()
                    }));

                    const merged = [...parsedDocs, ...parsedMaquettes].sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });

                    setDocs(merged);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur chargement documents:", err);
                if (active) {
                    setError("Impossible de charger les documents.");
                    setLoading(false);
                }
            }
        };

        fetchDocs();

        c1 = supabase.channel('student-resources-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, fetchDocs)
            .subscribe();

        c2 = supabase.channel('student-resources-maq-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, fetchDocs)
            .subscribe();

        return () => {
            active = false;
            if (c1) supabase.removeChannel(c1);
            if (c2) supabase.removeChannel(c2);
        };
    }, []);

    const filtrés = docs.filter(doc => {
        const matchRecherche = doc.nom.toLowerCase().includes(recherche.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(recherche.toLowerCase()));
        const matchCat = catActive === 'all' || doc.categorie === catActive;
        return matchRecherche && matchCat;
    });

    const badgeLabel = (cat) => {
        if (cat === 'maquette') return 'Maquette';
        if (cat === 'reglement') return 'Règlement';
        if (cat === 'rapports') return 'Rapport';
        if (cat === 'comptes_rendus') return 'CR AG';
        return cat;
    };

    const badgeColor = (cat) => {
        if (cat === 'maquette') return 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
        if (cat === 'reglement') return 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
        if (cat === 'rapports') return 'text-[#187840] bg-[#187840]/10 border-[#187840]/20';
        if (cat === 'comptes_rendus') return 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
        return 'text-slate-500 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
    };

    const ouvrirFichier = (url) => {
        if (url) window.open(url, '_blank');
    };

    const télécharger = (url, name) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="anim-fade-up p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#003058] dark:text-white flex items-center gap-3">
                        <FolderOpen className="text-[#187840] w-8 h-8" /> Documents Officiels
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Consultez les règlements officiels, rapports d'activité et comptes rendus d'assemblée générale.
                    </p>
                </div>

                {/* Recherche */}
                <div className="relative w-full md:w-80 shrink-0">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        placeholder="Rechercher un document..."
                        className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-ucak-dark-card border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 shadow-sm transition-all font-medium text-slate-800 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Catégories de filtres */}
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCatActive(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${catActive === cat.id ? 'bg-[#003058] text-white border-[#003058] shadow-md shadow-[#003058]/15' : 'bg-white dark:bg-ucak-dark-card text-slate-500 border-slate-200/80 dark:border-white/10 hover:border-slate-300'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Contenu */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement des documents...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-6 text-center text-red-600 dark:text-red-300">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500 dark:text-red-300" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            ) : filtrés.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-ucak-dark-card rounded-2xl border border-slate-100 dark:border-white/10 border-dashed">
                    <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">Aucun document ne correspond à vos critères.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtrés.map(doc => (
                        <div key={doc.id} className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[#f1f5f9] dark:bg-ucak-dark rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/10">
                                        <FileText size={20} className="text-[#003058] dark:text-white" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-xs font-bold text-[#003058] dark:text-white leading-tight mb-1.5 line-clamp-2" title={doc.nom}>
                                            {doc.nom}
                                        </h3>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor(doc.categorie)}`}>
                                            {badgeLabel(doc.categorie)}
                                        </span>
                                    </div>
                                </div>
                                {doc.description && (
                                    <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 italic font-medium">
                                        "{doc.description}"
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
                                <button
                                    onClick={() => ouvrirFichier(doc.url)}
                                    disabled={!doc.url}
                                    className="flex-grow flex items-center justify-center gap-1.5 bg-[#003058] hover:bg-[#002850] disabled:opacity-40 text-white py-2 rounded-lg text-[10px] font-extrabold transition-colors shadow-sm"
                                >
                                    <Eye size={12} /> Consulter
                                </button>
                                <button
                                    onClick={() => télécharger(doc.url, doc.nom)}
                                    disabled={!doc.url}
                                    className="flex items-center justify-center gap-1.5 bg-[#187840]/10 hover:bg-[#187840]/25 disabled:opacity-40 text-[#187840] border border-[#187840]/20 w-9 h-9 rounded-lg transition-colors"
                                >
                                    <Download size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
