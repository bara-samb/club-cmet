import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Settings, LayoutDashboard, Mail } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function AdminPanel() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { count, error } = await supabase
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
        { title: "Gérer les Membres", path: "/admin/manage-users", icon: Users, desc: "Ajouter ou supprimer des membres du bureau" },
        { title: "Espace Documentaire", path: "/admin/manage-docs", icon: FileText, desc: "Ajouter des ressources (Règlements, Rapports...)" },
        { title: "Messages de Contact", path: "/admin/manage-messages", icon: Mail, desc: "Lire et gérer les messages reçus du formulaire", badge: unreadCount },
        { title: "Paramètres Club", path: "/admin/settings", icon: Settings, desc: "Configuration générale du site" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-4 md:p-6">
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
                        <h1 className="text-3xl font-black tracking-tight">Panel Administrateur</h1>
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
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#187840]/30 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-[#F8F0F0] rounded-2xl flex items-center justify-center mb-6 text-[#003058] group-hover:bg-[#187840] group-hover:text-white transition-colors duration-300 border border-slate-100 group-hover:border-[#187840]">
                            <action.icon size={26} strokeWidth={2}/>
                        </div>
                        {action.badge !== undefined && action.badge > 0 && (
                            <span className="absolute top-6 right-6 bg-red-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-sm tracking-wide">
                                {action.badge} non lu{action.badge > 1 ? 's' : ''}
                            </span>
                        )}
                        <h3 className="text-lg font-black text-[#003058] mb-2 tracking-tight leading-tight">{action.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}