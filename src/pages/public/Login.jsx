// src/pages/public/Login.jsx
import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const ERRORS = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "Email not confirmed": "Veuillez confirmer votre adresse email.",
};

export default function Login() {
    const [form, setForm]       = useState({ email: "", password: "" });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { error: err } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password
            });
            if (err) throw err;
            navigate("/student/dashboard");
        } catch (err) {
            setError(ERRORS[err.message] || err.message || "Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f213a] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-[#0f213a] px-8 py-8 text-center border-b border-slate-700">
                    <img src="/images/logo-CMET.jpeg" alt="Club-MET"
                         className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-[#22c55e]/50 object-cover" />
                    <p className="text-white font-extrabold text-base tracking-tight">CLUB-MET</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">UFR Métiers & Technologies · UCAK</p>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                    <h2 className="text-[#0f213a] font-bold text-lg mb-1">Connexion</h2>
                    <p className="text-slate-400 text-xs mb-6">Accédez à votre espace personnel Club-MET.</p>

                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 mb-5">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handle} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                            <input type="email" required value={form.email}
                                   onChange={e => setForm({ ...form, email: e.target.value })}
                                   placeholder="prenom.nom@ucak.edu.sn"
                                   className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-colors" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mot de passe</label>
                                <span className="text-[10px] text-[#22c55e] font-semibold cursor-pointer hover:underline">
                  Mot de passe oublié ?
                </span>
                            </div>
                            <input type="password" required value={form.password}
                                   onChange={e => setForm({ ...form, password: e.target.value })}
                                   placeholder="••••••••"
                                   className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-colors" />
                        </div>

                        <button type="submit" disabled={loading}
                                className="w-full bg-[#22c55e] hover:bg-green-600 text-white py-3 rounded-xl text-xs font-bold shadow-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Connexion...
                                </>
                            ) : "Se connecter"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="text-[#22c55e] font-bold hover:underline">S'inscrire</Link>
                    </p>
                    <div className="text-center mt-3">
                        <Link to="/" className="text-[10px] text-slate-400 hover:text-slate-600">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}