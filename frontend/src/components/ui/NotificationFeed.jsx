import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Bell, X } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationFeed() {
    const [notification, setNotification] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchLatestNotification = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                setNotification(data[0]);
                setIsVisible(true);
            }
        };

        fetchLatestNotification();

        const channel = supabase.channel('realtime-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
                setNotification(payload.new);
                setIsVisible(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!notification || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-ucak-dark-card border border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden mb-8"
            >
                <div className="absolute top-4 right-16 flex items-center gap-1.5 bg-red-500/10 text-red-600 px-3 py-1 rounded-full border border-red-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Message Live</span>
                </div>

                <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-white/10 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition">
                    <X size={16} />
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
                        <Bell className="text-blue-500" size={24} />
                    </div>

                    <div className="flex-grow space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#003058] dark:text-white tracking-tight">Information importante du Club-MET</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Diffusé le {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                            {notification.message}
                        </p>

                        {notification.image_url && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                                <a href={notification.image_url} target="_blank" rel="noopener noreferrer" className="inline-block group relative overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                                    <img src={notification.image_url} alt="Illustration du message" className="max-w-xs h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
