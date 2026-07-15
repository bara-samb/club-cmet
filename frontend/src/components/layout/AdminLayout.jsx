import React from 'react';
import { Users, UserCheck, FileText, CreditCard, LayoutDashboard, Mail, Bell, Calendar, Camera } from '../ui/Icons';
import DashboardShell from './DashboardShell';

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

export default function AdminLayout() {
    return (
        <DashboardShell
            panelLabel="Admin Panel"
            topbarContext="Administration"
            menuItems={menuItems}
            crossNav={{ to: '/student/dashboard', label: 'Espace Étudiant' }}
        />
    );
}
