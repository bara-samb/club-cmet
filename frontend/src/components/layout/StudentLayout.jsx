import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, FolderOpen, User, MessageSquare, Bell, LogOut, Menu, X, ChevronLeft, Users, CreditCard } from '../ui/Icons';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../config/supabaseClient';

export default function StudentLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const menuItems = [
        { path: '/student/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { path: '/student/library', label: 'Bibliothèque', Icon: BookOpen },
        { path: '/student/resources', label: 'Documents', Icon: FolderOpen },
        { path: '/student/bureau', label: 'Le Bureau', Icon: Users },
        { path: '/student/cotisations', label: 'Cotisations', Icon: CreditCard },
        { path: '/student/tutorat', label: 'Messages', Icon: MessageSquare },
        { path: '/student/notifications', label: 'Notifications', Icon: Bell },
        { path: '/student/profile', label: 'Profil', Icon: User },
    ];

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

    const toggleNotifDropdown = () => {
        setIsNotifOpen(!isNotifOpen);
        if (!isNotifOpen && notifications.length > 0) {
            const maxId = Math.max(...notifications.map(n => n.id));
            localStorage.setItem('last_read_notif_id', maxId.toString());
            setUnreadCount(0);
        }
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-[#003058] text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-8 h-8 rounded-full object-cover border border-[#003058]/60" />
                    <div>
                        <h1 className="text-base font-bold text-[#187840] leading-none">Club-MET</h1>
                        <p className="text-white/70 text-[9px] font-medium tracking-wider uppercase mt-0.5">Espace Étudiant</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {/* Notification Bell Mobile */}
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

                    <button onClick={signOut} title="Déconnexion" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                        <LogOut size={20} />
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-white hover:bg-white/10 transition">
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Notification Dropdown Mobile Overlay */}
            {isNotifOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-end p-4 pt-16" onClick={() => setIsNotifOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative w-80 bg-white rounded-2xl shadow-2xl p-4 flex flex-col max-h-[350px] z-50 text-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="overflow-y-auto flex-grow divide-y divide-slate-50 mt-2">
                            {notifications.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400 italic">Aucune notification.</div>
                            ) : notifications.map(n => (
                                <div key={n.id} className="py-2.5 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#187840] mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay pour mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar Fixe */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#003058] text-white p-6 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="mb-10 hidden md:flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-10 h-10 rounded-full object-cover border-2 border-[#003058]/60" />
                    <div>
                        <h1 className="text-lg font-bold text-[#187840] leading-none">Club-MET</h1>
                        <p className="text-white/70 text-[10px] font-medium tracking-wider uppercase mt-1">Espace Étudiant</p>
                    </div>
                </div>

                <nav className="flex-grow space-y-2">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={closeMobileMenu}
                            className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#187840]/25 text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                            <item.Icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
                    <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
                        <ChevronLeft size={16} /> Retour au site
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition w-full">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Zone de contenu principale */}
            <main className="flex-grow overflow-y-auto w-full relative flex flex-col min-h-screen">
                {/* Desktop Topbar */}
                <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 justify-between items-center shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Espace Étudiant</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-[#003058]">{location.pathname.split('/').pop().toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell Desktop */}
                        <div className="relative">
                            <button onClick={toggleNotifDropdown} className="p-2 text-slate-500 hover:text-[#003058] rounded-xl hover:bg-slate-50 transition relative">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Desktop */}
                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 text-slate-800 z-50">
                                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex justify-between items-center">
                                            <span>Notifications</span>
                                            <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                        </div>
                                        <div className="overflow-y-auto max-h-60 divide-y divide-slate-50 mt-2">
                                            {notifications.length === 0 ? (
                                                <div className="text-center py-6 text-xs text-slate-400 italic">Aucune notification.</div>
                                            ) : notifications.map(n => (
                                                <div key={n.id} className="py-2.5 flex items-start gap-2 text-left">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#187840] mt-1.5 shrink-0" />
                                                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 text-center">
                                            <Link to="/student/notifications" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-[#187840] hover:underline">Voir l'historique complet</Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile Info */}
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#003058] flex items-center justify-center text-white text-xs font-bold">{user?.prenom?.[0]}</div>
                            )}
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-700 leading-none">{user?.prenom} {user?.nom}</span>
                                <span className="text-[9px] text-[#187840] font-semibold mt-1">{user?.niveau}</span>
                            </div>
                        </div>

                        {/* Logout Icon */}
                        <button onClick={signOut} title="Déconnexion" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
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