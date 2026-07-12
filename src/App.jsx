import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/student/Dashboard';
import Library from './pages/student/Library';
import Resources from './pages/student/Resources';
import Profile from './pages/student/Profile';
import TutoratHub from './pages/student/TutoratHub';
import NotificationsHistory from './pages/student/NotificationsHistory';
import AdminPanel from './pages/admin/AdminPanel';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDocs from './pages/admin/ManageDocs';
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
            <div className="min-h-screen flex items-center justify-center bg-[#F8F0F0] text-[#003058] font-bold text-sm gap-2">
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
            <div className="min-h-screen flex items-center justify-center bg-[#F8F0F0] text-[#003058] font-bold text-sm gap-2">
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

/* ── App Principal ── */

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Routes Publiques */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Routes Étudiant */}
                    <Route path="/student" element={<RequireAuth><StudentLayout /></RequireAuth>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="library" element={<Library />} />
                        <Route path="resources" element={<Resources />} />
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