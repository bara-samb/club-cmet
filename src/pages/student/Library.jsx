import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Search, X, Loader2, FileX, FileText, Eye, Download } from 'lucide-react';

const CATEGORIES = [
    { id: 'all',           label: 'Tous' },
    { id: 'reglement',     label: 'Règlement Intérieur' },
    { id: 'rapports',      label: 'Rapports Mensuels' },
    { id: 'comptes_rendus',label: 'Comptes Rendus' },
    { id: 'maquette',      label: 'Maquettes' },
];

export default function Library() {
    const [ressources, setRessources] = useState([]);
    const [maquettes,  setMaquettes]  = useState([]);
    const [filtre,     setFiltre]     = useState('all');
    const [recherche,  setRecherche]  = useState('');
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchRessources = async () => {
            const { data } = await supabase.from('ressources').select('*');
            if (data && active) {
                setRessources(data.map(d => ({ ...d, _source: 'ressources' })));
            }
            if (active) setLoading(false);
        };

        const fetchMaquettes = async () => {
            const { data } = await supabase.from('maquettes').select('*');
            if (data && active) {
                setMaquettes(data.map(d => ({ ...d, categorie: 'maquette', _source: 'maquettes' })));
            }
        };

        const init = async () => {
            await Promise.all([fetchRessources(), fetchMaquettes()]);

            if (!active) return;

            const c1 = supabase.channel('ressources-library')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, () => { fetchRessources(); })
                .subscribe();
            const c2 = supabase.channel('maquettes-library')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, () => { fetchMaquettes(); })
                .subscribe();

            channels.push(c1, c2);
        };

        init();

        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    // Tous les documents fusionnés
    const tousLesDocuments = [...ressources, ...maquettes];

    // Filtrage
    const documentsFiltrés = tousLesDocuments.filter(doc => {
        const matchCat     = filtre === 'all' || doc.categorie === filtre;
        const matchRecherche = doc.nom?.toLowerCase().includes(recherche.toLowerCase())
            || doc.typeDoc?.toLowerCase().includes(recherche.toLowerCase())
            || doc.date?.toLowerCase().includes(recherche.toLowerCase());
        return matchCat && matchRecherche;
    });

    const ouvrirFichier = (url, nom) => {
        if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const télécharger = (url, nom) => {
        if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
        const a = document.createElement('a');
        a.href = url; a.download = nom;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const badgeColor = (cat) => {
        const colors = {
            reglement:     'bg-blue-50 text-blue-600 border-blue-200',
            rapports:      'bg-green-50 text-green-600 border-green-200',
            comptes_rendus:'bg-purple-50 text-purple-600 border-purple-200',
            maquette:      'bg-amber-50 text-amber-600 border-amber-200',
        };
        return colors[cat] || 'bg-slate-50 text-slate-500 border-slate-200';
    };

    const badgeLabel = (cat) => {
        const labels = {
            reglement:     'Règlement',
            rapports:      'Rapport',
            comptes_rendus:'Compte Rendu',
            maquette:      'Maquette',
        };
        return labels[cat] || cat;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">

            {/* Titre */}
            <div className="mb-6">
                <h1 className="text-xl font-extrabold text-[#0f213a]">Bibliothèque</h1>
                <p className="text-xs text-slate-500 mt-1">
                    {tousLesDocuments.length} document(s) disponible(s) — mis à jour en temps réel
                </p>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-5">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    placeholder="Rechercher un document..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 shadow-sm"
                />
                {recherche && (
                    <button onClick={() => setRecherche('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Filtres par catégorie */}
            <div className="flex gap-2 flex-wrap mb-6">
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setFiltre(cat.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${filtre === cat.id
                                ? 'bg-[#0f213a] text-white border-[#0f213a] shadow-sm'
                                : 'bg-white text-slate-600 border-gray-200 hover:border-[#0f213a] hover:text-[#0f213a]'
                            }`}>
                        {cat.label}
                        {cat.id !== 'all' && (
                            <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${filtre === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {cat.id === 'maquette'
                    ? maquettes.length
                    : ressources.filter(r => r.categorie === cat.id).length
                }
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Résultats */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8 text-[#22c55e]" />
                        <p className="text-xs text-slate-400">Chargement des documents...</p>
                    </div>
                </div>
            ) : documentsFiltrés.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <FileX className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-slate-400">Aucun document trouvé</p>
                    <p className="text-xs text-slate-300 mt-1">Essayez un autre filtre ou une autre recherche</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentsFiltrés.map(doc => (
                        <div key={doc.id}
                             className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#22c55e]/30 transition-all group">

                            {/* Header carte */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                                    <FileText size={20} className="text-red-400" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-xs font-bold text-[#0f213a] leading-tight mb-1 truncate" title={doc.nom}>
                                        {doc.nom}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor(doc.categorie)}`}>
                      {badgeLabel(doc.categorie)}
                    </span>
                                        {doc.date && (
                                            <span className="text-[9px] text-slate-400 font-medium">📅 {doc.date}</span>
                                        )}
                                        {doc.filiere && (
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${doc.filiere === 'IT' ? 'bg-[#0f213a] text-white border-[#0f213a]' : 'bg-amber-600 text-white border-amber-600'}`}>
                        {doc.filiere}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Infos */}
                            {doc.typeDoc && (
                                <p className="text-[10px] text-slate-400 mb-4 pl-1 border-l-2 border-slate-100">
                                    {doc.typeDoc}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => ouvrirFichier(doc.url, doc.nom)}
                                    disabled={!doc.url}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#0f213a] hover:bg-[#1e3a5f] disabled:opacity-40 text-white py-2 rounded-xl text-[10px] font-bold transition-colors shadow-sm">
                                    <Eye size={14} />
                                    Consulter
                                </button>
                                <button
                                    onClick={() => télécharger(doc.url, doc.nom)}
                                    disabled={!doc.url}
                                    className="flex items-center justify-center gap-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 disabled:opacity-40 text-[#22c55e] border border-[#22c55e]/20 px-4 py-2 rounded-xl text-[10px] font-bold transition-colors">
                                    <Download size={14} />
                                    Télécharger
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}