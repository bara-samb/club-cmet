// src/pages/student/NotificationsHistory.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, AlertCircle, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatDateFull = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function NotificationsHistory() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        let active = true;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data && active) setNotifications(data);
            if (active) setLoading(false);
        };

        fetchNotifications();

        // Realtime — nouvelles notifications
        const channel = supabase
            .channel('notifs-history')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                if (active) setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            {/* ── En-tête ── */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Bell className="text-blue-500" size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#003058] tracking-tight">Historique des notifications</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Tous les messages diffusés par le Club-MET</p>
                </div>
                {!loading && notifications.length > 0 && (
                    <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">
                        {notifications.length} message{notifications.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* ── Contenu ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span className="text-sm">Chargement des notifications...</span>
                </div>
            ) : notifications.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-slate-300" size={28} />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">Aucune notification reçue pour le moment.</p>
                    <p className="text-xs text-slate-300 mt-1">Les messages du bureau apparaîtront ici.</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif, idx) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className={`bg-white rounded-2xl border border-slate-100 border-l-4 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${idx === 0 ? 'border-l-[#187840]' : 'border-l-[#003058]'}`}
                        >
                            {/* ── Header carte ── */}
                            <button
                                onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
                                className="w-full text-left px-5 py-4 flex items-start gap-4"
                            >
                                {/* Icône */}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${idx === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                                    <AlertCircle size={16} className={idx === 0 ? 'text-blue-500' : 'text-slate-400'} />
                                </div>

                                {/* Contenu principal */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs font-bold text-[#003058]">Information Club-MET</span>
                                        {idx === 0 && (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                                                Dernière
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {notif.message}
                                    </p>
                                </div>

                                {/* Date + chevron */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                        <Clock size={10} /> {formatDate(notif.created_at)}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${expandedId === notif.id ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* ── Contenu déroulant ── */}
                            <AnimatePresence>
                                {expandedId === notif.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-4">
                                            {/* Date complète */}
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                📅 Diffusé le {formatDateFull(notif.created_at)}
                                            </p>

                                            {/* Message complet */}
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {notif.message}
                                                </p>
                                            </div>

                                            {/* Image si présente */}
                                            {notif.image_url && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                        <ImageIcon size={10} /> Illustration
                                                    </p>
                                                    <a
                                                        href={notif.image_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group inline-block relative overflow-hidden rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-colors shadow-sm"
                                                    >
                                                        <img
                                                            src={notif.image_url}
                                                            alt="Illustration de la notification"
                                                            className="max-w-xs max-h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                        </div>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
