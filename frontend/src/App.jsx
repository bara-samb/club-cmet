import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import useAuth from './hooks/useAuth';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Club from './pages/public/Club';
import Fonctionnement from './pages/public/Fonctionnement';
import BureauPublic from './pages/public/BureauPublic';
import UfrMet from './pages/public/UfrMet';
import Contact from './pages/public/Contact';
import Dashboard from './pages/student/Dashboard';
import Library from './pages/student/Library';
import Resources from './pages/student/Resources';
import Bureau from './pages/student/Bureau';
import Profile from './pages/student/Profile';
import Cotisations from './pages/student/Cotisations';
import TutoratHub from './pages/student/TutoratHub';
import NotificationsHistory from './pages/student/NotificationsHistory';
import AdminPanel from './pages/admin/AdminPanel';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDocs from './pages/admin/ManageDocs';
import ManageCotisations from './pages/admin/ManageCotisations';
import ManageMessages from './pages/admin/ManageMessages';
import ManageEvents from './pages/admin/ManageEvents';
import ManageMedia from './pages/admin/ManageMedia';
import ManageNotifications from './pages/admin/ManageNotifications';
import ManageRegisteredUsers from './pages/admin/ManageRegisteredUsers';

/* ── Guards de protection ── */

function RequireAuth({ children }) {
    const { session, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] text-[#003058] font-bold text-sm gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Chargement...
            </div>
        );
    }
    
    return session ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] text-[#003058] font-bold text-sm gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Vérification...
            </div>
        );
    }

    return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

/* ── App Principal ── */

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    {/* Routes Publiques */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/club" element={<Club />} />
                        <Route path="/fonctionnement" element={<Fonctionnement />} />
                        <Route path="/bureau" element={<BureauPublic />} />
                        <Route path="/ufr-met" element={<UfrMet />} />
                        <Route path="/contact" element={<Contact />} />
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Routes Étudiant */}
                    <Route path="/student" element={<RequireAuth><StudentLayout /></RequireAuth>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="library" element={<Library />} />
                        <Route path="resources" element={<Resources />} />
                        <Route path="bureau" element={<Bureau />} />
                        <Route path="cotisations" element={<Cotisations />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="tutorat" element={<TutoratHub />} />
                        <Route path="notifications" element={<NotificationsHistory />} />
                    </Route>

                    {/* Routes Admin */}
                    <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                        <Route index element={<Navigate to="panel" replace />} />
                        <Route path="panel" element={<AdminPanel />} />
                        <Route path="manage-users" element={<ManageUsers />} />
                        <Route path="manage-docs" element={<ManageDocs />} />
                        <Route path="manage-cotisations" element={<ManageCotisations />} />
                        <Route path="manage-messages" element={<ManageMessages />} />
                        <Route path="manage-notifications" element={<ManageNotifications />} />
                        <Route path="events" element={<ManageEvents />} />
                        <Route path="media" element={<ManageMedia />} />
                        <Route path="users" element={<ManageRegisteredUsers />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}