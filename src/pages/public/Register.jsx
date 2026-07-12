// src/pages/public/Register.jsx
import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

import { NIVEAUX } from "../../config/constants";

const ERRORS = {
    "User already registered": "Cet email est déjà utilisé.",
};

export default function Register() {
    const [form, setForm]       = useState({ prenom:"", nom:"", email:"", niveau:"", password:"", confirm:"" });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const F = key => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        if (form.password.length < 6)       { setError("Mot de passe trop court (min. 6 caractères)."); return; }
        if (!form.niveau)                    { setError("Veuillez sélectionner votre niveau."); return; }

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
                        role: "student"
                    });
                if (insertErr) throw insertErr;
            }
            navigate("/student/dashboard");
        } catch (err) {
            setError(ERRORS[err.message] || err.message || "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#003058] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-[#003058] px-8 py-7 text-center border-b border-slate-700">
                    <img src="/images/logo-CMET.jpeg" alt="Club-MET"
                         className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-[#187840]/50 object-cover" />
                    <p className="text-white font-extrabold text-base tracking-tight">CLUB-MET</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">UFR Métiers & Technologies · UCAK</p>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                    <h2 className="text-[#003058] font-bold text-lg mb-1">Créer un compte</h2>
                    <p className="text-slate-400 text-xs mb-6">Rejoins la communauté Club-MET.</p>

                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 mb-5">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handle} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Prénom *</label>
                                <input type="text" required {...F("prenom")} placeholder="Mamadou"
                                       className="input-field" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nom *</label>
                                <input type="text" required {...F("nom")} placeholder="Diop"
                                       className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email *</label>
                            <input type="email" required {...F("email")} placeholder="prenom.nom@ucak.edu.sn"
                                   className="input-field" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Niveau / Classe *</label>
                            <select required value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}
                                    className="input-field bg-white">
                                <option value="">— Sélectionner votre niveau —</option>
                                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mot de passe *</label>
                            <input type="password" required {...F("password")} placeholder="Min. 6 caractères"
                                   className="input-field" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirmer le mot de passe *</label>
                            <input type="password" required {...F("confirm")} placeholder="••••••••"
                                   className="input-field" />
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

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Déjà inscrit ?{" "}
                        <Link to="/login" className="text-[#187840] font-bold hover:underline">Se connecter</Link>
                    </p>
                    <div className="text-center mt-3">
                        <Link to="/" className="text-[10px] text-slate-400 hover:text-slate-600">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}