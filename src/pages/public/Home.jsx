// src/pages/public/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users as UsersIcon, Camera, X, Check, Award, ArrowRight, ExternalLink, Shield, Loader2 } from 'lucide-react';

/* ── Icônes réseaux sociaux ── */
const FacebookIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const InstagramIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);
const LinkedInIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

/* ── Helpers ── */
const ouvrirFichier = (url, nom) => {
    if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
};
const déclencherTéléchargement = (url, nom) => {
    if (!url) { alert(`Fichier non disponible : ${nom}`); return; }
    const a = document.createElement('a');
    a.href = url; a.download = nom;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

/* ── Catégories statiques (structure dossiers) ── */
const CATEGORIES_STATIQUES = [
    { id: 'reglement', nomDossier: 'Règlement Intérieur' },
];

const ACTIVITES = [
    { id: 1, titre: 'Hackathon UCAK 2026', date: '12 Mars 2026', type: 'Hackathon', desc: '48h de développement intensif pour créer des solutions numériques innovantes répondant aux défis locaux.', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600', places: 12 },
    { id: 2, titre: 'Atelier IoT & Robotique', date: '28 Février 2026', type: 'Workshop', desc: 'Conception pratique de systèmes connectés avec ESP32, capteurs et IoT cloud.', img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600', places: 5 },
    { id: 3, titre: 'Conférence Cybersécurité', date: '15 Février 2026', type: 'Conférence', desc: 'Démonstrations de hacking éthique et sensibilisation aux bonnes pratiques de sécurité des systèmes.', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600', places: 0 },
    { id: 4, titre: 'Bootcamp Web & Mobile', date: '05 Janvier 2026', type: 'Formation', desc: 'Apprentissage intensif de React, TailwindCSS et Node.js pour concevoir des applications web complètes.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600', places: 8 },
    { id: 5, titre: 'CMET Tech Talk', date: '20 Décembre 2025', type: 'Conférence', desc: 'Échanges ouverts avec des ingénieurs diplômés sur les métiers de la tech et les opportunités de carrière.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', places: 0 },
];

const MEDIAS = [
    { id: 1, titre: 'Hackathon 2026 - Finale', type: 'Photo', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600' },
    { id: 2, titre: 'Atelier Arduino / IoT', type: 'Photo', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600' },
    { id: 3, titre: 'Conférence Cybersécurité', type: 'Photo', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600' },
    { id: 4, titre: 'Membres du bureau 2025', type: 'Photo', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=600' },
    { id: 5, titre: 'Séance de Mentorat IT', type: 'Photo', url: 'https://images.unsplash.com/photo-1531535934200-873499974982?auto=format&fit=crop&q=80&w=600' },
    { id: 6, titre: 'Visite d\'entreprise partenaire', type: 'Photo', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600' },
];

export default function Home() {
    const navigate = useNavigate();

    /* ── State UI ── */
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [openArticle, setOpenArticle] = useState('bureau-exec');
    const [dossierOuvert, setDossierOuvert] = useState(null);

    /* ── State Activités & Médias ── */
    const [activeTab, setActiveTab] = useState('activites'); // 'activites' ou 'medias'
    const [filtreAct, setFiltreAct] = useState('tous');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [inscriptions, setInscriptions] = useState({});
    const [toastMessage, setToastMessage] = useState(null);
    const [inscrireModal, setInscrireModal] = useState(null);
    const [nomInscrit, setNomInscrit] = useState('');
    const [emailInscrit, setEmailInscrit] = useState('');

    /* ── State Formulaire de Contact ── */
    const [nomContact, setNomContact] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [telContact, setTelContact] = useState('');
    const [msgContact, setMsgContact] = useState('');
    const [contactErrors, setContactErrors] = useState({});
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState(null); // null ou { type: 'success'|'error', msg: string }


    /* ── Données Firestore ── */
    const [bureau, setBureau] = useState([]);
    const [ressources, setRessources] = useState([]);
    const [maquettes, setMaquettes] = useState([]);

    useEffect(() => {
        let active = true;
        let channels = [];

        const fetchBureau = async () => {
            const { data } = await supabase.from('bureau').select('*');
            if (data && active) setBureau(data);
        };
        const fetchRessources = async () => {
            const { data } = await supabase.from('ressources').select('*');
            if (data && active) setRessources(data);
        };
        const fetchMaquettes = async () => {
            const { data } = await supabase.from('maquettes').select('*');
            if (data && active) setMaquettes(data);
        };

        const init = async () => {
            await Promise.all([fetchBureau(), fetchRessources(), fetchMaquettes()]);
            if (!active) return;

            const c1 = supabase.channel('bureau-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'bureau' }, () => { fetchBureau(); })
                .subscribe();
            const c2 = supabase.channel('ressources-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ressources' }, () => { fetchRessources(); })
                .subscribe();
            const c3 = supabase.channel('maquettes-home')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'maquettes' }, () => { fetchMaquettes(); })
                .subscribe();

            channels.push(c1, c2, c3);
        };

        init();

        return () => {
            active = false;
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, []);

    const toggleDossier = (e, id) => {
        e.stopPropagation();
        setDossierOuvert(dossierOuvert === id ? null : id);
    };

    /* Catégories enrichies avec leurs fichiers Firestore */
    const categories = CATEGORIES_STATIQUES.map(cat => ({
        ...cat,
        fichiers: ressources.filter(r => r.categorie === cat.id),
    }));

    const inscrireActivite = (act) => {
        setInscrireModal(act);
        setNomInscrit('');
        setEmailInscrit('');
    };

    const gererInscription = (e) => {
        e.preventDefault();
        if (!nomInscrit || !emailInscrit) return;
        
        // Simuler la validation
        setInscriptions(prev => ({ ...prev, [inscrireModal.id]: true }));
        
        // Afficher un toast
        setToastMessage(`Félicitations ! Vous êtes inscrit à l'activité : ${inscrireModal.titre}`);
        setInscrireModal(null);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const gererSoumissionContact = async (e) => {
        e.preventDefault();
        setContactStatus(null);
        
        // Validation des saisies
        const errors = {};
        if (!nomContact.trim()) {
            errors.nom = "Le nom complet est requis.";
        }
        
        // Validation Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailContact.trim()) {
            errors.email = "L'adresse email est requise.";
        } else if (!emailRegex.test(emailContact)) {
            errors.email = "L'adresse email n'est pas valide.";
        }
        
        // Validation Téléphone (si renseigné)
        if (telContact.trim()) {
            const cleanTel = telContact.replace(/[\s.-]/g, '');
            if (!/^\+?\d{8,15}$/.test(cleanTel)) {
                errors.telephone = "Le numéro de téléphone n'est pas valide.";
            }
        }
        
        // Validation Message
        if (!msgContact.trim()) {
            errors.message = "Votre requête ne peut pas être vide.";
        } else if (msgContact.trim().length < 10) {
            errors.message = "Le message doit faire au moins 10 caractères.";
        }

        if (Object.keys(errors).length > 0) {
            setContactErrors(errors);
            setContactStatus({ type: 'error', msg: "Veuillez corriger les erreurs de saisie." });
            return;
        }

        // Si tout est valide, envoi à Supabase
        setContactErrors({});
        setContactSubmitting(true);

        try {
            const { error } = await supabase.from('messages').insert([
                {
                    nom: nomContact.trim(),
                    email: emailContact.trim(),
                    telephone: telContact.trim() || null,
                    message: msgContact.trim(),
                    statut: 'non_lu'
                }
            ]);

            if (error) throw error;

            setContactStatus({ type: 'success', msg: "Votre message a été transmis avec succès. Le bureau vous répondra dans les plus brefs délais." });
            // Réinitialiser les champs
            setNomContact('');
            setEmailContact('');
            setTelContact('');
            setMsgContact('');
        } catch (err) {
            console.error("Erreur d'envoi du message:", err);
            setContactStatus({ type: 'error', msg: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer." });
        } finally {
            setContactSubmitting(false);
        }
    };

    const maqIT = maquettes.find(m => m.filiere === 'IT');
    const maqHEC = maquettes.find(m => m.filiere === 'HEC');

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between antialiased scroll-smooth text-slate-800">

            {/* ── Animations CSS ── */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin-slow   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-ring  {
          0%,100%{box-shadow:0 0 0 0 rgba(24,120,64,.5),0 0 0 4px rgba(24,120,64,.15)}
          50%    {box-shadow:0 0 0 6px rgba(24,120,64,0), 0 0 0 10px rgba(24,120,64,0)}
        }
        @keyframes ken-burns {
          0%  {transform:scale(1)    translateX(0)   translateY(0)}
          33% {transform:scale(1.08) translateX(-1%) translateY(-1%)}
          66% {transform:scale(1.05) translateX(1%)  translateY(.5%)}
          100%{transform:scale(1)    translateX(0)   translateY(0)}
        }
        @keyframes light-sweep {
          0%  {opacity:0;transform:translateX(-100%) skewX(-20deg)}
          20% {opacity:1}
          80% {opacity:1}
          100%{opacity:0;transform:translateX(200%) skewX(-20deg)}
        }
        @keyframes float-up {
          0%  {opacity:0;  transform:translateY(0)     scale(.8)}
          20% {opacity:.6}
          80% {opacity:.4}
          100%{opacity:0;  transform:translateY(-120px) scale(1.1)}
        }
        @keyframes fade-in-up {
          from{opacity:0;transform:translateY(24px)}
          to  {opacity:1;transform:translateY(0)}
        }
        @keyframes badge-pop {
          0%  {opacity:0;transform:scale(.7) translateY(10px)}
          60% {transform:scale(1.05)}
          100%{opacity:1;transform:scale(1)  translateY(0)}
        }
        .anim-logo       {animation:spin-slow 18s linear infinite,pulse-ring 2.5s ease-in-out infinite}
        .anim-logo:hover {animation-play-state:paused}
        .anim-bg         {animation:ken-burns 20s ease-in-out infinite}
        .anim-sweep      {animation:light-sweep 6s ease-in-out infinite 1.5s}
        .anim-badge      {animation:badge-pop  .7s cubic-bezier(.34,1.56,.64,1) both}
        .anim-h1         {animation:fade-in-up  .9s ease both .3s}
        .anim-p          {animation:fade-in-up  .9s ease both .55s}
        .anim-btns       {animation:fade-in-up  .9s ease both .75s}
        .particle        {animation:float-up linear infinite}
      ` }} />

            {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
            <nav className="bg-[#003058]/80 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 transition-all">

                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="relative w-10 h-10 shrink-0">
                        <span style={{
                            position: 'absolute', inset: '-4px', borderRadius: '9999px',
                            border: '2px dashed rgba(24,120,64,.5)',
                            animation: 'spin-slow 10s linear infinite'
                        }} />
                        <img src="/images/logo-CMET.jpeg" alt="Logo Club-MET"
                            className="anim-logo w-10 h-10 rounded-full object-cover border-2 border-[#187840]/60 relative z-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-wide leading-none">CLUB-MET</span>
                        <span className="text-[10px] text-gray-400 tracking-wider mt-0.5">UFR MET • UCAK</span>
                    </div>
                </div>

                {/* Liens nav (Desktop) */}
                <div className="hidden md:flex gap-6 text-xs font-medium items-center">
                    <a href="#about-club" className="hover:text-[#187840] transition-colors">Le Club</a>
                    <a href="#fonctionnement" className="hover:text-[#187840] transition-colors">Fonctionnement</a>
                    <a href="#composition-bureau" className="hover:text-[#187840] transition-colors">Composition du Bureau</a>
                    <a href="#ufr-met" className="hover:text-[#187840] transition-colors">L'UFR MET</a>

                    {/* Règlement Intérieur Dropdown */}
                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="hover:text-[#187840] transition-colors flex items-center gap-1 font-semibold text-[#187840]">
                            Règlement Intérieur
                            <svg className="w-2.5 h-2.5 fill-current transition-transform duration-200"
                                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute left-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">
                                    Documents Officiels
                                </div>
                                <div className="flex flex-col mt-2 px-2 max-h-60 overflow-y-auto">
                                    {ressources.filter(r => r.categorie === 'reglement').length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic text-center py-4">Aucun document disponible.</p>
                                    ) : ressources.filter(r => r.categorie === 'reglement').map(file => (
                                        <div key={file.id} className="flex items-center justify-between gap-3 p-2 hover:bg-[#F8F0F0] rounded-xl transition-colors">
                                            <span className="flex items-center gap-2 text-xs text-slate-700 font-semibold truncate max-w-[150px]" title={file.nom}>
                                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                                <span className="truncate">{file.nom}</span>
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button onClick={() => { ouvrirFichier(file.url, file.nom); setDropdownOpen(false); }}
                                                    className="flex items-center gap-1 bg-[#003058] hover:bg-[#002850] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors">
                                                    Voir
                                                </button>
                                                <button onClick={() => déclencherTéléchargement(file.url, file.nom)}
                                                    className="flex items-center justify-center bg-[#187840]/10 hover:bg-[#187840]/20 text-[#187840] w-7 h-7 rounded-lg transition-colors border border-[#187840]/20">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <a href="#contact" className="hover:text-[#187840] transition-colors">Contact</a>
                </div>

                {/* Boutons auth (Desktop) */}
                <div className="hidden md:flex items-center gap-5 text-xs">
                    <button onClick={() => navigate('/login')}
                        className="font-semibold text-gray-300 hover:text-white transition-colors tracking-wide">
                        Se connecter
                    </button>
                    <button onClick={() => navigate('/register')}
                        className="bg-[#187840] text-white px-5 py-2 rounded-lg font-bold tracking-wide hover:bg-green-600 transition-colors shadow-md">
                        S'inscrire
                    </button>
                </div>

                {/* Bouton Hamburger Mobile */}
                <button onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className="md:hidden p-2 text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        {mobileNavOpen
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>
            </nav>

            {/* Menu Mobile Overlay */}
            {mobileNavOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-[#003058] pt-24 px-6 pb-6 overflow-y-auto">
                    <div className="flex flex-col gap-6 text-lg font-medium text-white">
                        <a href="#about-club" onClick={() => setMobileNavOpen(false)}>Le Club</a>
                        <a href="#fonctionnement" onClick={() => setMobileNavOpen(false)}>Fonctionnement</a>
                        <a href="#composition-bureau" onClick={() => setMobileNavOpen(false)}>Composition du Bureau</a>
                        <a href="#ufr-met" onClick={() => setMobileNavOpen(false)}>L'UFR MET</a>

                        <div className="border-t border-slate-700 my-2 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Règlement Intérieur</p>
                            <div className="flex flex-col gap-2 pl-2 text-xs text-slate-300">
                                {ressources.filter(r => r.categorie === 'reglement').length === 0 ? (
                                    <span className="text-[10px] text-slate-500 italic">- Aucun document disponible</span>
                                ) : ressources.filter(r => r.categorie === 'reglement').map(file => (
                                    <div key={file.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-700/50 last:border-0">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate flex items-center gap-2 max-w-[70%]">
                                            <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                            <span className="truncate">{file.nom}</span>
                                        </a>
                                        <button onClick={() => déclencherTéléchargement(file.url, file.nom)} className="text-[#187840] hover:text-green-400 p-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-700 my-2 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Connexion</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { setMobileNavOpen(false); navigate('/login'); }}
                                    className="w-full text-center font-semibold text-white bg-slate-800 py-3 rounded-xl transition-colors">
                                    Se connecter
                                </button>
                                <button onClick={() => { setMobileNavOpen(false); navigate('/register'); }}
                                    className="w-full text-center bg-[#187840] text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md">
                                    S'inscrire
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
          MAIN
      ════════════════════════════════════════ */}
            <main className="flex-grow" onClick={() => setDropdownOpen(false)}>

                {/* ── HERO ── */}
                <section className="relative bg-[#003058] text-white py-16 md:py-24 px-6 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <img src="/images/logo-CMET.jpeg" alt=""
                            className="anim-bg w-full h-full object-cover opacity-20"
                            style={{ transformOrigin: 'center center' }} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003058]/70 via-[#003058]/55 to-[#003058]/92" />
                    <div className="anim-sweep absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(24,120,64,.07) 50%,transparent 70%)', width: '60%', left: 0 }} />

                    {/* Particules */}
                    {[
                        { left: '8%', delay: '0s', dur: '5s', size: 6, op: .5 },
                        { left: '20%', delay: '1.2s', dur: '7s', size: 4, op: .35 },
                        { left: '35%', delay: '0.6s', dur: '6s', size: 5, op: .4 },
                        { left: '55%', delay: '2s', dur: '8s', size: 3, op: .3 },
                        { left: '70%', delay: '0.3s', dur: '5.5s', size: 6, op: .45 },
                        { left: '82%', delay: '1.8s', dur: '7.5s', size: 4, op: .35 },
                        { left: '92%', delay: '0.9s', dur: '6.5s', size: 5, op: .4 },
                    ].map((p, i) => (
                        <span key={i} className="particle absolute bottom-0 rounded-full bg-[#187840] pointer-events-none"
                            style={{ left: p.left, width: p.size, height: p.size, opacity: p.op, animationDuration: p.dur, animationDelay: p.delay }} />
                    ))}

                    <div className="relative max-w-5xl mx-auto text-center z-10">
                        <span className="anim-badge inline-block bg-[#002850] text-[#187840] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-700">
                            Cadre Institutionnel
                        </span>
                        <h1 className="anim-h1 text-3xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4 leading-tight">
                            L'Excellence académique au cœur de la Technologie
                        </h1>
                        <p className="anim-p text-slate-300 text-xs md:text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
                            Rejoins l'écosystème numérique d'entraide et de partage de ressources du Club-MET, spécifiquement conçu pour les filières de l'UFR Métiers et Technologies.
                        </p>
                        <div className="anim-btns flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="https://ucak.edu.sn" target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center w-full sm:w-auto gap-2 bg-white text-[#003058] px-6 py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-slate-100 transition-all hover:scale-105 shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                                </svg>
                                Découvrir l'UCAK
                            </a>
                            <button onClick={() => navigate('/decouvrir-ucak')}
                                className="flex items-center justify-center w-full sm:w-auto gap-2 bg-[#187840] text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-green-600 transition-all hover:scale-105 shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Découvrir l'UFR MET
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── À PROPOS ── */}
                <section id="about-club" className="py-16 px-6 max-w-5xl mx-auto scroll-mt-20">
                    <div className="mb-12">
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#003058] mb-4">Le Club Métiers & Technologies</h2>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify">
                            Le <strong>Club Métiers & Technologies (Club-MET)</strong> est régi par un règlement intérieur strict qui définit ses statuts, ses instances de gouvernance et le comportement éthique de ses membres au sein de l'<strong>Université Cheikh Ahmadou Khadim (UCAK)</strong>. Notre organisation s'assure que chaque étudiant évolue dans un cadre propice à l'acquisition de compétences réelles en ingénierie logicielle, réseaux, IoT et cybersécurité.
                        </p>
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

                {/* ── FONCTIONNEMENT ── */}
                <section id="fonctionnement" className="py-16 bg-[#F8F0F0] border-t border-b border-gray-100 px-6 scroll-mt-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Régime Interne</span>
                            <h2 className="text-2xl font-bold text-[#003058] mt-3">Règles de Fonctionnement Exécutif</h2>
                        </div>
                        <div className="bg-white border border-[#C8C8C8]/60 rounded-2xl shadow-sm p-6 space-y-4">
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
                                        className="w-full bg-[#F8F0F0] px-5 py-4 text-left flex justify-between items-center hover:bg-slate-100/60 transition-colors">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#187840]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{item.icon}</svg>
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-gray-400">{openArticle === item.id ? '▲' : '▼'}</span>
                                    </button>
                                    {openArticle === item.id && item.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── BUREAU (données Firestore) ── */}
                <section id="composition-bureau" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20 overflow-hidden">
                    <div className="text-center mb-16">
                        <span className="badge-green mb-3">Organigramme</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#003058]">Membres Officiels du Bureau</h2>
                        <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">Découvrez l'équipe dirigeante qui orchestre les activités et veille au bon fonctionnement du Club Métiers & Technologies.</p>
                    </div>
                    <motion.div 
                        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {bureau.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-sm text-slate-400">
                                Aucun membre enregistré pour le moment.
                            </div>
                        ) : bureau.map((m) => (
                            <motion.div key={m.id} 
                                variants={{ 
                                    hidden: { opacity: 0, y: 40, scale: 0.95 }, 
                                    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } } 
                                }}
                                whileHover={{ 
                                    y: -8, 
                                    scale: 1.03,
                                    boxShadow: "0 20px 25px -5px rgba(24,120,64,0.1), 0 10px 10px -5px rgba(0,48,88,0.04)"
                                }}
                                className="group relative bg-white border border-[#C8C8C8]/40 rounded-3xl p-6 text-center shadow-sm transition-all duration-300 overflow-hidden select-none">
                                {/* Glowing background decoration */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#187840] to-[#003058] rounded-3xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                
                                {/* Base background */}
                                <div className="absolute inset-0 bg-white rounded-3xl z-0" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8F0F0]/50 rounded-3xl pointer-events-none z-0" />
                                
                                <div className="relative z-10">
                                    {/* Avatar with dynamic frame */}
                                    <div className="relative w-28 h-28 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#187840] to-[#003058] opacity-50 group-hover:rotate-180 transition-transform duration-700 ease-out" style={{ padding: '2px' }}>
                                            <div className="w-full h-full bg-white rounded-full" />
                                        </div>
                                        <div className="absolute inset-1.5 rounded-full overflow-hidden border-2 border-white shadow-inner bg-slate-100">
                                            {m.imageUrl
                                                ? <img src={m.imageUrl} alt={m.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                : <div className="w-full h-full bg-gradient-to-br from-[#003058] to-[#187840] flex items-center justify-center text-white text-3xl font-black group-hover:scale-110 transition-transform duration-500">{m.nom?.[0]}</div>
                                            }
                                        </div>
                                    </div>
                                    
                                    {/* Member info */}
                                    <h4 className="font-extrabold text-base text-[#003058] truncate mb-1 group-hover:text-[#187840] transition-colors">{m.nom}</h4>
                                    <p className="text-xs text-[#187840] font-black uppercase tracking-wider mb-4 h-5 flex items-center justify-center">{m.poste}</p>
                                    
                                    {/* Badge */}
                                    <div className="mb-4">
                                        <span className="inline-block text-[9px] font-black text-slate-500 bg-[#F8F0F0] px-3.5 py-1.5 rounded-full border border-[#C8C8C8]/50 uppercase tracking-widest shadow-sm group-hover:bg-[#187840]/10 group-hover:border-[#187840]/30 group-hover:text-[#187840] transition-colors">
                                            {m.classe}
                                        </span>
                                    </div>

                                    {/* Social links (interactive) */}
                                    <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                                        <a href="#contact" className="w-7 h-7 rounded-full bg-[#003058]/10 hover:bg-[#003058] hover:text-white flex items-center justify-center text-[#003058] transition-all duration-200">
                                            <FacebookIcon />
                                        </a>
                                        <a href="#contact" className="w-7 h-7 rounded-full bg-[#187840]/10 hover:bg-[#187840] hover:text-white flex items-center justify-center text-[#187840] transition-all duration-200">
                                            <LinkedInIcon />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── ACTIVITÉS & MÉDIAS (Dynamique) ── */}
                <section id="activites-medias" className="py-20 bg-[#F8F0F0] border-t border-b border-gray-100 px-6 scroll-mt-20 overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="badge-navy mb-3">Vie du Club</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#003058]">Actualités, Activités & Médias</h2>
                            <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">Suivez nos événements, participez à nos ateliers et revivez en images les moments forts du club.</p>
                        </div>

                        {/* Navigation des Sous-Onglets */}
                        <div className="flex justify-center mb-10">
                            <div className="bg-white p-1.5 rounded-2xl border border-gray-200/60 shadow-sm flex gap-2">
                                <button 
                                    onClick={() => setActiveTab('activites')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'activites' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                    🚀 Événements & Activités
                                </button>
                                <button 
                                    onClick={() => setActiveTab('medias')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'medias' ? 'bg-[#003058] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                                    📸 Galerie Médias
                                </button>
                            </div>
                        </div>

                        {activeTab === 'activites' ? (
                            <div>
                                {/* Filtres de catégories pour Activités */}
                                <div className="flex justify-center gap-2 flex-wrap mb-8">
                                    {['tous', 'Hackathon', 'Workshop', 'Conférence', 'Formation'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => setFiltreAct(f)}
                                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${filtreAct === f ? 'bg-[#187840] text-white border-[#187840] shadow-sm' : 'bg-white text-slate-500 border-[#C8C8C8]/60 hover:border-[#187840] hover:text-[#187840]'}`}>
                                            {f === 'tous' ? 'Tous' : f}
                                        </button>
                                    ))}
                                </div>

                                {/* Grille des Activités */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {ACTIVITES.filter(act => filtreAct === 'tous' || act.type === filtreAct).map((act) => (
                                        <motion.div key={act.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between group transition-all duration-300">
                                            <div>
                                                <div className="h-48 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-[#003058]/20 group-hover:bg-transparent transition-colors z-10" />
                                                    <img src={act.img} alt={act.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-[#003058] text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 shadow-sm">
                                                        {act.type}
                                                    </span>
                                                </div>
                                                <div className="p-6">
                                                    <div className="text-[10px] font-extrabold text-[#187840] mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                                        <Calendar size={12} /> {act.date}
                                                    </div>
                                                    <h3 className="text-base font-extrabold text-[#003058] mb-3 group-hover:text-[#187840] transition-colors">{act.titre}</h3>
                                                    <p className="text-xs text-slate-500 leading-relaxed text-justify">{act.desc}</p>
                                                </div>
                                            </div>
                                            <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between gap-4">
                                                <div className="text-xs font-medium text-slate-400">
                                                    {act.places > 0 ? (
                                                        <span className="text-[#187840] font-bold">{act.places} place(s) restante(s)</span>
                                                    ) : (
                                                        <span className="text-red-500 font-bold">Complet</span>
                                                    )}
                                                </div>
                                                {inscriptions[act.id] ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-[#187840] font-black uppercase tracking-wider bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                                        <Check size={14} /> Inscrit
                                                    </span>
                                                ) : act.places > 0 ? (
                                                    <button 
                                                        onClick={() => inscrireActivite(act)}
                                                        className="bg-[#003058] hover:bg-[#002850] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-sm">
                                                        S'inscrire
                                                    </button>
                                                ) : (
                                                    <button 
                                                        disabled
                                                        className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed">
                                                        Fermé
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Galerie Médias */
                            <div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {MEDIAS.map((media) => (
                                        <motion.div key={media.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setLightboxImage(media)}
                                            className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200/80 aspect-[4/3] cursor-pointer group">
                                            <img src={media.url} alt={media.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                                                <span className="text-[9px] uppercase font-black tracking-widest text-[#187840] mb-1 bg-white px-2 py-0.5 rounded-full w-max">{media.type}</span>
                                                <h4 className="font-extrabold text-xs tracking-wide truncate">{media.titre}</h4>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── UFR MET — MAQUETTES (données Firestore) ── */}
                <section id="ufr-met" className="py-16 bg-[#F8F0F0] border-t border-b border-gray-100 px-6 scroll-mt-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-extrabold text-[#003058]">L'UFR Métiers & Technologies</h2>
                            <p className="text-gray-500 text-xs mt-1">Visualisez ou téléchargez les maquettes réelles de vos filières.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* IT */}
                            <div className="bg-white border border-[#C8C8C8] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-[#003058] mb-2">Informatique & Télécommunications (IT)</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed text-justify mb-6">
                                        Cette filière forme les futurs experts du numérique à travers un cursus rigoureux mêlant développement d'applications, administration de bases de données, sécurité des réseaux Cisco et administration Linux avancée.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-auto">
                                    <button onClick={() => maqIT ? ouvrirFichier(maqIT.url, maqIT.nom) : alert('Maquette IT non disponible.')}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg transition-colors">
                                        Voir la maquette
                                    </button>
                                    <button onClick={() => maqIT ? déclencherTéléchargement(maqIT.url, maqIT.nom) : alert('Maquette IT non disponible.')}
                                        className="flex-1 bg-[#003058] hover:bg-[#002850] text-white py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <span>Télécharger</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* HEC */}
                            <div className="bg-white border border-[#C8C8C8] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-[#003058] mb-2">Hautes Études Commerciales (HEC)</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed text-justify mb-6">
                                        Orientée vers la gestion et la stratégie d'entreprise, cette filière prépare aux métiers de la finance globale, de l'audit de performance, du contrôle analytique et du management international.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-auto">
                                    <button onClick={() => maqHEC ? ouvrirFichier(maqHEC.url, maqHEC.nom) : alert('Maquette HEC non disponible.')}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg transition-colors">
                                        Voir la maquette
                                    </button>
                                    <button onClick={() => maqHEC ? déclencherTéléchargement(maqHEC.url, maqHEC.nom) : alert('Maquette HEC non disponible.')}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <span>Télécharger</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── CONTACT ── */}
                <section id="contact" className="py-16 px-6 max-w-xl mx-auto scroll-mt-20">
                    <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                        <h3 className="text-lg font-black text-[#003058] mb-1 text-center">Formulaire de Contact</h3>
                        <p className="text-slate-400 text-[11px] text-center mb-6 font-semibold">Portail de communication avec les instances du Bureau.</p>
                        
                        <form onSubmit={gererSoumissionContact} className="space-y-4">
                            {/* Banderoles de Statut */}
                            <AnimatePresence>
                                {contactStatus && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-2.5 overflow-hidden ${
                                            contactStatus.type === 'success' 
                                                ? 'bg-green-50 text-[#125e31] border-green-200' 
                                                : 'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                        <span className="mt-0.5 select-none shrink-0">
                                            {contactStatus.type === 'success' ? '✅' : '⚠️'}
                                        </span>
                                        <span>{contactStatus.msg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Nom Complet */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom Complet</label>
                                <input 
                                    type="text" 
                                    value={nomContact}
                                    onChange={e => {
                                        setNomContact(e.target.value);
                                        if (contactErrors.nom) setContactErrors(p => ({ ...p, nom: null }));
                                    }}
                                    disabled={contactSubmitting}
                                    placeholder="Fatou Diop"
                                    className={`input-field ${contactErrors.nom ? 'border-red-400 focus:ring-red-200' : ''}`} 
                                />
                                {contactErrors.nom && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">⚠️ {contactErrors.nom}</p>
                                )}
                            </div>

                            {/* Adresse Email Pro */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adresse Email Pro</label>
                                <input 
                                    type="email" 
                                    value={emailContact}
                                    onChange={e => {
                                        setEmailContact(e.target.value);
                                        if (contactErrors.email) setContactErrors(p => ({ ...p, email: null }));
                                    }}
                                    disabled={contactSubmitting}
                                    placeholder="votre.nom@ucak.edu.sn"
                                    className={`input-field ${contactErrors.email ? 'border-red-400 focus:ring-red-200' : ''}`} 
                                />
                                {contactErrors.email && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">⚠️ {contactErrors.email}</p>
                                )}
                            </div>

                            {/* Numéro de Téléphone */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Numéro de Téléphone (Optionnel)</label>
                                <input 
                                    type="tel" 
                                    value={telContact}
                                    onChange={e => {
                                        setTelContact(e.target.value);
                                        if (contactErrors.telephone) setContactErrors(p => ({ ...p, telephone: null }));
                                    }}
                                    disabled={contactSubmitting}
                                    placeholder="+221 77 000 00 00"
                                    className={`input-field ${contactErrors.telephone ? 'border-red-400 focus:ring-red-200' : ''}`} 
                                />
                                {contactErrors.telephone && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">⚠️ {contactErrors.telephone}</p>
                                )}
                            </div>

                            {/* Message / Requête */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Votre Message</label>
                                <textarea 
                                    rows="3" 
                                    value={msgContact}
                                    onChange={e => {
                                        setMsgContact(e.target.value);
                                        if (contactErrors.message) setContactErrors(p => ({ ...p, message: null }));
                                    }}
                                    disabled={contactSubmitting}
                                    placeholder="Décrivez votre demande ou suggestion..."
                                    className={`input-field resize-none ${contactErrors.message ? 'border-red-400 focus:ring-red-200' : ''}`} 
                                />
                                {contactErrors.message && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">⚠️ {contactErrors.message}</p>
                                )}
                            </div>

                            <button 
                                type="submit"
                                disabled={contactSubmitting}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-50">
                                {contactSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span>Transmission en cours...</span>
                                    </>
                                ) : (
                                    <span>Soumettre la demande</span>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

            </main>

            {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
            <footer className="bg-[#003058] text-white pt-10 pb-4 px-6 border-t border-slate-800 text-xs">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                    {/* Contacts */}
                    <div className="space-y-3">
                        <h5 className="font-bold text-[#187840] uppercase tracking-wider">Contacts</h5>
                        <div className="text-slate-400 space-y-3 leading-relaxed">
                            <div className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span>Complexe Universitaire de Touba, Mbacké, Sénégal</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+221338000000" className="hover:text-white underline">+221 33 800 00 00</a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:contact.met@ucak.edu.sn" className="hover:text-white underline">contact.met@ucak.edu.sn</a>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-300 uppercase tracking-wider">Navigation</h5>
                        <ul className="space-y-1 text-slate-400">
                            <li><a href="#about-club" className="hover:text-[#187840] transition-colors">L'Institution</a></li>
                            <li><a href="#fonctionnement" className="hover:text-[#187840] transition-colors">Règlement Interne</a></li>
                            <li><a href="#composition-bureau" className="hover:text-[#187840] transition-colors">Le Bureau</a></li>
                            <li><a href="#ufr-met" className="hover:text-[#187840] transition-colors">L'UFR MET</a></li>
                        </ul>
                    </div>

                    {/* Maquettes */}
                    <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-300 uppercase tracking-wider">Espace Maquettes</h5>
                        <ul className="space-y-1 text-slate-400">
                            <li><a href="https://ucak.edu.sn" target="_blank" rel="noopener noreferrer" className="hover:text-[#187840]">Portail UCAK ↗</a></li>
                            <li><button onClick={() => maqIT ? ouvrirFichier(maqIT.url, maqIT.nom) : alert('Maquette IT non disponible.')} className="hover:text-[#187840] text-left">Maquette IT</button></li>
                            <li><button onClick={() => maqHEC ? ouvrirFichier(maqHEC.url, maqHEC.nom) : alert('Maquette HEC non disponible.')} className="hover:text-[#187840] text-left">Maquette HEC</button></li>
                        </ul>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="space-y-2">
                        <h5 className="font-bold text-slate-300 uppercase tracking-wider">Réseaux Officiels</h5>
                        <div className="flex flex-col space-y-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-slate-400 hover:text-[#1877F2] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors shrink-0"><FacebookIcon /></span>
                                <span>Facebook</span>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-slate-400 hover:text-[#E1306C] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#E1306C]/20 flex items-center justify-center transition-colors shrink-0"><InstagramIcon /></span>
                                <span>Instagram</span>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-slate-400 hover:text-[#0A66C2] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#0A66C2]/20 flex items-center justify-center transition-colors shrink-0"><LinkedInIcon /></span>
                                <span>LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center text-slate-500 border-t border-slate-800 pt-4 text-[10px]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src="/images/logo-CMET.jpeg" alt="" className="w-7 h-7 rounded-full object-cover opacity-70" />
                        <span className="text-slate-400 font-semibold text-[11px] tracking-wide">CLUB-MET</span>
                    </div>
                    <span>© {new Date().getFullYear()} Club-MET UCAK. Tous droits réservés.</span>
                </div>
            </footer>
            {/* Toast Notification */}
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
                    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 overflow-hidden relative text-slate-800">
                            <button 
                                onClick={() => setInscrireModal(null)}
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
                                    <input 
                                        type="text" 
                                        required
                                        value={nomInscrit}
                                        onChange={e => setNomInscrit(e.target.value)}
                                        placeholder="Ex: Fatou Diop"
                                        className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold"
                                    />
                                </div>
                                <div className="text-left">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adresse Email Pro</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={emailInscrit}
                                        onChange={e => setEmailInscrit(e.target.value)}
                                        placeholder="Ex: fatou.diop@ucak.edu.sn"
                                        className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-[#187840] hover:bg-green-600 text-white py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md mt-6 flex items-center justify-center gap-2">
                                    Valider mon inscription
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Media Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <div 
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out">
                        <button 
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-55">
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