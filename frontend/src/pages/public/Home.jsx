import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Check, Loader2, Image, ChevronDown, CheckCircle2, FileText } from '../../components/ui/Icons';

const formatDateEvenement = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
};

export default function Home() {
    const navigate = useNavigate();

    /* ── State UI ── */
    const [lightboxImage, setLightboxImage] = useState(null);
    const [inscriptions, setInscriptions] = useState({});
    const [toastMessage, setToastMessage] = useState(null);
    const [inscrireModal, setInscrireModal] = useState(null);
    const [nomInscrit, setNomInscrit] = useState('');
    const [emailInscrit, setEmailInscrit] = useState('');
    const [inscriptionSubmitting, setInscriptionSubmitting] = useState(false);
    const [openArticle, setOpenArticle] = useState('bureau-exec');

    /* ── State Activités & Médias ── */
    const [activeTab, setActiveTab] = useState('activites');
    const [filtreAct, setFiltreAct] = useState('tous');

    /* ── Données Supabase ── */
    const [evenements, setEvenements] = useState([]);
    const [medias, setMedias] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [loadingEvenements, setLoadingEvenements] = useState(true);
    const [loadingMedias, setLoadingMedias] = useState(true);

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchEvenements = async () => {
            setLoadingEvenements(true);
            const { data } = await supabase
                .from('activites')
                .select('*')
                .order('date', { ascending: false });
            if (data && active) {
                const parsed = data.map(ev => {
                    let descText = ev.description || '';
                    let imgs = [];

                    if (ev.img) {
                        try {
                            imgs = JSON.parse(ev.img);
                        } catch (e) {
                            imgs = [ev.img];
                        }
                    }

                    return {
                        ...ev,
                        descriptionText: descText,
                        images: imgs
                    };
                });
                setEvenements(parsed);
            } else if (active) {
                setEvenements([]);
            }
            if (active) setLoadingEvenements(false);
        };

        const fetchMedias = async () => {
            setLoadingMedias(true);
            const { data } = await supabase
                .from('medias')
                .select('*')
                .order('created_at', { ascending: false });
            if (data && active) setMedias(data);
            if (active) setLoadingMedias(false);
        };

        const fetchRessources = async () => {
            const { data } = await supabase.from('ressources').select('*');
            if (data && active) setRessources(data);
        };

        const init = async () => {
            await Promise.all([fetchEvenements(), fetchMedias(), fetchRessources()]);
            if (!active) return;

            const c1 = supabase.channel('evenements-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'activites' }, () => { fetchEvenements(); })
                .subscribe();
            const c2 = supabase.channel('medias-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'medias' }, () => { fetchMedias(); })
                .subscribe();
            const c3 = supabase.channel('ressources-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, () => { fetchRessources(); })
                .subscribe();

            channels.push(c1, c2, c3);
        };

        init();

        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const inscrireActivite = (act) => {
        setInscrireModal(act);
        setNomInscrit('');
        setEmailInscrit('');
    };

    const gererInscription = async (e) => {
        e.preventDefault();
        if (!nomInscrit.trim() || !emailInscrit.trim()) return;

        setInscriptionSubmitting(true);
        try {
            const { error } = await supabase.from('inscriptions').insert([
                {
                    nom: nomInscrit.trim(),
                    email: emailInscrit.trim(),
                    activite_id: inscrireModal.id
                }
            ]);
            if (error) throw error;

            setInscriptions(prev => ({ ...prev, [inscrireModal.id]: true }));
            setToastMessage(`Félicitations ! Vous êtes inscrit à l'activité : ${inscrireModal.titre}`);
            setInscrireModal(null);
            setTimeout(() => setToastMessage(null), 4000);
        } catch (err) {
            console.error("Erreur d'inscription:", err);
            setToastMessage("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            setTimeout(() => setToastMessage(null), 4000);
        } finally {
            setInscriptionSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ken-burns {
                  0%   {transform:scale(1)}
                  50%  {transform:scale(1.08)}
                  100% {transform:scale(1)}
                }
                @keyframes fade-in-up {
                  0%   {opacity:0;transform:translateY(24px)}
                  100% {opacity:1;transform:translateY(0)}
                }
                @keyframes badge-pop {
                  0%  {opacity:0;transform:scale(.7) translateY(10px)}
                  60% {transform:scale(1.05)}
                  100%{opacity:1;transform:scale(1)  translateY(0)}
                }
                .anim-bg         {animation:ken-burns 20s ease-in-out infinite}
                .anim-badge      {animation:badge-pop  .7s cubic-bezier(.34,1.56,.64,1) both}
                .anim-h1         {animation:fade-in-up  .9s ease both .3s}
                .anim-p          {animation:fade-in-up  .9s ease both .55s}
                .anim-btns       {animation:fade-in-up  .9s ease both .75s}
            ` }} />

            {/* ── HERO ── */}
            <section className="relative bg-[#003058] text-white py-20 md:py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <img src="/images/GEH.jpg" alt=""
                        className="anim-bg w-full h-full object-cover opacity-50"
                        style={{ transformOrigin: 'center center' }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#003058]/60 via-[#003058]/40 to-[#003058]/80" />
                <div className="relative max-w-5xl mx-auto text-center z-10">
                    <span className="anim-badge inline-block bg-[#002850] text-[#187840] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-700">
                        Club de l'UFR Métiers et Technologies
                    </span>
                    <h1 className="anim-h1 text-4xl md:text-6xl font-extrabold tracking-tight mt-5 mb-4 leading-tight">
                        L'Excellence académique au cœur de la Technologie
                    </h1>
                    <p className="anim-p text-slate-300 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
                        Rejoins l'écosystème numérique d'entraide et de partage de ressources du Club-MET, spécifiquement conçu pour les filières de l'UFR Métiers et Technologies.
                    </p>
                    <div className="anim-btns flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="https://ucak.edu.sn" target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-white text-[#187840] px-6 py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-slate-100 transition-all hover:scale-105 shadow-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                            </svg>
                            Découvrir l'UCAK
                        </a>
                        <button onClick={() => navigate('/login')}
                            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-[#187840] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-green-600 transition-all hover:scale-105 shadow-lg">
                            Espace Étudiant
                        </button>
                    </div>
                </div>
            </section>

            {/* ── STATS SECTION ── */}
            <section className="py-12 px-6 max-w-5xl mx-auto -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Tutorat & Partage", value: "Entraide académique continue", bg: "bg-emerald-50 text-emerald-800" },
                        { label: "Projets Innovants", value: "Ateliers & Technologie", bg: "bg-blue-50 text-blue-800" },
                        { label: "Maraudes & Social", value: "Engagement communautaire", bg: "bg-indigo-50 text-indigo-800" },
                        { label: "Synergie MET", value: "Cohésion inter-filières", bg: "bg-amber-50 text-amber-800" }
                    ].map((s, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between ${s.bg}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</span>
                            <span className="text-sm font-extrabold mt-2 leading-snug">{s.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── À PROPOS (Le Club) ── */}
            <section id="about-club" className="py-16 px-6 max-w-5xl mx-auto scroll-mt-20">
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#003058] mb-6 text-center">
                        Le Club Métiers & Technologies
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <section className="py-20 bg-gradient-to-b from-white to-[#f8fafc] px-6 border-t border-gray-100 overflow-hidden">
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

            {/* ── FONCTIONNEMENT ── */}
            <section id="fonctionnement" className="py-16 bg-[#f1f5f9] border-t border-b border-gray-100 px-6 scroll-mt-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Régime Interne</span>
                        <h2 className="text-2xl font-bold text-[#003058] mt-3">Règles de Fonctionnement Exécutif</h2>
                    </div>
                    <div className="bg-white border border-[#e2e8f0]/60 rounded-2xl shadow-sm p-6 space-y-4">
                        {[
                            {
                                id: 'bureau-exec', label: 'Composition des Organes Légaux du Club',
                                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                                content: <div className="p-5 text-xs text-slate-600 space-y-3 bg-white border-t border-gray-50 text-justify">
                                    <p>La direction s'organise autour de deux entités majeures :</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Bureau Exécutif :</strong> Président, Vice-Président, Secrétaire Général.</li>
                                        <li><strong>Bureau Élargi :</strong> Responsables de Commissions techniques.</li>
                                    </ul>
                                </div>
                            },
                            {
                                id: 'nomination', label: 'Durée du Mandat et Obligations de Clôture',
                                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                content: <div className="p-5 text-xs text-slate-600 bg-white border-t border-gray-50 text-justify">
                                    Les membres effectuent un mandat d'un an non renouvelable immédiatement sans élection générale. La transmission des charges et documents comptables est obligatoire en fin d'exercice.
                                </div>
                            },
                        ].map(item => (
                            <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                <button onClick={() => setOpenArticle(openArticle === item.id ? null : item.id)}
                                    className="w-full bg-[#f1f5f9] px-5 py-4 text-left flex justify-between items-center hover:bg-slate-100/60 transition-colors">
                                    <span className="text-xs font-bold text-slate-700 flex items-start gap-2 pr-4 flex-1">
                                        <svg className="w-4 h-4 text-[#187840]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{item.icon}</svg>
                                        {item.label}
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${openArticle === item.id ? 'rotate-180' : ''}`} />
                                </button>
                                {openArticle === item.id && item.content}
                            </div>
                        ))}

                        {/* Document Règlement Intérieur */}
                        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-left">
                                <h4 className="text-xs font-black text-[#003058] uppercase tracking-wider">Document de Référence</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Consultez l'intégralité du Règlement Intérieur du Club-MET pour en savoir plus sur nos chartes et obligations.
                                </p>
                            </div>
                            {ressources.filter(r => r.categorie === 'reglement').length > 0 ? (
                                <a
                                    href={ressources.find(r => r.categorie === 'reglement').url}
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
                </div>
            </section>

            {/* ── ACTIVITÉS & MÉDIAS ── */}
            <section className="py-20 bg-[#f8fafc] border-t border-gray-100 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#003058]">Actualités, Activités & Médias</h2>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">Suivez nos événements, participez à nos ateliers et revivez en images les moments forts du club.</p>
                    </div>

                    <div className="flex justify-center mb-10">
                        <div className="bg-white p-1.5 rounded-2xl border border-gray-200/60 shadow-sm flex gap-2">
                            <button
                                onClick={() => setActiveTab('activites')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'activites' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Calendar size={14} className="shrink-0" /> Événements & Activités
                            </button>
                            <button
                                onClick={() => setActiveTab('medias')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'medias' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Image size={14} className="shrink-0" /> Galerie Médias
                            </button>
                        </div>
                    </div>

                    {activeTab === 'activites' ? (
                        <div>
                            <div className="flex justify-center gap-2 flex-wrap mb-8">
                                {['tous', 'Génie en Herbe', 'Journée d\'Intégration', 'Accueil Nouveaux Étudiants', 'Action Sociale', 'Action Communautaire', 'Tutorat', 'Autre'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFiltreAct(f)}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${filtreAct === f ? 'bg-[#187840] text-white border-[#187840] shadow-sm' : 'bg-white text-slate-500 border-[#e2e8f0]/60 hover:border-[#187840] hover:text-[#187840]'}`}>
                                        {f === 'tous' ? 'Tous' : f}
                                    </button>
                                ))}
                            </div>

                            {loadingEvenements ? (
                                <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    Chargement des événements...
                                </div>
                            ) : evenements.filter(ev => filtreAct === 'tous' || ev.type === filtreAct).length === 0 ? (
                                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl text-sm text-slate-400">
                                    {filtreAct === 'tous' ? "Aucun événement publié pour le moment." : `Aucun événement de type « ${filtreAct} » pour le moment.`}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {evenements.filter(ev => filtreAct === 'tous' || ev.type === filtreAct).map((ev) => (
                                        <motion.div key={ev.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between group transition-all duration-300">
                                            <div>
                                                <div className="h-48 overflow-hidden relative bg-slate-100">
                                                    <div className="absolute inset-0 bg-[#003058]/20 group-hover:bg-transparent transition-colors z-10" />
                                                    {ev.images?.[0] ? (
                                                        <img src={ev.images[0]} alt={ev.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                                        </div>
                                                    )}
                                                    <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-[#003058] text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 shadow-sm">
                                                        {ev.type}
                                                    </span>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex items-center gap-1.5 text-[#187840] text-[10px] font-black uppercase tracking-widest mb-3">
                                                        <Calendar size={12} /> {formatDateEvenement(ev.date)}
                                                    </div>
                                                    <h3 className="font-extrabold text-base text-[#003058] mb-3 leading-snug group-hover:text-[#187840] transition-colors">{ev.titre}</h3>
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 text-justify">{ev.descriptionText}</p>
                                                </div>
                                            </div>
                                            <div className="p-6 pt-0">
                                                {inscriptions[ev.id] ? (
                                                    <span className="w-full inline-flex items-center justify-center gap-1.5 bg-green-50 text-[#125e31] py-3 rounded-xl font-bold text-xs border border-green-100">
                                                        <Check size={14} /> Vous êtes inscrit
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => inscrireActivite(ev)}
                                                        className="w-full bg-[#f1f5f9] group-hover:bg-[#187840] text-slate-700 group-hover:text-white py-3 rounded-xl font-bold text-xs transition-colors"
                                                    >
                                                        S'inscrire à l'activité
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {loadingMedias ? (
                                <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    Chargement de la galerie...
                                </div>
                            ) : medias.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl text-sm text-slate-400">
                                    Aucun média disponible dans la galerie pour le moment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {medias.map((m) => (
                                        <div key={m.id}
                                            onClick={() => setLightboxImage(m)}
                                            className="group relative h-48 bg-slate-100 rounded-2xl overflow-hidden cursor-zoom-in border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                            <img src={m.url} alt={m.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#187840] mb-1">{m.type}</span>
                                                <h4 className="font-bold text-xs truncate leading-snug">{m.titre}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 bg-[#187840] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 font-bold text-xs select-none">
                        <Check className="w-5 h-5 shrink-0 bg-white/20 p-1 rounded-full text-white" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inscription Modal */}
            <AnimatePresence>
                {inscrireModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 overflow-hidden relative text-slate-800">
                            <button onClick={() => setInscrireModal(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10">
                                <X size={16} />
                            </button>
                            <span className="inline-block bg-[#187840]/10 text-[#187840] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                                Inscription Activité
                            </span>
                            <h3 className="text-lg font-extrabold text-[#003058] mb-2">{inscrireModal.titre}</h3>
                            <p className="text-xs text-slate-400 mb-6 font-medium">Complétez le formulaire ci-dessous pour réserver votre place.</p>
                            <form onSubmit={gererInscription} className="space-y-4">
                                <div className="text-left">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom Complet</label>
                                    <input type="text" required value={nomInscrit} onChange={e => setNomInscrit(e.target.value)}
                                        placeholder="Ex: Fatou Diop"
                                        className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold" />
                                </div>
                                <div className="text-left">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adresse Email Pro</label>
                                    <input type="email" required value={emailInscrit} onChange={e => setEmailInscrit(e.target.value)}
                                        placeholder="Ex: fatou.diop@ucak.edu.sn"
                                        className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold" />
                                </div>
                                <button type="submit" disabled={inscriptionSubmitting}
                                    className="w-full bg-[#187840] hover:bg-green-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md mt-6 flex items-center justify-center gap-2">
                                    {inscriptionSubmitting ? "Inscription en cours..." : "Valider mon inscription"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <div onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out">
                        <button onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="max-w-4xl w-full flex flex-col items-center select-none cursor-default">
                            <img src={lightboxImage.url} alt={lightboxImage.titre} className="max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
                            <div className="text-center mt-5 text-white">
                                <span className="inline-block bg-[#187840] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                                    {lightboxImage.type}
                                </span>
                                <h3 className="text-base font-extrabold tracking-wide">{lightboxImage.titre}</h3>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}