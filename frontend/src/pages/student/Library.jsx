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
    { id: 'maquette',      label: 'Maquettes de Filière' },
    { id: 'autres',        label: 'Autres documents' },
];

const NIVEAUX = ['Tous', 'L1', 'L2', 'L3', 'M1', 'M2', 'Commun'];

const LEVELS_ORDER = [
    { id: 'Commun', label: 'Tronc Commun & Général', color: '#003058' },
    { id: 'L1', label: 'Licence 1', color: '#187840' },
    { id: 'L2', label: 'Licence 2', color: '#187840' },
    { id: 'L3', label: 'Licence 3', color: '#187840' },
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
        Commun: true, L1: true, L2: true, L3: true, M1: true, M2: true
    });

    useEffect(() => {
        let active = true;
        let c1, c2;

        const fetchAll = async () => {
            const [bibData, maqData] = await Promise.all([
                supabase.from('bibliotheque').select('*'),
                supabase.from('maquettes').select('*')
            ]);
            if (active) {
                const bibList = bibData.data || [];
                const maqList = (maqData.data || []).map(m => ({
                    ...m,
                    categorie: 'maquette',
                    niveau: 'Commun'
                }));
                setBibliotheque([...bibList, ...maqList]);
                setLoading(false);
            }
        };

        fetchAll();

        c1 = supabase.channel('library-realtime-bib')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bibliotheque' }, fetchAll)
            .subscribe();

        c2 = supabase.channel('library-realtime-maq')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, fetchAll)
            .subscribe();

        return () => {
            active = false;
            if (c1) supabase.removeChannel(c1);
            if (c2) supabase.removeChannel(c2);
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
            autres:        'bg-slate-50 text-slate-700 border-slate-200',
        };
        return colors[cat] || 'bg-slate-50 text-slate-700 border-slate-200';
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
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Titre */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] flex items-center gap-3">
                        <BookOpen className="text-[#187840] w-8 h-8" /> Bibliothèque Académique
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Retrouvez vos cours, TD et examens classés par niveau pour vos filières.
                    </p>
                </div>
                
                {/* Barre de recherche */}
                <div className="relative w-full md:w-96 shrink-0">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        placeholder="Rechercher un document..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#C8C8C8] rounded-xl text-sm focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 shadow-sm transition-all font-medium"
                    />
                    {recherche && (
                        <button onClick={() => setRecherche('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Barre de Filtres */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm mb-8 space-y-4">
                <div className="flex items-center gap-2 text-[#003058] font-bold text-sm mb-1">
                    <Filter size={16} className="text-[#187840]" /> Filtrer la bibliothèque
                </div>
                
                {/* Ligne Niveau */}
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 w-20">Niveau :</span>
                    <div className="flex gap-2 flex-wrap">
                        {NIVEAUX.map(niv => (
                            <button key={niv} onClick={() => setFiltreNiveau(niv)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all
                                ${filtreNiveau === niv
                                    ? 'bg-[#187840] text-white border-[#187840] shadow-sm'
                                    : 'bg-[#F8F0F0] text-slate-600 border-[#C8C8C8]/50 hover:border-[#187840] hover:text-[#187840]'
                                }`}>
                                {niv === 'Tous' ? 'Tous les niveaux' : niv}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ligne Catégorie */}
                <div className="flex items-start gap-4 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 w-20 pt-2">Catégorie :</span>
                    <div className="flex gap-2 flex-wrap flex-1">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setFiltreCat(cat.id)}
                                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all
                                ${filtreCat === cat.id
                                        ? 'bg-[#003058] text-white border-[#003058] shadow-sm'
                                        : 'bg-[#F8F0F0] text-slate-600 border-[#C8C8C8]/50 hover:border-[#003058] hover:text-[#003058]'
                                    }`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
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
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm">
                    <FileX className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-base font-bold text-slate-400">Aucun document trouvé</p>
                    <p className="text-sm text-slate-300 mt-2">Aucun cours ne correspond à ces critères de recherche.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {levelsGrouped.map(group => (
                        <div key={group.id} className="bg-white/40 rounded-3xl border border-gray-200/50 overflow-hidden shadow-sm">
                            
                            {/* En-tête du niveau */}
                            <button 
                                onClick={() => toggleLevelExpand(group.id)}
                                className="w-full bg-white px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-6 rounded-full" style={{ backgroundColor: group.color }} />
                                    <h2 className="text-sm font-extrabold text-[#003058] tracking-wide uppercase">{group.label} ({group.docs.length})</h2>
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
                                        className="overflow-hidden bg-[#F8F0F0]/20">
                                        
                                        {group.docs.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-400 italic">
                                                Aucun document disponible pour ce niveau avec les filtres actuels.
                                            </div>
                                        ) : (
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {group.docs.map(doc => (
                                                    <div key={doc.id}
                                                         className="bg-white border border-[#C8C8C8]/40 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#187840]/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start gap-3 mb-3">
                                                                <div className="w-10 h-10 bg-[#F8F0F0] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                                                    <FileText size={20} className="text-[#003058]" />
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <h3 className="text-xs font-bold text-[#003058] leading-tight mb-1.5 line-clamp-2" title={doc.nom}>
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
                                                                {doc.date && <span>📅 {doc.date}</span>}
                                                                {doc.typeDoc && <span>📄 {doc.typeDoc}</span>}
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