import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from '../ui/Icons';

/**
 * Charpente commune aux pages Connexion/Inscription.
 *
 * Mobile et desktop utilisent des structures VRAIMENT différentes plutôt
 * qu'un simple empilement : sur mobile, un bandeau compact (retour + logo)
 * précède directement le formulaire, qui reste visible sans défilement.
 * Le grand panneau institutionnel (accroche, texte, filigrane) n'existe
 * que sur desktop, où l'espace ne coûte rien.
 */
export default function AuthShell({ headline, description, maxWidth = 'max-w-sm', children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-ucak-dark">

            {/* ── Bandeau mobile compact (< md) ── */}
            <div className="md:hidden flex items-center gap-2 bg-[#003058] text-white px-3 py-2.5 shrink-0">
                <Link to="/" aria-label="Retour à l'accueil" title="Retour à l'accueil"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                    <ChevronLeft size={20} />
                </Link>
                <Link to="/" className="flex items-center gap-2">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-7 h-7 rounded-full object-cover border border-white/20" />
                    <span className="font-extrabold tracking-wide text-xs">CLUB-MET</span>
                </Link>
            </div>

            {/* ── Panneau institutionnel (desktop uniquement) ── */}
            <div className="hidden md:flex relative md:w-[42%] md:min-h-screen bg-[#003058] text-white flex-col justify-between px-8 md:px-12 py-10 md:py-14 overflow-hidden shrink-0">
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
                />
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

                <div className="relative">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-[#4ade80] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6">
                        UFR Métiers &amp; Technologies · UCAK
                    </span>
                    <h1 className="text-3xl md:text-[2.5rem] leading-[1.12] font-extrabold tracking-tight">
                        {headline}
                    </h1>
                    <p className="text-slate-300 text-sm mt-5 max-w-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="relative flex items-center gap-5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Fondé en 2024</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>UCAK · Touba</span>
                </div>
            </div>

            {/* ── Formulaire — visible immédiatement, sans défilement ── */}
            <div className="flex-1 flex items-start md:items-center justify-center px-6 py-6 md:py-10">
                <div className={`anim-fade-up w-full ${maxWidth}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
