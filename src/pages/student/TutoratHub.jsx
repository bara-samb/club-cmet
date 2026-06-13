import React, { useState } from 'react';
import { Send, CheckCircle2, ListFilter } from 'lucide-react';

export default function Tutoring() {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Simulation de l'historique des requêtes de l'étudiant connecté
    const myRequests = [
        { id: 1, subject: "Algorithmique & Pointeurs en C", status: "Validé", date: "20/05/2026", tutor: "B. Ndiaye" },
        { id: 2, subject: "Mathématiques financières - Annuités", status: "En attente", date: "21/05/2026", tutor: "Aucun pour le moment" }
    ];

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        // Plus tard relié à Firestore / Supabase pour stocker la demande
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSubject('');
            setDescription('');
        }, 4000);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FORMULAIRE DE DEMANDE (2 TIERS) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#003058]">Demander une assistance</h1>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">Vous rencontrez des difficultés sur un module ou un TP ? Décrivez votre besoin et nous vous affecterons un tuteur.</p>
                        </div>

                        {submitted && (
                            <div className="bg-[#187840]/10 text-[#187840] p-4 rounded-xl border border-[#187840]/20 flex items-start gap-3 text-sm font-semibold">
                                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                                <span>Votre demande de tutorat a bien été enregistrée ! Le responsable de la commission vous contactera sous peu.</span>
                            </div>
                        )}

                        <form onSubmit={handleRequestSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 ml-1">Matière ou Élément constitutif (ECUE)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Systèmes d'exploitation, Microéconomie, Java..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 ml-1">Précisez vos difficultés ou points de blocage</label>
                                <textarea
                                    rows="5"
                                    required
                                    placeholder="Expliquez brièvement ce que vous aimeriez revoir..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-field"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-[#003058] hover:bg-[#002850] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
                                <Send size={16} />
                                <span>Envoyer ma demande</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* SUIVIS DES DEMANDES (1 TIER) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                        <div className="flex items-center gap-2 font-bold text-[#003058] border-b border-slate-100 pb-4 mb-4">
                            <ListFilter size={18} className="text-[#187840]" />
                            <h2>Suivi de mes demandes</h2>
                        </div>

                        <div className="space-y-4">
                            {myRequests.map((req) => (
                                <div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-[#F8F0F0] text-xs space-y-2 hover:border-[#187840]/30 transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-[#003058] text-sm leading-tight">{req.subject}</h3>
                                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] shrink-0 border ${
                                            req.status === 'Validé' ? 'bg-[#187840]/10 text-[#187840] border-[#187840]/20' : 'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 space-y-1 mt-2">
                                        <p className="flex justify-between">
                                            <span>Demandé le :</span>
                                            <span className="font-semibold text-slate-700">{req.date}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>Tuteur :</span>
                                            <span className="font-bold text-slate-700">{req.tutor}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}