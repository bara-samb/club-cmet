import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Search, X, Loader2, FileX, FileText, Eye, Download, BookOpen, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'all',           label: 'Toutes les catégories' },
    { id: 'cours',         label: 'Cours & Supports' },
    { id: 'td',            label: 'TD & Exercices' },
    { id: 'examens',       label: 'Examens & Corrigés' },
    { id: 'projets',       label: 'Projets & Mémoires' },
    { id: 'autres',        label: 'Autres documents' },
];

const NIVEAUX = [
    'Tous', 
    'L1IT',
    'L1HEC',
    'L2IT',
    'L2HEC',
    'L3', 
    'L3IT - DAR', 
    'L3IT - ASR', 
    'L3IT - RT', 
    'L3HEC - Entrepreneuriat & Création d\'Entreprise', 
    'L3HEC - Comptabilité & Gestion', 
    'M1', 
    'M2'
];

const LEVELS_ORDER = [
    { id: 'L1IT', label: 'L1IT - Technologies de l\'Information', color: '#187840' },
    { id: 'L1HEC', label: 'L1HEC - Hautes Études Commerciales', color: '#187840' },
    { id: 'L2IT', label: 'L2IT - Technologies de l\'Information', color: '#187840' },
    { id: 'L2HEC', label: 'L2HEC - Hautes Études Commerciales', color: '#187840' },
    { id: 'L3', label: 'Licence 3 (Général)', color: '#187840' },
    { id: 'L3IT - DAR', label: 'L3IT - Développement d\'Applications Réseaux (DAR)', color: '#187840' },
    { id: 'L3IT - ASR', label: 'L3IT - Administration Systèmes & Réseaux (ASR)', color: '#187840' },
    { id: 'L3IT - RT', label: 'L3IT - Réseaux & Télécoms (RT)', color: '#187840' },
    { id: 'L3HEC - Entrepreneuriat & Création d\'Entreprise', label: 'L3HEC - Entrepreneuriat & Création d\'Entreprise', color: '#187840' },
    { id: 'L3HEC - Comptabilité & Gestion', label: 'L3HEC - Comptabilité & Gestion', color: '#187840' },
    { id: 'M1', label: 'Master 1', color: '#003058' },
    { id: 'M2', label: 'Master 2', color: '#003058' },
];

export default function Library() {
    const [bibliotheque, setBibliotheque] = useState([]);
    const [filtreCat,  setFiltreCat]  = useState('all');
    const [filtreNiveau, setFiltreNiveau] = useState('Tous');
    const [recherche,  setRecherche]  = useState('');
    const [loading,    setLoading]    = useState(true);
    
    // Niveaux dépliés par défaut
    const [expandedLevels, setExpandedLevels] = useState({
        L1IT: true, L1HEC: true, L2IT: true, L2HEC: true, L3: true,
        'L3IT - DAR': true, 'L3IT - ASR': true, 'L3IT - RT': true,
        'L3HEC - Entrepreneuriat & Création d\'Entreprise': true,
        'L3HEC - Comptabilité & Gestion': true,
        M1: true, M2: true
    });

    useEffect(() => {
        let active = true;
        let c1;

        const fetchAll = async () => {
            const { data, error } = await supabase.from('bibliotheque').select('*');
            if (error) {
                console.error("Erreur bibliothèque:", error);
                return;
            }
            if (active) {
                setBibliotheque(data || []);
                setLoading(false);
            }
        };

        fetchAll();

        c1 = supabase.channel('library-realtime-bib')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bibliotheque' }, fetchAll)
            .subscribe();

        return () => {
            active = false;
            if (c1) supabase.removeChannel(c1);
        };
    }, []);

    const toggleLevelExpand = (lvlId) => {
        setExpandedLevels(prev => ({ ...prev, [lvlId]: !prev[lvlId] }));
    };

    // Filtrage des documents
    const documentsFiltrés = bibliotheque.filter(doc => {
        // Filtre Catégorie
        const matchCat = filtreCat === 'all' || doc.categorie === filtreCat;
        
        // Filtre Niveau
        const docNiveau = doc.niveau || 'Commun';
        const matchNiv = filtreNiveau === 'Tous' || docNiveau === filtreNiveau;
        
        // Recherche textuelle
        const term = recherche.toLowerCase();
        const matchRecherche = !recherche || 
            doc.nom?.toLowerCase().includes(term) ||
            doc.typeDoc?.toLowerCase().includes(term) ||
            doc.description?.toLowerCase().includes(term);
            
        return matchCat && matchNiv && matchRecherche;
    });

    // Groupement par niveau
    const levelsGrouped = LEVELS_ORDER.map(level => {
        const docs = documentsFiltrés.filter(d => (d.niveau || 'Commun') === level.id);
        return { ...level, docs };
    }).filter(group => group.docs.length > 0 || (filtreNiveau !== 'Tous' && group.id === filtreNiveau));

    const ouvrirFichier = (url, nom) => {
        if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const télécharger = (url, nom) => {
        if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
        const a = document.createElement('a');
        a.href = url;
        a.download = nom;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const badgeColor = (cat) => {
        const colors = {
            cours:         'bg-blue-50 text-blue-700 border-blue-200',
            td:            'bg-orange-50 text-orange-700 border-orange-200',
            examens:       'bg-red-50 text-red-700 border-red-200',
            projets:       'bg-indigo-50 text-indigo-700 border-indigo-200',
            maquette:      'bg-amber-50 text-amber-700 border-amber-200',
            autres:        'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10',
        };
        return colors[cat] || 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10';
    };

    const badgeLabel = (cat) => {
        const labels = {
            cours:         'Cours',
            td:            'TD & Exercice',
            examens:       'Examen & Corrigé',
            projets:       'Projet & Mémoire',
            maquette:      'Maquette de Filière',
            autres:        'Autre',
        };
        return labels[cat] || cat;
    };

    return (
        <div className="anim-fade-up p-6 max-w-6xl mx-auto">
            {/* Titre */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-[#003058] dark:text-white flex items-center gap-3">
                    <BookOpen className="text-[#187840] w-8 h-8" /> Bibliothèque Académique
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Retrouvez vos cours, TD et examens classés par niveau pour vos filières.
                </p>
            </div>

            {/* Filters Row */}
            <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-8">
                {/* Search Bar */}
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        placeholder="Rechercher un document..."
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#187840] focus:ring-1 focus:ring-[#187840] font-medium transition-all"
                    />
                    {recherche && (
                        <button onClick={() => setRecherche('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Catégories Filter */}
                <div className="w-full md:w-56 relative">
                    <select
                        value={filtreCat}
                        onChange={e => setFiltreCat(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#187840] appearance-none cursor-pointer"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>

                {/* Niveau Filter */}
                <div className="w-full md:w-64 relative">
                    <select
                        value={filtreNiveau}
                        onChange={e => setFiltreNiveau(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#187840] appearance-none cursor-pointer"
                    >
                        <option value="Tous">Tous les niveaux</option>
                        {LEVELS_ORDER.map(level => (
                            <option key={level.id} value={level.id}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Résultats */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8 text-[#187840]" />
                        <p className="text-xs text-slate-400">Chargement de la bibliothèque...</p>
                    </div>
                </div>
            ) : documentsFiltrés.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-ucak-dark-card rounded-3xl border border-gray-200/60 dark:border-white/10 shadow-sm">
                    <FileX className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-base font-bold text-slate-400">Aucun document trouvé</p>
                    <p className="text-sm text-slate-300 mt-2">Aucun cours ne correspond à ces critères de recherche.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {levelsGrouped.map(group => (
                        <div key={group.id} className="bg-white/40 rounded-3xl border border-gray-200/50 dark:border-white/10 overflow-hidden shadow-sm">
                            
                            {/* En-tête du niveau */}
                            <button 
                                onClick={() => toggleLevelExpand(group.id)}
                                className="w-full bg-white dark:bg-ucak-dark-card px-6 py-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-6 rounded-full" style={{ backgroundColor: group.color }} />
                                    <h2 className="text-sm font-extrabold text-[#003058] dark:text-white tracking-wide uppercase">{group.label} ({group.docs.length})</h2>
                                </div>
                                <span className="text-slate-400 p-1">
                                    {expandedLevels[group.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </span>
                            </button>

                            {/* Contenu (cartes des documents) */}
                            <AnimatePresence initial={false}>
                                {expandedLevels[group.id] && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden bg-[#f1f5f9] dark:bg-ucak-dark/20">
                                        
                                        {group.docs.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-400 italic">
                                                Aucun document disponible pour ce niveau avec les filtres actuels.
                                            </div>
                                        ) : (
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {group.docs.map(doc => (
                                                    <div key={doc.id}
                                                         className="bg-white dark:bg-ucak-dark-card border border-[#e2e8f0]/40 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#187840]/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <div className="w-10 h-10 bg-[#f1f5f9] dark:bg-ucak-dark rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/10">
                                                                    <FileText size={20} className="text-[#003058] dark:text-white" />
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <h3 className="text-xs font-bold text-[#003058] dark:text-white leading-tight mb-1.5 line-clamp-2" title={doc.nom}>
                                                                        {doc.nom}
                                                                    </h3>
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor(doc.categorie)}`}>
                                                                            {badgeLabel(doc.categorie)}
                                                                        </span>
                                                                        {doc.filiere && (
                                                                            <span className="text-[9px] font-black text-[#187840] bg-[#187840]/10 border border-[#187840]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                                {doc.filiere}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Infos complémentaires */}
                                                            <div className="flex gap-2 flex-wrap mb-4 pl-1 border-l-2 border-[#187840]/30 text-[10px] text-slate-400 font-semibold">
                                                                {doc.date && <span>{doc.date}</span>}
                                                                {doc.typeDoc && <span>{doc.typeDoc}</span>}
                                                            </div>

                                                            {doc.description && (
                                                                <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 italic font-medium">
                                                                    "{doc.description}"
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                                                            <button
                                                                onClick={() => ouvrirFichier(doc.url, doc.nom)}
                                                                disabled={!doc.url}
                                                                className="flex-1 flex items-center justify-center gap-1.5 bg-[#003058] hover:bg-[#002850] disabled:opacity-40 text-white py-2 rounded-lg text-[10px] font-extrabold transition-colors shadow-sm">
                                                                <Eye size={12} />
                                                                Consulter
                                                            </button>
                                                            <button
                                                                onClick={() => télécharger(doc.url, doc.nom)}
                                                                disabled={!doc.url}
                                                                className="flex items-center justify-center gap-1.5 bg-[#187840]/10 hover:bg-[#187840]/25 disabled:opacity-40 text-[#187840] border border-[#187840]/20 w-9 h-9 rounded-lg transition-colors">
                                                                <Download size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}