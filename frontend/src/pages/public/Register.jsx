// src/pages/public/Register.jsx
import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "../../components/ui/Icons";
import Toast from '../../components/ui/Toast';
import AuthShell from "../../components/layout/AuthShell";

import { NIVEAUX } from "../../config/constants";

const ERRORS = {
    "User already registered": "Cet email est déjà utilisé.",
};

export default function Register() {
    const [form, setForm]       = useState({ prenom:"", nom:"", email:"", niveau:"", password:"", confirm:"" });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState(null);
    const navigate = useNavigate();

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const F = key => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) { 
            const msg = "Les mots de passe ne correspondent pas.";
            setError(msg); 
            showToast(msg, "error");
            return; 
        }
        if (form.password.length < 6) { 
            const msg = "Mot de passe trop court (min. 6 caractères).";
            setError(msg); 
            showToast(msg, "error");
            return; 
        }
        if (!form.niveau) { 
            const msg = "Veuillez sélectionner votre niveau.";
            setError(msg); 
            showToast(msg, "error");
            return; 
        }

        setLoading(true);
        try {
            const { data, error: signupErr } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: `${form.prenom} ${form.nom}`
                    }
                }
            });
            if (signupErr) throw signupErr;

            const user = data.user;
            if (user) {
                const { error: insertErr } = await supabase
                    .from("users")
                    .insert({
                        id: user.id,
                        nom: form.nom,
                        prenom: form.prenom,
                        email: form.email,
                        niveau: form.niveau,
                        role: 'student',
                        approuve: true
                    });
                if (insertErr) throw insertErr;
            }

            navigate("/student/dashboard");
        } catch (err) {
            const msg = ERRORS[err.message] || err.message || "Erreur lors de l'inscription.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            headline={<>Rejoins la communauté<br className="hidden md:block" /> Club-MET.</>}
            description="Un seul espace pour ton tutorat, tes ressources et la vie du club — crée ton compte étudiant en une minute."
            maxWidth="max-w-md"
        >
            <h2 className="text-[#003058] dark:text-white font-extrabold text-2xl tracking-tight">Créer un compte</h2>
            <p className="text-slate-400 text-sm mt-1.5 mb-8">Rejoins la communauté Club-MET.</p>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-xl px-4 py-3 mb-6">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handle} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prénom *</label>
                        <input type="text" required {...F("prenom")} placeholder="Mamadou"
                               className="input-underline" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nom *</label>
                        <input type="text" required {...F("nom")} placeholder="Diop"
                               className="input-underline" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" required {...F("email")} placeholder="prenom.nom@ucak.edu.sn"
                           className="input-underline" />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Niveau / Classe *</label>
                    <div className="relative">
                        <select required value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}
                                className="input-underline appearance-none pr-7 font-semibold cursor-pointer">
                            <option value="">— Sélectionner votre niveau —</option>
                            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe *</label>
                        <input type="password" required {...F("password")} placeholder="Min. 6 car."
                               className="input-underline" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirmer *</label>
                        <input type="password" required {...F("confirm")} placeholder="••••••••"
                               className="input-underline" />
                    </div>
                </div>

                <button type="submit" disabled={loading}
                        className="btn-primary w-full mt-2 disabled:opacity-60">
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Inscription...
                        </>
                    ) : "Créer mon compte"}
                </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-8">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-[#187840] dark:text-[#4ade80] font-bold hover:underline">Se connecter</Link>
            </p>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </AuthShell>
    );
}
