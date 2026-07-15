import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2 } from '../../components/ui/Icons';

export default function Contact() {
    const [nomContact, setNomContact] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [telContact, setTelContact] = useState('');
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

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-12">
            {/* Header Banner */}
            <div className="bg-[#003058] text-white py-12 px-6 text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Contactez-nous</h1>
                <p className="text-slate-300 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                    Vous avez une suggestion, une question ou besoin d'aide ? Envoyez-nous un message.
                </p>
            </div>

            <section className="py-16 px-6 max-w-xl mx-auto">
                <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <h3 className="text-lg font-black text-[#003058] mb-1 text-center">Formulaire de Contact</h3>
                    <p className="text-slate-400 text-[11px] text-center mb-6 font-semibold">Portail de communication avec les instances du Bureau.</p>

                    <form onSubmit={gererSoumissionContact} className="space-y-4">
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

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom Complet</label>
                            <input type="text" value={nomContact}
                                onChange={e => { setNomContact(e.target.value); if (contactErrors.nom) setContactErrors(p => ({ ...p, nom: null })); }}
                                disabled={contactSubmitting} placeholder="Fatou Diop"
                                className={`input-field ${contactErrors.nom ? 'border-red-400 focus:ring-red-200' : ''}`} />
                            {contactErrors.nom && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.nom}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adresse Email Pro</label>
                            <input type="email" value={emailContact}
                                onChange={e => { setEmailContact(e.target.value); if (contactErrors.email) setContactErrors(p => ({ ...p, email: null })); }}
                                disabled={contactSubmitting} placeholder="votre.nom@ucak.edu.sn"
                                className={`input-field ${contactErrors.email ? 'border-red-400 focus:ring-red-200' : ''}`} />
                            {contactErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Numéro de Téléphone (Optionnel)</label>
                            <input type="tel" value={telContact}
                                onChange={e => { setTelContact(e.target.value); if (contactErrors.telephone) setContactErrors(p => ({ ...p, telephone: null })); }}
                                disabled={contactSubmitting} placeholder="+221 77 000 00 00"
                                className={`input-field ${contactErrors.telephone ? 'border-red-400 focus:ring-red-200' : ''}`} />
                            {contactErrors.telephone && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.telephone}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Votre Message</label>
                            <textarea rows="3" value={msgContact}
                                onChange={e => { setMsgContact(e.target.value); if (contactErrors.message) setContactErrors(p => ({ ...p, message: null })); }}
                                disabled={contactSubmitting} placeholder="Décrivez votre demande ou suggestion..."
                                className={`input-field resize-none ${contactErrors.message ? 'border-red-400 focus:ring-red-200' : ''}`} />
                            {contactErrors.message && <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{contactErrors.message}</p>}
                        </div>

                        <button type="submit" disabled={contactSubmitting}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-50">
                            {contactSubmitting ? (
                                <><Loader2 className="animate-spin w-4 h-4" /><span>Transmission en cours...</span></>
                            ) : (
                                <span>Soumettre la demande</span>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
