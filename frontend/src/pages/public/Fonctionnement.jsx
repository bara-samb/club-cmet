import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { ChevronDown, FileText } from '../../components/ui/Icons';

export default function Fonctionnement() {
    const [openArticle, setOpenArticle] = useState('bureau-exec');
    const [ressources, setRessources] = useState([]);

    useEffect(() => {
        let active = true;
        const fetchRessources = async () => {
            const { data } = await supabase.from('ressources').select('*');
            if (data && active) setRessources(data);
        };
        fetchRessources();
        return () => { active = false; };
    }, []);

    const sections = [
        {
            id: 'bureau-exec',
            label: 'Composition des Organes Légaux du Club',
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
            content: (
                <div className="p-5 text-xs md:text-sm text-slate-600 space-y-3 bg-white border-t border-gray-50 text-justify">
                    <p>La direction s'organise autour de deux entités majeures :</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Bureau Exécutif :</strong> Président, Vice-Président, Secrétaire Général.</li>
                        <li><strong>Bureau Élargi :</strong> Responsables de Commissions techniques.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'nomination',
            label: 'Durée du Mandat et Obligations de Clôture',
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
            content: (
                <div className="p-5 text-xs md:text-sm text-slate-600 bg-white border-t border-gray-50 text-justify">
                    Les membres effectuent un mandat d'un an non renouvelable immédiatement sans élection générale. La transmission des charges et documents comptables est obligatoire en fin d'exercice.
                </div>
            )
        }
    ];

    const reglementDoc = ressources.find(r => r.categorie === 'reglement');

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* Header Banner */}
            <div className="bg-[#003058] text-white py-12 px-6 text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Régime & Fonctionnement Interne</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Consultez les chartes de fonctionnement exécutif et téléchargez les statuts officiels.
                </p>
            </div>

            <section className="py-16 px-6 max-w-4xl mx-auto">
                <div className="bg-white border border-[#e2e8f0]/60 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
                    <div className="text-center mb-6">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Régime Interne</span>
                        <h2 className="text-2xl font-bold text-[#003058] mt-3">Règles de Fonctionnement Exécutif</h2>
                    </div>

                    <div className="space-y-4">
                        {sections.map(item => (
                            <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                <button onClick={() => setOpenArticle(openArticle === item.id ? null : item.id)}
                                    className="w-full bg-[#f1f5f9] px-5 py-4 text-left flex justify-between items-center hover:bg-slate-100/60 transition-colors">
                                    <span className="text-xs md:text-sm font-bold text-slate-700 flex items-start gap-2 pr-4 flex-1">
                                        <svg className="w-4 h-4 text-[#187840] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{item.icon}</svg>
                                        {item.label}
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${openArticle === item.id ? 'rotate-180' : ''}`} />
                                </button>
                                {openArticle === item.id && item.content}
                            </div>
                        ))}
                    </div>

                    {/* Document Règlement Intérieur */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left">
                            <h4 className="text-xs md:text-sm font-black text-[#003058] uppercase tracking-wider">Document de Référence</h4>
                            <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                                Consultez l'intégralité du Règlement Intérieur du Club-MET pour en savoir plus sur nos chartes et obligations.
                            </p>
                        </div>
                        {reglementDoc ? (
                            <a
                                href={reglementDoc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#187840] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105 shrink-0"
                            >
                                <FileText size={14} /> Télécharger le Règlement (PDF)
                            </a>
                        ) : (
                            <span className="text-xs text-slate-400 italic font-medium bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl shrink-0">
                                Document indisponible en ligne
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
