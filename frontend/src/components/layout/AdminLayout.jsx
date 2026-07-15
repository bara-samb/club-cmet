import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, FileText, CreditCard, LayoutDashboard, LogOut, ChevronLeft, Menu, X, Mail, Bell, Calendar, Camera } from '../ui/Icons';
import useAuth from '../../hooks/useAuth';

export default function AdminLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();

    const menuItems = [
        { path: '/admin/panel', label: 'Dashboard', Icon: LayoutDashboard },
        { path: '/admin/users', label: 'Utilisateurs', Icon: Users },
        { path: '/admin/manage-users', label: 'Bureau', Icon: UserCheck },
        { path: '/admin/manage-docs', label: 'Documents', Icon: FileText },
        { path: '/admin/manage-cotisations', label: 'Cotisations', Icon: CreditCard },
        { path: '/admin/manage-messages', label: 'Messages', Icon: Mail },
        { path: '/admin/manage-notifications', label: 'Notifications', Icon: Bell },
        { path: '/admin/events', label: 'Événements', Icon: Calendar },
        { path: '/admin/media', label: 'Médias', Icon: Camera },
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-[#003058] text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-8 h-8 rounded-full object-cover border border-[#003058]/60" />
                    <div>
                        <h1 className="text-base font-black text-white leading-none">Club-MET</h1>
                        <p className="text-[#187840] text-[9px] font-semibold tracking-wider uppercase mt-0.5">Admin Panel</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={signOut} title="Déconnexion" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                        <LogOut size={20} />
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Overlay pour mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar Admin */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#003058] text-white p-6 flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="mb-10 hidden md:flex items-center gap-3">
                    <img src="/images/logo-CMET.png" alt="Logo Club-MET" className="w-10 h-10 rounded-full object-cover border-2 border-[#003058]/60" />
                    <div>
                        <h1 className="text-lg font-black text-white leading-none">Club-MET</h1>
                        <p className="text-[#187840] text-xs font-semibold tracking-wider uppercase mt-1">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex-grow space-y-2">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={closeMobileMenu}
                            className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#187840] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <item.Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
                    <Link to="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition">
                        <ChevronLeft size={16} /> Retour au site
                    </Link>
                    <button onClick={signOut} className="flex w-full items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Zone de contenu principale */}
            <main className="flex-grow overflow-y-auto w-full relative flex flex-col min-h-screen">
                {/* Desktop Topbar */}
                <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 justify-between items-center shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 font-mono">Administration</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-[#003058]">{location.pathname.split('/').pop().toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* User Profile Info */}
                        <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#003058] flex items-center justify-center text-white text-xs font-bold">{user?.prenom?.[0]}</div>
                            )}
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-700 leading-none">{user?.prenom} {user?.nom}</span>
                                <span className="text-[9px] text-[#187840] font-black uppercase mt-1">Administrateur</span>
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