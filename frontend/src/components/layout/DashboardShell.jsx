import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, X, ChevronLeft, Sun, Moon, SwitchView, MoreHorizontal } from '../ui/Icons';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { supabase } from '../../config/supabaseClient';
import InstallAppButton from '../ui/InstallAppButton';

/**
 * Charpente commune aux espaces Admin et Étudiant : sidebar desktop, topbar
 * desktop, et — côté mobile — une bottom tab bar unique (items principaux +
 * bouton "Plus") au lieu d'un menu hamburger, pour une ergonomie identique
 * quel que soit le rôle. AdminLayout / StudentLayout ne font que passer leur
 * configuration (menu, items prioritaires mobile, lien de bascule de rôle).
 */
export default function DashboardShell({ panelLabel, topbarContext, menuItems, mobilePrimary, crossNav }) {
    const location = useLocation();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const primaryItems = mobilePrimary
        ? mobilePrimary.map(path => menuItems.find(i => i.path === path)).filter(Boolean)
        : menuItems.slice(0, 4);
    const moreItems = menuItems.filter(item => !primaryItems.includes(item));

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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, []);

    // Badge sur l'icône de l'application (PWA installée) — reflète les
    // notifications non lues tant qu'un onglet/service worker est actif.
    useEffect(() => {
        if (!('setAppBadge' in navigator)) return;
        if (unreadCount > 0) {
            navigator.setAppBadge(unreadCount).catch(() => {});
        } else {
            navigator.clearAppBadge().catch(() => {});
        }
    }, [unreadCount]);

    const toggleNotifDropdown = () => {
        setIsNotifOpen(!isNotifOpen);
        if (!isNotifOpen && notifications.length > 0) {
            const maxId = Math.max(...notifications.map(n => n.id));
            localStorage.setItem('last_read_notif_id', maxId.toString());
            setUnreadCount(0);
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

                    <div className="relative">
                        <button onClick={toggleNotifDropdown} className="p-2 text-white/80 hover:text-white rounded-lg transition relative">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Dropdown Mobile Overlay */}
            {isNotifOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-end p-4 pt-16" onClick={() => setIsNotifOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative w-80 bg-white dark:bg-ucak-dark-card rounded-2xl shadow-2xl p-4 flex flex-col max-h-[350px] z-50 text-slate-800 dark:text-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="overflow-y-auto flex-grow divide-y divide-slate-50 dark:divide-white/5 mt-2">
                            {notifications.length === 0 ? (
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
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#187840] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                            <item.Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
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
                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${active ? 'text-[#187840]' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <item.Icon size={20} className="mb-0.5" />
                            <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
                <button onClick={() => setIsMoreOpen(true)}
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${isMoreOpen ? 'text-[#187840]' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    <MoreHorizontal size={20} className="mb-0.5" />
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
                            {moreItems.map(item => (
                                <Link key={item.path} to={item.path} onClick={() => setIsMoreOpen(false)}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center transition ${location.pathname === item.path ? 'bg-[#187840]/10 text-[#187840]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                    <item.Icon size={22} />
                                    <span className="text-[10px] font-bold leading-tight">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 space-y-1">
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
                                className="flex w-full items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition text-sm font-semibold">
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
                        <InstallAppButton />

                        <button onClick={toggleTheme} title="Changer de thème" className="p-2 text-slate-400 hover:text-[#003058] dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notification Bell Desktop */}
                        <div className="relative">
                            <button onClick={toggleNotifDropdown} className="p-2 text-slate-500 hover:text-[#003058] dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition relative">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-ucak-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 p-4 text-slate-800 dark:text-slate-100 z-50">
                                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                                            <span>Notifications</span>
                                            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                        </div>
                                        <div className="overflow-y-auto max-h-60 divide-y divide-slate-50 dark:divide-white/5 mt-2">
                                            {notifications.length === 0 ? (
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
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
