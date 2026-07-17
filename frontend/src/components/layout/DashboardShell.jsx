import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, X, ChevronLeft, Sun, Moon, SwitchView, MoreHorizontal, Mail, MessageSquare, Download } from '../ui/Icons';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { supabase } from '../../config/supabaseClient';

/**
 * Charpente commune aux espaces Admin et Étudiant : sidebar desktop, topbar
 * desktop, et — côté mobile — une bottom tab bar unique (items principaux +
 * bouton "Plus") au lieu d'un menu hamburger, pour une ergonomie identique
 * quel que soit le rôle. AdminLayout / StudentLayout ne font que passer leur
 * configuration (menu, items prioritaires mobile, lien de bascule de rôle).
 */
export default function DashboardShell({ panelLabel, topbarContext, menuItems, mobilePrimary, crossNav }) {
    const location = useLocation();
    const isAdminPanel = location.pathname.startsWith('/admin');
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState([]); // liste pour le dropdown cloche (admin)

    const primaryItems = mobilePrimary
        ? mobilePrimary.map(path => menuItems.find(i => i.path === path)).filter(Boolean)
        : menuItems.slice(0, 4);
    const moreItems = menuItems.filter(item => !primaryItems.includes(item));

    // PWA States
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    );
    const [showBanner, setShowBanner] = useState(
        (!window.matchMedia('(display-mode: standalone)').matches && window.navigator.standalone !== true) &&
        !sessionStorage.getItem('app_install_banner_dismissed')
    );
    const [showInstallGuide, setShowInstallGuide] = useState(false);
    const [deviceType, setDeviceType] = useState('other');

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setDeviceType('ios');
        } else if (/android/.test(userAgent)) {
            setDeviceType('android');
        } else {
            setDeviceType('desktop');
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowBanner(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Fonction utilitaire pour envoyer des notifications locales natives
    const sendLocalNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body,
                    icon: '/images/logo-CMET.png',
                    badge: '/icons/pwa-192.png'
                });
            } catch (err) {
                // Fallback service worker notification
                navigator.serviceWorker?.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: '/images/logo-CMET.png',
                        badge: '/icons/pwa-192.png'
                    });
                }).catch(e => console.error("SW notification error:", e));
            }
        }
    };

    // Demander la permission de notifications locales natives au chargement
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        let active = true;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('id', { ascending: false })
                .limit(5);

            if (data && active) {
                setNotifications(data);
                const lastReadId = parseInt(localStorage.getItem('last_read_notif_id') || '0', 10);
                const unread = data.filter(n => n.id > lastReadId).length;
                setUnreadCount(unread);
            }
        };

        fetchNotifications();

        const channel = supabase.channel('layout-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                fetchNotifications();
                // Notifier l'étudiant
                if (!isAdminPanel) {
                    sendLocalNotification("Annonce officielle du Club-MET", payload.new.message);
                }
            })
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, [isAdminPanel]);

    useEffect(() => {
        if (!user) return;
        let active = true;

        const fetchUnreadMessages = async () => {
            try {
                if (user.role === 'admin') {
                    // Admin: fetch full list of unread messages for the bell dropdown
                    const { data, error } = await supabase
                        .from('messages')
                        .select('id, nom, email, message, created_at')
                        .eq('statut', 'non_lu')
                        .order('created_at', { ascending: false })
                        .limit(10);
                    if (!error && active) {
                        setUnreadMessages(data || []);
                        setUnreadMessagesCount((data || []).length);
                    }
                } else {
                    // Étudiant: filtrer par email (pas de colonne user_id dans messages)
                    const { data, error } = await supabase
                        .from('messages')
                        .select('id, message, statut, created_at')
                        .eq('email', user.email)
                        .eq('statut', 'non_lu')
                        .order('created_at', { ascending: false });
                    if (!error && active) {
                        setUnreadMessages(data || []);
                        setUnreadMessagesCount((data || []).length);
                    }
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchUnreadMessages();

        const channel = supabase.channel('layout-messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                fetchUnreadMessages();
                if (isAdminPanel) {
                    sendLocalNotification(`Nouveau message de ${payload.new.nom}`, payload.new.message);
                } else {
                    if (payload.new.email === user.email) {
                        sendLocalNotification("Réponse de l'administration", payload.new.message);
                    }
                }
            })
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, [user, isAdminPanel]);

    // Badge sur l'icône de l'application (PWA installée)
    useEffect(() => {
        if (!('setAppBadge' in navigator)) return;
        const total = isAdminPanel ? unreadMessagesCount : (unreadCount + unreadMessagesCount);
        if (total > 0) {
            navigator.setAppBadge(total).catch(() => {});
        } else {
            navigator.clearAppBadge().catch(() => {});
        }
    }, [unreadCount, unreadMessagesCount, isAdminPanel]);

    const toggleNotifDropdown = () => {
        setIsNotifOpen(!isNotifOpen);
        if (!isNotifOpen && notifications.length > 0) {
            const maxId = Math.max(...notifications.map(n => n.id));
            localStorage.setItem('last_read_notif_id', maxId.toString());
            setUnreadCount(0);
        }
    };

    // Marquer un message comme lu depuis le dropdown de la cloche (admin seulement)
    const markMessageAsRead = async (msgId) => {
        try {
            await supabase.from('messages').update({ statut: 'lu' }).eq('id', msgId);
            setUnreadMessages(prev => prev.filter(m => m.id !== msgId));
            setUnreadMessagesCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Erreur marquage message lu:', err);
        }
    };

    // Auto-clear notification badge when on the notifications history page
    useEffect(() => {
        const isNotifPage = location.pathname.includes('notification');
        if (isNotifPage && notifications.length > 0) {
            const maxId = Math.max(...notifications.map(n => n.id));
            localStorage.setItem('last_read_notif_id', maxId.toString());
            setUnreadCount(0);
        }
    }, [location.pathname, notifications]);

    const handleInstallApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                setIsInstalled(true);
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        } else {
            setShowInstallGuide(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9]/85 dark:bg-ucak-dark/90 flex flex-col md:flex-row transition-colors">
            {/* Mobile Header */}
            <div className="md:hidden bg-[#003058] text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-8 h-8 rounded-full object-cover border border-[#003058]/60" />
                    <div>
                        <h1 className="text-base font-black text-white leading-none">Club-MET</h1>
                        <p className="text-[#187840] text-[9px] font-semibold tracking-wider uppercase mt-0.5">{panelLabel}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggleTheme} title="Changer de thème" className="p-2 text-white/80 hover:text-white rounded-lg transition">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Messages Icon Mobile */}
                    <Link to={isAdminPanel ? '/admin/manage-messages' : '/student/tutorat'} className="p-2 text-white/80 hover:text-white rounded-lg transition relative">
                        {isAdminPanel ? <Mail size={20} /> : <MessageSquare size={20} />}
                        {isAdminPanel && unreadMessagesCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                {unreadMessagesCount}
                            </span>
                        )}
                    </Link>

                    {/* Notification Bell Mobile — Seulement pour l'étudiant */}
                    {!isAdminPanel && (
                        <div className="relative">
                            <button onClick={toggleNotifDropdown} className="p-2 text-white/80 hover:text-white rounded-lg transition relative">
                                <Bell size={20} />
                                {(unreadCount + unreadMessagesCount) > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount + unreadMessagesCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Dropdown Mobile Overlay */}
            {isNotifOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-end p-4 pt-16" onClick={() => setIsNotifOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative w-80 bg-white dark:bg-ucak-dark-card rounded-2xl shadow-2xl p-4 flex flex-col max-h-[400px] z-50 text-slate-800 dark:text-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <span>Notifications & Messages</span>
                            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="overflow-y-auto flex-grow mt-2 space-y-1">
                            {/* Messages non lus de l'étudiant */}
                            {unreadMessages.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 mb-1">📩 Réponses du Bureau</p>
                                    {unreadMessages.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { markMessageAsRead(m.id); setIsNotifOpen(false); }}
                                            className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/10 mb-1 group transition-colors"
                                        >
                                            <p className="text-xs font-bold text-[#003058] dark:text-white truncate">Message du Bureau</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{m.message}</p>
                                            <p className="text-[9px] text-[#187840] font-bold mt-1 group-hover:underline">Marquer comme lu →</p>
                                        </button>
                                    ))}
                                    <div className="border-t border-slate-100 dark:border-white/10 my-2" />
                                </div>
                            )}
                            {/* Notifications broadcast */}
                            {notifications.length === 0 && unreadMessages.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400 italic">Aucune notification.</div>
                            ) : notifications.map(n => (
                                <div key={n.id} className="py-2.5 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#187840] mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar — desktop uniquement, la navigation mobile passe par la bottom bar */}
            <aside className="hidden md:flex md:relative w-64 bg-[#003058] text-white p-6 flex-col shrink-0 overflow-y-auto">
                <div className="mb-10 flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-10 h-10 rounded-full object-cover border-2 border-[#003058]/60" />
                    <div>
                        <h1 className="text-lg font-black text-white leading-none">Club-MET</h1>
                        <p className="text-[#187840] text-xs font-semibold tracking-wider uppercase mt-1">{panelLabel}</p>
                    </div>
                </div>

                <nav className="flex-grow space-y-2">
                    {menuItems.map((item) => {
                        const isNotif = item.path.includes('notification');
                        const isMsg = item.path.includes('message') || item.path.includes('tutorat');
                        const count = isNotif 
                            ? (user?.role === 'admin' ? 0 : unreadCount) 
                            : (isMsg ? (user?.role === 'admin' ? unreadMessagesCount : 0) : 0);

                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center justify-between p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#187840] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                                <div className="flex items-center gap-3">
                                    <item.Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {count > 0 && (
                                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shrink-0">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
                    {!isInstalled && (
                        <div className="bg-[#187840]/10 border border-[#187840]/25 rounded-2xl p-4 text-center">
                            <p className="text-[11px] text-slate-300 font-medium mb-2.5 leading-relaxed">
                                Installez l'application mobile pour une meilleure expérience.
                            </p>
                            <button 
                                onClick={handleInstallApp} 
                                className="w-full bg-[#187840] hover:bg-[#125e31] text-white text-[11px] font-bold py-2 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                                <Download size={14} /> Installer l'app
                            </button>
                        </div>
                    )}
                    {crossNav && (
                        <Link to={crossNav.to} className="flex items-center gap-3 p-3 text-[#187840] bg-[#187840]/10 hover:bg-[#187840]/20 rounded-xl transition font-bold text-sm">
                            <SwitchView size={18} /> {crossNav.label}
                        </Link>
                    )}
                    <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
                        <ChevronLeft size={16} /> Retour au site
                    </Link>
                    <button onClick={signOut} className="flex w-full items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Bottom Tab Bar — mobile uniquement, uniforme pour Admin et Étudiant */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-ucak-dark-card border-t border-slate-200 dark:border-white/10 h-16 flex items-center justify-around text-slate-500 dark:text-slate-400 px-1 shadow-lg">
                {primaryItems.map((item) => {
                    const active = location.pathname === item.path;
                    const isNotif = item.path.includes('notification');
                    const isMsg = item.path.includes('message') || item.path.includes('tutorat');
                    const count = isNotif 
                        ? (isAdminPanel ? 0 : (unreadCount + unreadMessagesCount)) 
                        : (isMsg ? (isAdminPanel ? unreadMessagesCount : 0) : 0);

                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 relative ${active ? 'text-[#187840]' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <div className="relative">
                                <item.Icon size={20} className="mb-0.5" />
                                {count > 0 && (
                                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse animate-duration-1000">
                                        {count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
                <button onClick={() => setIsMoreOpen(true)}
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 relative ${isMoreOpen ? 'text-[#187840]' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    <div className="relative">
                        <MoreHorizontal size={20} className="mb-0.5" />
                        {(() => {
                            const moreCount = moreItems.reduce((acc, item) => {
                                const isNotif = item.path.includes('notification');
                                const isMsg = item.path.includes('message') || item.path.includes('tutorat');
                                const itemVal = isNotif 
                                    ? (isAdminPanel ? 0 : (unreadCount + unreadMessagesCount)) 
                                    : (isMsg ? (isAdminPanel ? unreadMessagesCount : 0) : 0);
                                return acc + itemVal;
                            }, 0);
                            return moreCount > 0 ? (
                                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse animate-duration-1000">
                                    {moreCount}
                                </span>
                            ) : null;
                        })()}
                    </div>
                    <span className="text-[9px] font-bold tracking-wide">Plus</span>
                </button>
            </div>

            {/* Feuille "Plus" — mobile uniquement : reste du menu + actions de compte */}
            {isMoreOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex items-end" onClick={() => setIsMoreOpen(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative w-full bg-white dark:bg-ucak-dark-card rounded-t-3xl shadow-2xl p-5 pb-8 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-white/10">
                            <span className="font-black text-sm text-[#003058] dark:text-white uppercase tracking-wider">Menu</span>
                            <button onClick={() => setIsMoreOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-2">
                            {moreItems.map(item => {
                                const isNotif = item.path.includes('notification');
                                const isMsg = item.path.includes('message') || item.path.includes('tutorat');
                                const count = isNotif 
                                    ? (isAdminPanel ? 0 : (unreadCount + unreadMessagesCount)) 
                                    : (isMsg ? (isAdminPanel ? unreadMessagesCount : 0) : 0);

                                return (
                                    <Link key={item.path} to={item.path} onClick={() => setIsMoreOpen(false)}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center transition relative ${location.pathname === item.path ? 'bg-[#187840]/10 text-[#187840]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                        <div className="relative">
                                            <item.Icon size={22} />
                                            {count > 0 && (
                                                <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse animate-duration-1000">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold leading-tight">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 space-y-1">
                            {!isInstalled && (
                                <button onClick={() => { setIsMoreOpen(false); handleInstallApp(); }}
                                    className="flex w-full items-center gap-3 p-3 text-[#187840] hover:bg-[#187840]/10 rounded-xl transition text-sm font-semibold mb-1">
                                    <Download size={18} /> Télécharger l'application
                                </button>
                            )}
                            {crossNav && (
                                <Link to={crossNav.to} onClick={() => setIsMoreOpen(false)}
                                    className="flex items-center gap-3 p-3 text-[#187840] bg-[#187840]/10 rounded-xl font-bold text-sm mb-1">
                                    <SwitchView size={18} /> {crossNav.label}
                                </Link>
                            )}
                            <Link to="/" onClick={() => setIsMoreOpen(false)}
                                className="flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 rounded-xl text-sm">
                                <ChevronLeft size={18} /> Retour au site
                            </Link>
                            <button onClick={signOut}
                                className="flex w-full items-center gap-3 p-3 text-red-500 dark:text-red-300 hover:bg-red-500/10 rounded-xl transition text-sm font-semibold">
                                <LogOut size={18} /> Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone de contenu principale */}
            <main className="flex-grow overflow-y-auto w-full relative flex flex-col min-h-screen pb-20 md:pb-0">
                {/* Desktop Topbar */}
                <header className="hidden md:flex bg-white dark:bg-ucak-dark-card border-b border-slate-200 dark:border-white/10 px-8 py-4 justify-between items-center shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 font-mono">{topbarContext}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-[#003058] dark:text-white">{location.pathname.split('/').pop().toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isInstalled && (
                            <button
                                onClick={handleInstallApp}
                                title="Installer l'application Club-MET"
                                className="flex items-center gap-2 text-xs font-bold text-[#187840] hover:bg-[#187840]/10 px-3 py-2 rounded-xl transition-colors"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Télécharger l'app</span>
                            </button>
                        )}

                        <button onClick={toggleTheme} title="Changer de thème" className="p-2 text-slate-400 hover:text-[#003058] dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Messages Icon Desktop */}
                        <Link to={isAdminPanel ? '/admin/manage-messages' : '/student/tutorat'} title="Messages" className="p-2 text-slate-500 hover:text-[#003058] dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition relative">
                            {isAdminPanel ? <Mail size={20} /> : <MessageSquare size={20} />}
                            {isAdminPanel && unreadMessagesCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadMessagesCount}
                                </span>
                            )}
                        </Link>

                        {/* Notification Bell Desktop — Seulement pour l'étudiant */}
                        {!isAdminPanel && (
                            <div className="relative">
                                <button onClick={toggleNotifDropdown} className="p-2 text-slate-500 hover:text-[#003058] dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition relative">
                                    <Bell size={20} />
                                    {(unreadCount + unreadMessagesCount) > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount + unreadMessagesCount}
                                        </span>
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-ucak-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 p-4 text-slate-800 dark:text-slate-100 z-50">
                                            <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                                                <span>Notifications & Messages</span>
                                                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                            </div>
                                            <div className="overflow-y-auto max-h-72 mt-2 space-y-1">
                                                {/* Messages non lus de l'étudiant */}
                                                {unreadMessages.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 mb-1">📩 Réponses du Bureau</p>
                                                        {unreadMessages.map(m => (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => { markMessageAsRead(m.id); setIsNotifOpen(false); }}
                                                                className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/10 mb-1 group transition-colors"
                                                            >
                                                                <p className="text-xs font-bold text-[#003058] dark:text-white truncate">Message du Bureau</p>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{m.message}</p>
                                                                <p className="text-[9px] text-[#187840] font-bold mt-1 group-hover:underline">Marquer comme lu →</p>
                                                            </button>
                                                        ))}
                                                        <div className="border-t border-slate-100 dark:border-white/10 my-2" />
                                                    </div>
                                                )}
                                                {/* Notifications broadcast */}
                                                {notifications.length === 0 && unreadMessages.length === 0 ? (
                                                    <div className="text-center py-6 text-xs text-slate-400 italic">Aucune notification.</div>
                                                ) : notifications.map(n => (
                                                    <div key={n.id} className="py-2.5 flex items-start gap-2 text-left">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#187840] mt-1.5 shrink-0" />
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                                                <Link to="/student/notifications" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-[#187840] hover:underline">Voir l'historique complet</Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* User Profile Info */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-white/10">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#003058] flex items-center justify-center text-white text-xs font-bold">{user?.prenom?.[0]}</div>
                            )}
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-100 leading-none">{user?.prenom} {user?.nom}</span>
                                <span className="text-[9px] text-[#187840] font-black uppercase mt-1">{user?.role === 'admin' ? 'Administrateur' : (user?.niveau || 'Étudiant')}</span>
                            </div>
                        </div>

                        {/* Logout Icon */}
                        <button onClick={signOut} title="Déconnexion" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* Sub-page Content */}
                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="w-full"
                        >
                            <Outlet context={{ isInstalled, handleInstallApp }} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Bannière de bienvenue / installation PWA */}
            {showBanner && (
                <div className="fixed bottom-20 md:bottom-6 left-6 right-6 md:left-auto md:w-96 bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 p-5 rounded-3xl shadow-2xl z-40 flex flex-col gap-3 anim-fade-up text-slate-800 dark:text-white">
                    <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#187840]/10 flex items-center justify-center text-[#187840] shrink-0">
                            <Download size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-extrabold text-sm text-[#003058] dark:text-white">Installer l'application Club-MET</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Accédez plus rapidement à vos tutorats, documents et notifications en ajoutant l'application sur votre écran d'accueil.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-1.5">
                        <button 
                            onClick={() => {
                                setShowBanner(false);
                                sessionStorage.setItem('app_install_banner_dismissed', 'true');
                            }} 
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition"
                        >
                            Plus tard
                        </button>
                        <button 
                            onClick={handleInstallApp} 
                            className="flex-1 py-2 bg-[#187840] hover:bg-[#125e31] text-white font-bold rounded-xl text-xs transition shadow-sm"
                        >
                            Installer
                        </button>
                    </div>
                </div>
            )}

            {/* Guide d'installation PWA Modal */}
            {showInstallGuide && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInstallGuide(false)}>
                    <div className="bg-white dark:bg-ucak-dark-card rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-slate-800 dark:text-white text-left" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                            <X size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-12 h-12 rounded-full bg-[#187840]/10 flex items-center justify-center text-[#187840] mb-4">
                                <Download size={24} />
                            </div>
                            <h3 className="font-black text-lg text-[#003058] dark:text-white mb-2">Comment installer Club-MET</h3>
                            <p className="text-xs text-slate-500 mb-6">
                                Suivez ces étapes simples pour ajouter l'application sur votre écran d'accueil.
                            </p>
                        </div>

                        <div className="space-y-4 text-xs">
                            {deviceType === 'ios' ? (
                                <>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                                        <p className="text-slate-600 dark:text-slate-300">Appuyez sur le bouton de partage <span className="font-bold">"Partager"</span> (icône avec une flèche vers le haut en bas de votre écran).</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                                        <p className="text-slate-600 dark:text-slate-300">Faites défiler le menu et sélectionnez l'option <span className="font-bold">"Sur l'écran d'accueil"</span>.</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                                        <p className="text-slate-600 dark:text-slate-300">Appuyez sur <span className="font-bold">"Ajouter"</span> dans le coin supérieur droit pour confirmer.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                                        <p className="text-slate-600 dark:text-slate-300">Appuyez sur l'icône de menu du navigateur (les <span className="font-bold">trois points</span> verticaux en haut à droite).</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                                        <p className="text-slate-600 dark:text-slate-300">Sélectionnez <span className="font-bold">"Installer l'application"</span> ou <span className="font-bold">"Ajouter à l'écran d'accueil"</span>.</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="w-5 h-5 rounded-full bg-[#187840] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                                        <p className="text-slate-600 dark:text-slate-300">Validez l'installation en suivant les indications affichées par votre navigateur.</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={() => setShowInstallGuide(false)}
                            className="w-full mt-6 py-3 bg-[#003058] hover:bg-[#002850] text-white font-bold rounded-xl transition text-xs shadow-md"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
