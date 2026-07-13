import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Folder, FolderOpen, FileText, Eye, Download, Search, X, Loader2, FileX, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES_RESSOURCES = [
    { id: 'reglement', label: 'Règlement Intérieur', icon: '📜', color: '#187840', desc: 'Charte éthique et règlements de fonctionnement du Club-MET.' },
    { id: 'rapports', label: 'Rapports Mensuels', icon: '📈', color: '#003058', desc: 'Suivi et comptes-rendus d\'activités mensuels des commissions.' },
    { id: 'comptes_rendus', label: 'Comptes Rendus', icon: '📝', color: '#7c3aed', desc: 'Rapports officiels des réunions et Assemblées Générales.' },
];

export default function Resources() {
    const [ressources, setRessources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState('');
    const [dossierActif, setDossierActif] = useState(null); // null = vue racine des dossiers, ou ID de catégorie

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchAll = async () => {
            const { data } = await supabase.from('ressources').select('*');
            
            if (active) {
                if (data) setRessources(data);
                setLoading(false);
            }
        };

        const init = async () => {
            await fetchAll();
            if (!active) return;

            const c1 = supabase.channel('resources-realtime-res')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, fetchAll)
                .subscribe();

            channels.push(c1);
        };

        init();
        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const tousLesDocuments = [...ressources];

    // Documents filtrés par recherche
    const documentsFiltrés = tousLesDocuments.filter(doc => {
        const matchesDossier = !dossierActif || doc.categorie === dossierActif;
        
        const term = recherche.toLowerCase();
        const matchesSearch = !recherche || 
            doc.nom?.toLowerCase().includes(term) ||
            doc.typeDoc?.toLowerCase().includes(term) ||
            doc.description?.toLowerCase().includes(term) ||
            doc.date?.toLowerCase().includes(term) ||
            (doc.filiere && doc.filiere.toLowerCase().includes(term));

        return matchesDossier && matchesSearch;
    });

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

    // Compte le nombre de fichiers par dossier
    const getFileCount = (catId) => {
        return tousLesDocuments.filter(doc => doc.categorie === catId).length;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] flex items-center gap-3">
                        <FolderOpen className="text-[#187840] w-8 h-8" /> Espace Ressources
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Accédez aux documents internes, rapports officiels, règlements et maquettes d'études du Club-MET.
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
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#C8C8C8] rounded-xl text-sm focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 shadow-sm transition-all font-medium text-slate-700"
                    />
                    {recherche && (
                        <button onClick={() => setRecherche('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8 text-[#187840]" />
                        <p className="text-xs text-slate-400">Chargement des ressources...</p>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Fil d'Ariane de navigation */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 bg-white py-2.5 px-4 rounded-xl border border-gray-200/50 shadow-sm">
                        <button 
                            onClick={() => setDossierActif(null)} 
                            className={`hover:text-[#187840] transition-colors ${!dossierActif ? 'text-[#003058] font-black' : ''}`}>
                            📁 Explorateur
                        </button>
                        {dossierActif && (
                            <>
                                <ChevronRight size={14} className="text-slate-300" />
                                <span className="text-[#003058] font-black">
                                    {CATEGORIES_RESSOURCES.find(c => c.id === dossierActif)?.label}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Vue Principale */}
                    {!dossierActif ? (
                        /* VUE DOSSIERS (Vue Racine) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {CATEGORIES_RESSOURCES.map(dossier => {
                                const count = getFileCount(dossier.id);
                                return (
                                    <motion.div 
                                        key={dossier.id}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        onClick={() => setDossierActif(dossier.id)}
                                        className="bg-white border border-gray-200/60 hover:border-[#187840]/30 rounded-3xl p-6 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 text-left relative overflow-hidden group">
                                        
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
                                        
                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-3xl filter drop-shadow-sm select-none">{dossier.icon}</span>
                                                <span className="text-[10px] font-black text-white bg-[#003058] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    {count} fichier(s)
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-sm text-[#003058] mb-2 group-hover:text-[#187840] transition-colors">
                                                    {dossier.label}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                    {dossier.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        /* VUE CONTENU DOSSIER */
                        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                <h3 className="text-xs font-black text-[#003058] uppercase tracking-wider">
                                    Contenu du dossier : {CATEGORIES_RESSOURCES.find(c => c.id === dossierActif)?.label}
                                </h3>
                                <button 
                                    onClick={() => setDossierActif(null)}
                                    className="bg-white text-xs font-bold text-slate-500 hover:text-[#003058] px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:scale-103">
                                    Retour aux dossiers
                                </button>
                            </div>

                            {documentsFiltrés.length === 0 ? (
                                <div className="text-center py-20">
                                    <FileX className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-400">Dossier vide</p>
                                    <p className="text-xs text-slate-300 mt-1">Aucun document n'est disponible dans ce dossier actuellement.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {documentsFiltrés.map(doc => (
                                        <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start gap-3.5 min-w-0">
                                                <div className="w-10 h-10 bg-[#F8F0F0] rounded-xl flex items-center justify-center shrink-0 border border-slate-100 mt-0.5">
                                                    <FileText size={20} className="text-[#003058]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-700 leading-snug truncate" title={doc.nom}>
                                                        {doc.nom}
                                                    </h4>
                                                    <div className="flex items-center gap-2 flex-wrap mt-1">
                                                        {doc.date && <span className="text-[10px] text-slate-400 font-semibold">📅 {doc.date}</span>}
                                                        {doc.typeDoc && <span className="text-[10px] text-slate-400 font-semibold">📄 {doc.typeDoc}</span>}
                                                        {doc.filiere && (
                                                            <span className="text-[9px] font-black text-[#d97706] bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                Filière {doc.filiere}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {doc.description && (
                                                        <p className="text-[11px] text-slate-400 italic mt-2">
                                                            "{doc.description}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                <button
                                                    onClick={() => ouvrirFichier(doc.url, doc.nom)}
                                                    disabled={!doc.url}
                                                    className="bg-[#003058] hover:bg-[#002850] disabled:opacity-40 text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold shadow-sm transition-colors flex items-center gap-1.5">
                                                    <Eye size={12} /> Consulter
                                                </button>
                                                <button
                                                    onClick={() => télécharger(doc.url, doc.nom)}
                                                    disabled={!doc.url}
                                                    className="bg-[#187840]/10 hover:bg-[#187840]/25 disabled:opacity-40 text-[#187840] border border-[#187840]/20 w-9 h-9 rounded-xl transition-colors flex items-center justify-center">
                                                    <Download size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
