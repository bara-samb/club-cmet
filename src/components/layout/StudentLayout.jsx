import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User, Users, LogOut } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function StudentLayout() {
    const location = useLocation();

    const menuItems = [
        { path: '/student/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { path: '/student/library', label: 'Bibliothèque', Icon: BookOpen },
        { path: '/student/tutorat', label: 'Tutorat', Icon: Users },
        { path: '/student/profile', label: 'Profil', Icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Fixe */}
            <aside className="w-64 bg-[#0f213a] text-white p-6 hidden md:flex flex-col">
                <h1 className="text-xl font-bold mb-10 text-[#22c55e]">Club-MET</h1>
                <nav className="flex-grow space-y-2">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'hover:bg-white/5'}`}>
                            <item.Icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition">
                    <LogOut size={20} /> Déconnexion
                </button>
            </aside>

            {/* Zone de contenu principale */}
            <main className="flex-grow overflow-y-auto">
                <Outlet /> {/* C'est ici que Dashboard, Library, etc. s'afficheront */}
            </main>
        </div>
    );
}