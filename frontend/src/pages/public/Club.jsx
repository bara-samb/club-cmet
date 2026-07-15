import React from 'react';
import { motion } from 'framer-motion';

export default function Club() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header Banner */}
            <div className="bg-[#003058] text-white py-12 px-6 text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Le Club Métiers & Technologies</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Découvrez notre vision, nos valeurs et l'histoire du Club-MET au sein de l'UFR MET de l'UCAK.
                </p>
            </div>

            {/* ── À PROPOS ── */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#003058] mb-6 text-center">
                        Missions & Objectifs
                    </h2>
                    <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4">
                        <p className="text-justify">
                            Le <strong>Club Métiers & Technologies (Club-MET)</strong> est la structure légale qui regroupe l'ensemble des étudiants de l'UFR <strong>Métiers & Technologies (MET)</strong>.
                        </p>
                        <p className="font-semibold text-[#003058] mt-4">
                            Le Club a pour missions de :
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <li className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-[#187840]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-[#187840]"></span>
                                </span>
                                <span className="text-xs md:text-sm"><strong>Promouvoir l'innovation</strong> technologique et entrepreneuriale.</span>
                            </li>
                            <li className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-[#187840]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-[#187840]"></span>
                                </span>
                                <span className="text-xs md:text-sm"><strong>Organiser des tutorats</strong> par les pairs pour soutenir les apprentissages disciplinaires.</span>
                            </li>
                            <li className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-[#187840]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-[#187840]"></span>
                                </span>
                                <span className="text-xs md:text-sm"><strong>Développer des projets communautaires</strong> (actions sociales, maraudes, supports pédagogiques).</span>
                            </li>
                            <li className="flex items-start gap-2.5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-[#187840]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-[#187840]"></span>
                                </span>
                                <span className="text-xs md:text-sm"><strong>Faciliter la cohésion inter-filières</strong> via des événements culturels et des rencontres.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        {
                            titre: 'Règlementation & Éthique', desc: "Respect rigoureux des statuts de l'UCAK et de la charte de comportement interne du Club-MET.",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M12 5l-7 3m7-3l7 3M5 8v4c0 2.5 1.5 4.5 4 5m10-9v4c0 2.5-1.5 4.5-4 5M3 21h18M9 12h6" />
                        },
                        {
                            titre: 'Transparence Totale', desc: "Publication systématique des comptes rendus d'AG et des bilans financiers annuels.",
                            icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 11h10M7 14h7" /></>
                        },
                        {
                            titre: 'Gouvernance Active', desc: "Des commissions de travail dynamiques et évaluées mensuellement selon leurs réalisations concrètes.",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.443.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        },
                    ].map((c, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center">
                            <div className="w-16 h-16 mb-4 text-[#187840] flex items-center justify-center">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">{c.icon}</svg>
                            </div>
                            <h3 className="font-bold text-xs text-[#003058] mb-2">{c.titre}</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PARCOURS & HISTOIRE ── */}
            <section className="py-20 bg-gradient-to-b from-white to-[#f1f5f9] px-6 border-t border-gray-100 overflow-hidden">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-[#187840] uppercase tracking-widest bg-[#187840]/10 px-4 py-1.5 rounded-full border border-[#187840]/25">
                            Notre Histoire
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#003058] mt-4">Le Parcours du Club-MET</h2>
                        <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">Découvrez les grandes étapes clés et les succès qui ont forgé notre club académique.</p>
                    </div>

                    <div className="relative border-l-2 border-dashed border-[#187840]/40 pl-6 md:pl-10 ml-4 md:ml-10 space-y-12">
                        {[
                            { year: '2024', title: 'Fondation & Vision', desc: "Lancement du Club-MET à l'UFR Métiers & Technologies pour briser les barrières inter-filières et créer une synergie d'entraide." },
                            { year: '2024', title: 'Structuration du Tutorat', desc: "Mise en place d'un réseau structuré de tutorat par les pairs, dispensant des séances hebdomadaires aux étudiants." },
                            { year: '2024', title: 'Essor Technologique', desc: "Création des premiers outils numériques de partage, d'annales de cours et de maquettes, et premières participations aux hackathons régionaux." },
                            { year: '2026', title: 'Modernisation & Plateforme Web', desc: "Déploiement de notre portail interactif, offrant un espace étudiant , bibliothèque partagée et notifications en direct." }
                        ].map((item, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute -left-[35px] md:-left-[51px] top-1 w-6 h-6 rounded-full bg-[#187840] border-4 border-white group-hover:scale-110 transition-transform flex items-center justify-center shadow-md">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-white border border-[#e2e8f0]/30 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h3 className="font-extrabold text-sm md:text-base text-[#003058]">{item.title}</h3>
                                        <span className="text-xs font-black text-white bg-[#187840] px-3 py-1 rounded-full">{item.year}</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
