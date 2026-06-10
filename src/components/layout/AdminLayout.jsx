import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, FileText, Settings, LayoutDashboard, LogOut, ChevronLeft } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function AdminLayout() {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/panel', label: 'Dashboard', Icon: LayoutDashboard },
        { path: '/admin/manage-users', label: 'Membres', Icon: Users },
        { path: '/admin/manage-docs', label: 'Documents', Icon: FileText },
        { path: '/admin/settings', label: 'Paramètres', Icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Admin */}
            <aside className="w-64 bg-[#0f213a] text-white p-6 flex flex-col shrink-0">
                <div className="mb-10">
                    <h1 className="text-xl font-black text-white">Club-MET</h1>
                    <p className="text-[#22c55e] text-xs font-semibold tracking-wider uppercase mt-1">Admin Panel</p>
                </div>

                <nav className="flex-grow space-y-2">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#22c55e] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <item.Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <Link to="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition">
                        <ChevronLeft size={16} /> Retour au site
                    </Link>
                    <button onClick={() => supabase.auth.signOut()} className="flex w-full items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Contenu principal */}
            <main className="flex-grow overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}