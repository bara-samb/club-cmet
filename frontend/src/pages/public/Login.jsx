// src/pages/public/Login.jsx
import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronLeft } from "../../components/ui/Icons";

const ERRORS = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "Email not confirmed": "Veuillez confirmer votre adresse email.",
};

export default function Login() {
    const [form, setForm]       = useState({ email: "", password: "" });
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const infoMessage = location.state?.info;

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data, error: err } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password
            });
            if (err) throw err;

            // Fetch role and approval status to redirect correctly
            const { data: profile } = await supabase
                .from('users')
                .select('role, approuve')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'admin' && profile?.approuve === false) {
                await supabase.auth.signOut();
                throw new Error("Votre compte administrateur est en attente d'approbation par un administrateur existant.");
            }

            if (profile?.role === 'admin') {
                navigate("/admin/panel");
            } else {
                navigate("/student/dashboard");
            }
        } catch (err) {
            setError(ERRORS[err.message] || err.message || "Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-ucak-dark">

            {/* ── Panneau institutionnel ── */}
            <div className="relative md:w-[42%] md:min-h-screen bg-[#003058] text-white flex flex-col justify-between px-8 md:px-12 py-10 md:py-14 overflow-hidden shrink-0">
                {/* Trame de points, très discrète — évoque la grille technique du MET */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
                />
                {/* Empreinte du logo, géante et estompée, en fond de plan */}
                <img
                    src="/images/logo-CMET.png"
                    alt=""
                    className="absolute -right-28 -bottom-28 w-[26rem] h-[26rem] object-cover rounded-full opacity-[0.06] pointer-events-none select-none"
                />

                <div className="relative flex items-center gap-1">
                    <Link to="/" aria-label="Retour à l'accueil" title="Retour à l'accueil"
                        className="flex items-center justify-center w-9 h-9 -ml-2 rounded-full text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                        <ChevronLeft size={20} />
                    </Link>
                    <Link to="/" className="flex items-center gap-3 w-max">
                        <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                        <span className="font-extrabold tracking-wide text-sm">CLUB-MET</span>
                    </Link>
                </div>

                <div className="relative mt-14 md:mt-0">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-[#4ade80] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6">
                        UFR Métiers &amp; Technologies · UCAK
                    </span>
                    <h1 className="text-3xl md:text-[2.5rem] leading-[1.12] font-extrabold tracking-tight">
                        L'entraide académique,<br className="hidden md:block" /> organisée.
                    </h1>
                    <p className="text-slate-300 text-sm mt-5 max-w-sm leading-relaxed">
                        Tutorat par les pairs, ressources partagées et vie associative du Club Métiers &amp; Technologies — tout au même endroit.
                    </p>
                </div>

                <div className="relative hidden md:flex items-center gap-5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Fondé en 2024</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>UCAK · Touba</span>
                </div>
            </div>

            {/* ── Formulaire ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-14 md:py-10">
                <div className="anim-fade-up w-full max-w-sm">
                    <h2 className="text-[#003058] dark:text-white font-extrabold text-2xl tracking-tight">Connexion</h2>
                    <p className="text-slate-400 text-sm mt-1.5 mb-8">Entrez vos identifiants pour accéder à votre espace.</p>

                    {infoMessage && (
                        <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl px-4 py-3 mb-6 font-medium">
                            <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {infoMessage}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-xl px-4 py-3 mb-6">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handle} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                            <input type="email" required value={form.email}
                                   onChange={e => setForm({ ...form, email: e.target.value })}
                                   placeholder="prenom.nom@ucak.edu.sn"
                                   className="input-underline" />
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline mb-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                                <span className="text-[10px] text-[#187840] dark:text-[#4ade80] font-semibold cursor-pointer hover:underline">
                                    Mot de passe oublié ?
                                </span>
                            </div>
                            <input type="password" required value={form.password}
                                   onChange={e => setForm({ ...form, password: e.target.value })}
                                   placeholder="••••••••"
                                   className="input-underline" />
                        </div>

                        <button type="submit" disabled={loading}
                                className="btn-primary w-full mt-2 group disabled:opacity-60">
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowUpRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="text-[#187840] dark:text-[#4ade80] font-bold hover:underline">S'inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
