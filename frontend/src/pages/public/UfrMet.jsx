import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UfrMet() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f8fafc] dark:bg-ucak-dark min-h-screen">
            <div className="bg-[#003058] text-white py-14 px-6 text-center border-b border-white/5">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight">L'UFR Métiers & Technologies</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Découvrez les filières de pointe enseignées à l'UFR MET au sein de l'UCAK.
                </p>
            </div>

            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-block text-[10px] font-black text-[#187840] uppercase tracking-widest bg-[#187840]/10 px-4 py-1.5 rounded-full border border-[#187840]/20 mb-4">
                        Filières de Formation
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#003058] dark:text-white mb-4">Départements d'Étude</h2>
                    <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                        L'UFR MET enseigne des métiers émergents dont le Sénégal et l'Afrique ont besoin pour soutenir leur développement économique, social et technologique.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-8">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-[#003058] dark:text-white">2</span>
                            <span className="text-[10px] font-bold text-[#187840] uppercase tracking-widest">Départements actifs</span>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-gray-300" />
                        <div className="text-center">
                            <span className="block text-3xl font-black text-amber-500">3</span>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">En perspective</span>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-gray-300" />
                        <div className="text-center">
                            <span className="block text-3xl font-black text-[#003058] dark:text-white">5</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Départements au total</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* IT */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition-all duration-300">
                        <div className="bg-gradient-to-br from-[#003058] to-[#004a8c] px-6 pt-6 pb-8 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#187840]/20 rounded-full" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-block text-[9px] font-black text-[#187840] bg-[#187840]/25 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3">● Actif</span>
                                    <h3 className="font-extrabold text-xl text-white leading-snug">Informatique &<br />Télécommunications</h3>
                                    <span className="text-white/50 text-xs font-bold tracking-widest">IT</span>
                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 flex flex-wrap gap-1.5 border-b border-gray-50">
                            {['Dev. Applications', 'Base de Données', 'Réseaux & Télécommunications', 'Admin Linux'].map(tag => (
                                <span key={tag} className="text-[9px] font-bold text-[#003058] dark:text-white bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                        <div className="px-6 py-5 flex-1">
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">
                                Le Département Informatique et Télécommunications forme les futurs experts du numérique à travers un cursus rigoureux mêlant développement d'applications, administration de bases de données, sécurité des réseaux et administration Linux avancée.
                            </p>
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4 text-center">
                            <button onClick={() => navigate('/login')}
                                className="text-xs font-bold text-[#003058] dark:text-white hover:text-[#187840] transition-colors">
                                Se connecter pour accéder aux maquettes
                            </button>
                        </div>
                    </div>

                    {/* HEC */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition-all duration-300">
                        <div className="bg-gradient-to-br from-amber-600 to-amber-800 px-6 pt-6 pb-8 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-block text-[9px] font-black text-amber-200 bg-amber-500/40 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3">● Actif</span>
                                    <h3 className="font-extrabold text-xl text-white leading-snug">Hautes Études<br />Commerciales</h3>
                                    <span className="text-white/50 text-xs font-bold tracking-widest">HEC</span>
                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 flex flex-wrap gap-1.5 border-b border-gray-50">
                            {['Finance', 'Comptabilité', 'Contrôle de gestion', 'Management', 'Audit financier'].map(tag => (
                                <span key={tag} className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                        <div className="px-6 py-5 flex-1">
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed text-justify">
                                Le Département Hautes Études Commerciales prépare les futurs cadres et leaders financiers à travers des formations de pointe en comptabilité, contrôle de gestion, audit, finance d'entreprise et techniques de management stratégique.
                            </p>
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4 text-center">
                            <button onClick={() => navigate('/login')}
                                className="text-xs font-bold text-[#003058] dark:text-white hover:text-[#187840] transition-colors">
                                Se connecter pour accéder aux maquettes
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
