import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Users, UserCheck, FileText, CreditCard, LayoutDashboard, Mail, Bell, Calendar, Image, Download } from '../../components/ui/Icons';
import { supabase } from '../../config/supabaseClient';

export default function AdminPanel() {
    const [unreadCount, setUnreadCount] = useState(0);
    const { isInstalled, handleInstallApp } = useOutletContext() || {};

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('statut', 'non_lu');
                if (count !== null) setUnreadCount(count);
            } catch (err) {
                console.error("Erreur comptage messages non lus:", err);
            }
        };

        fetchUnreadCount();

        // Abonnement temps réel
        const channel = supabase.channel('admin-panel-messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUnreadCount)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const adminActions = [
        { title: "Comptes Utilisateurs", path: "/admin/users", icon: Users, desc: "Gérer les permissions, rôles et accès des utilisateurs" },
        { title: "Membres du Bureau", path: "/admin/manage-users", icon: UserCheck, desc: "Ajouter ou supprimer des membres officiels du bureau" },
        { title: "Espace Documentaire", path: "/admin/manage-docs", icon: FileText, desc: "Ajouter des ressources (Règlements, Rapports...)" },
        { title: "Gestion Cotisations", path: "/admin/manage-cotisations", icon: CreditCard, desc: "Lien Wave, validation des transferts et versements manuels" },
        { title: "Messages de Contact", path: "/admin/manage-messages", icon: Mail, desc: "Lire et gérer les messages reçus du formulaire", badge: unreadCount },
        { title: "Notifications", path: "/admin/manage-notifications", icon: Bell, desc: "Diffuser une information à tous les étudiants" },
        { title: "Événements & Activités", path: "/admin/events", icon: Calendar, desc: "Gérer les actualités et événements du club" },
        { title: "Galerie Médias", path: "/admin/media", icon: Image, desc: "Gérer les photos et vidéos de la galerie" },
    ];

    return (
        <div className="anim-fade-up space-y-8 max-w-5xl mx-auto p-4 md:p-6">

            {/* PWA Install Card — n'apparaît que si l'app n'est pas installée */}
            {!isInstalled && handleInstallApp && (
                <div className="anim-fade-up bg-gradient-to-r from-[#003058] to-[#004a8a] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg shadow-[#003058]/20 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <Download size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-extrabold text-sm leading-snug">Installer l'application Club-MET</p>
                            <p className="text-white/60 text-xs mt-0.5">Accès rapide depuis votre écran d'accueil</p>
                        </div>
                    </div>
                    <button
                        onClick={handleInstallApp}
                        className="shrink-0 bg-[#187840] hover:bg-[#125e31] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                    >
                        Télécharger
                    </button>
                </div>
            )}
            {/* Header Admin */}
            <div className="bg-[#003058] p-8 md:p-10 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-[#003058]/10">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="relative z-10 flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#187840]/20 rounded-2xl">
                        <LayoutDashboard className="text-[#187840] w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Panel Administrateur</h1>
                        <p className="text-slate-400 mt-1 text-sm font-medium">Gestion centralisée de la plateforme Club-MET</p>
                    </div>
                </div>
            </div>

            {/* Grille d'actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminActions.map((action, idx) => (
                    <Link
                        key={idx}
                        to={action.path}
                        className="bg-white dark:bg-ucak-dark-card p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-[#187840]/30 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl flex items-center justify-center mb-6 text-[#003058] dark:text-white group-hover:bg-[#187840] group-hover:text-white transition-colors duration-300 border border-slate-100 dark:border-white/10 group-hover:border-[#187840]">
                            <action.icon size={26} strokeWidth={2} />
                        </div>
                        {action.badge !== undefined && action.badge > 0 && (
                            <span className="absolute top-6 right-6 bg-red-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-sm tracking-wide">
                                {action.badge} non lu{action.badge > 1 ? 's' : ''}
                            </span>
                        )}
                        <h3 className="text-lg font-black text-[#003058] dark:text-white mb-2 tracking-tight leading-tight">{action.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}