import React from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, User, MessageSquare, Bell, Users, CreditCard } from '../ui/Icons';
import useAuth from '../../hooks/useAuth';
import DashboardShell from './DashboardShell';

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

export default function StudentLayout() {
    const { user } = useAuth();

    return (
        <DashboardShell
            panelLabel="Espace Étudiant"
            topbarContext="Espace Étudiant"
            menuItems={menuItems}
            crossNav={user?.role === 'admin' ? { to: '/admin/panel', label: 'Espace Admin' } : null}
        />
    );
}
