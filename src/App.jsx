import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/student/Dashboard';
import Library from './pages/student/Library';
import Profile from './pages/student/Profile';
import TutoratHub from './pages/student/TutoratHub';
import AdminPanel from './pages/admin/AdminPanel';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDocs from './pages/admin/ManageDocs';

/* ── Guards de protection ── */

function RequireAuth({ children }) {
    const [state, setState] = useState('loading');
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setState(session ? 'ok' : 'denied');
        });
        return () => subscription.unsubscribe();
    }, []);
    if (state === 'loading') return <div>Chargement...</div>;
    return state === 'ok' ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
    const [state, setState] = useState('loading');

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { setState('denied'); return; }

            const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
            setState(data?.role === 'admin' ? 'ok' : 'denied');
        };
        checkAdmin();
    }, []);

    if (state === 'loading') return <div>Vérification...</div>;
    return state === 'ok' ? children : <Navigate to="/" replace />;
}

/* ── App Principal ── */

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes Étudiant */}
                <Route path="/student" element={<RequireAuth><StudentLayout /></RequireAuth>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="library" element={<Library />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="tutorat" element={<TutoratHub />} />
                </Route>

                {/* Routes Admin */}
                <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                    <Route path="panel" element={<AdminPanel />} />
                    <Route path="manage-users" element={<ManageUsers />} />
                    <Route path="manage-docs" element={<ManageDocs />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}