import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, Phone, Mail } from '../../components/ui/Icons';

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
const WhatsAppIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.114-2.877-6.974-1.858-1.859-4.325-2.883-6.963-2.885-5.437 0-9.86 4.422-9.864 9.865-.001 1.73.454 3.42 1.32 4.925l-.995 3.635 3.71-.973zm11.514-5.29c-.07-.117-.258-.187-.54-.327-.281-.14-1.661-.82-1.919-.914-.258-.094-.446-.14-.633.14-.187.28-.725.914-.889 1.101-.164.186-.327.21-.609.07-.28-.14-1.187-.437-2.261-1.396-.836-.746-1.4-1.667-1.564-1.948-.164-.282-.018-.434.122-.574.127-.127.282-.328.422-.492.141-.164.188-.28.282-.469.094-.187.046-.351-.023-.49-.07-.14-.633-1.523-.867-2.086-.228-.547-.46-.473-.633-.482-.164-.008-.351-.01-.54-.01-.187 0-.491.07-.749.351-.258.282-.983.961-.983 2.343 0 1.382 1.006 2.719 1.147 2.907.14.187 1.98 3.024 4.797 4.237.67.289 1.192.462 1.6.593.673.214 1.287.184 1.77.112.54-.08 1.661-.68 1.896-1.336.234-.656.234-1.22.164-1.336z" />
    </svg>
);
const TikTokIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.17-.17-.25-.26V14c0 1.71-.35 3.48-1.4 4.88-1.5 2-4.12 2.95-6.55 2.5-2.2-.4-4.1-2.1-4.66-4.27-.7-2.73.48-5.91 3-7.16.85-.41 1.8-.62 2.75-.62.33 0 .66.02.99.07v4.13c-.33-.1-.67-.14-1.02-.13-1.63.02-3.13 1.19-3.48 2.78-.4 1.8.84 3.75 2.66 4.02 1.48.22 3.03-.54 3.55-1.93.2-.5.27-1.05.26-1.6V.02z" />
    </svg>
);

export default function Contact() {
    const [nomContact, setNomContact] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [telContact, setTelContact] = useState('');
    const [sujetContact, setSujetContact] = useState('tutorat');
    const [msgContact, setMsgContact] = useState('');
    const [contactErrors, setContactErrors] = useState({});
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactStatus, setContactStatus] = useState(null);

    const gererSoumissionContact = async (e) => {
        e.preventDefault();
        setContactStatus(null);

        const errors = {};
        if (!nomContact.trim()) errors.nom = "Le nom complet est requis.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailContact.trim()) {
            errors.email = "L'adresse email est requise.";
        } else if (!emailRegex.test(emailContact)) {
            errors.email = "L'adresse email n'est pas valide.";
        }

        if (telContact.trim()) {
            const cleanTel = telContact.replace(/[\s.-]/g, '');
            if (!/^\+?\d{8,15}$/.test(cleanTel)) {
                errors.telephone = "Le numéro de téléphone n'est pas valide.";
            }
        }

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

        setContactErrors({});
        setContactSubmitting(true);

        try {
            const sujetTexte = {
                tutorat: 'Soutien Académique / Tutorat',
                projet: 'Suggestion Projet Innovant',
                social: 'Action Sociale ou Maraude',
                adhesion: 'Adhésion ou Cotisation',
                autre: 'Autre Requête générale'
            }[sujetContact] || sujetContact;

            const { error } = await supabase.from('messages').insert([
                {
                    nom: nomContact.trim(),
                    email: emailContact.trim(),
                    telephone: telContact.trim() || null,
                    message: `[Sujet: ${sujetTexte}] ${msgContact.trim()}`,
                    statut: 'non_lu'
                }
            ]);
            if (error) throw error;
            setContactStatus({ type: 'success', msg: "Votre message a été transmis avec succès. Le bureau vous répondra dans les plus brefs délais." });
            setNomContact('');
            setEmailContact('');
            setTelContact('');
            setMsgContact('');
            setSujetContact('tutorat');
        } catch (err) {
            console.error("Erreur d'envoi du message:", err);
            setContactStatus({ type: 'error', msg: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer." });
        } finally {
            setContactSubmitting(false);
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* Header Banner */}
            <div className="bg-[#003058] text-white py-14 px-6 text-center border-b border-white/5">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Contact & Support</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Le Secrétariat Général et les commissions de travail sont à votre écoute.
                </p>
            </div>

            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Info & Details */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <span className="text-xs font-bold text-[#187840] uppercase tracking-widest bg-[#187840]/10 px-3 py-1.5 rounded-full border border-[#187840]/20">
                                Entrer en contact
                            </span>
                            <h2 className="text-3xl font-extrabold text-[#003058] mt-4 leading-tight">
                                Discutons de vos projets ou questions
                            </h2>
                            <p className="text-slate-500 text-sm mt-4 leading-relaxed text-justify">
                                Vous êtes étudiant de l'UFR MET et souhaitez participer à nos tutorats ? Ou vous êtes un partenaire désireux de soutenir nos commissions ? Remplissez le formulaire, notre équipe prendra en charge votre demande rapidement.
                            </p>
                        </div>

                        {/* Contact details */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#187840] shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Localisation</h4>
                                    <p className="text-xs font-bold text-slate-700 mt-1">Complexe Universitaire de Touba</p>
                                    <p className="text-[11px] text-slate-500">Mbacké, Sénégal</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#187840] shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Officiel</h4>
                                    <a href="mailto:contact.met@ucak.edu.sn" className="text-xs font-bold text-slate-700 hover:text-[#187840] transition-colors mt-1 block underline">
                                        contact.met@ucak.edu.sn
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#187840] shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Téléphone</h4>
                                    <a href="tel:+221338000000" className="text-xs font-bold text-slate-700 hover:text-[#187840] transition-colors mt-1 block underline">
                                        +221 33 800 00 00
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">Canaux Officiels</h4>
                            <div className="flex gap-3">
                                {[
                                    { href: 'https://facebook.com', icon: <FacebookIcon />, color: 'hover:bg-[#1877F2] hover:text-white' },
                                    { href: 'https://www.instagram.com/cmet_officiel?igsh=c2hqN2EwaXgyazV5', icon: <InstagramIcon />, color: 'hover:bg-[#E1306C] hover:text-white' },
                                    { href: 'https://wa.me/221787941004', icon: <WhatsAppIcon />, color: 'hover:bg-[#25D366] hover:text-white' },
                                    { href: 'https://www.tiktok.com/@cmet_officiel', icon: <TikTokIcon />, color: 'hover:bg-black hover:text-white' }
                                ].map((soc, i) => (
                                    <a
                                        key={i}
                                        href={soc.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 transition-all hover:scale-105 shadow-sm ${soc.color}`}
                                    >
                                        {soc.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Card */}
                    <div className="lg:col-span-7">
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                            <form onSubmit={gererSoumissionContact} className="space-y-5">
                                <AnimatePresence>
                                    {contactStatus && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-2.5 overflow-hidden ${contactStatus.type === 'success' ? 'bg-green-50 text-[#125e31] border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                            <span className="mt-0.5 select-none shrink-0">{contactStatus.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}</span>
                                            <span>{contactStatus.msg}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nom Complet</label>
                                        <input type="text" value={nomContact}
                                            onChange={e => { setNomContact(e.target.value); if (contactErrors.nom) setContactErrors(p => ({ ...p, nom: null })); }}
                                            disabled={contactSubmitting} placeholder="Fatou Diop"
                                            className={`input-field ${contactErrors.nom ? 'border-red-400 focus:ring-red-200' : ''}`} />
                                        {contactErrors.nom && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.nom}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Numéro de Téléphone (Optionnel)</label>
                                        <input type="tel" value={telContact}
                                            onChange={e => { setTelContact(e.target.value); if (contactErrors.telephone) setContactErrors(p => ({ ...p, telephone: null })); }}
                                            disabled={contactSubmitting} placeholder="+221 77 000 00 00"
                                            className={`input-field ${contactErrors.telephone ? 'border-red-400 focus:ring-red-200' : ''}`} />
                                        {contactErrors.telephone && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.telephone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adresse Email Académique</label>
                                        <input type="email" value={emailContact}
                                            onChange={e => { setEmailContact(e.target.value); if (contactErrors.email) setContactErrors(p => ({ ...p, email: null })); }}
                                            disabled={contactSubmitting} placeholder="votre.nom@ucak.edu.sn"
                                            className={`input-field ${contactErrors.email ? 'border-red-400 focus:ring-red-200' : ''}`} />
                                        {contactErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Objet du Message</label>
                                        <select
                                            value={sujetContact}
                                            onChange={e => setSujetContact(e.target.value)}
                                            disabled={contactSubmitting}
                                            className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/15"
                                        >
                                            <option value="tutorat">Soutien Académique / Tutorat</option>
                                            <option value="projet">Suggestion Projet Innovant</option>
                                            <option value="social">Action Sociale ou Maraude</option>
                                            <option value="adhesion">Adhésion ou Cotisation</option>
                                            <option value="autre">Autre Requête générale</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Votre Message</label>
                                    <textarea rows="4" value={msgContact}
                                        onChange={e => { setMsgContact(e.target.value); if (contactErrors.message) setContactErrors(p => ({ ...p, message: null })); }}
                                        disabled={contactSubmitting} placeholder="Rédigez votre message avec précision..."
                                        className={`input-field resize-none ${contactErrors.message ? 'border-red-400 focus:ring-red-200' : ''}`} />
                                    {contactErrors.message && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.message}</p>}
                                </div>

                                <button type="submit" disabled={contactSubmitting}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 disabled:opacity-50">
                                    {contactSubmitting ? (
                                        <><Loader2 className="animate-spin w-4 h-4" /><span>Transmission en cours...</span></>
                                    ) : (
                                        <span>Transmettre au Secrétariat</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
