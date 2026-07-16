import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();
            if (error) throw error;
            if (data) return data;

            // Auto-réparation : session valide mais ligne de profil absente
            // (compte supprimé côté admin pendant que l'utilisateur restait
            // connecté, ou insert d'inscription interrompu). Sans cette ligne,
            // toute l'app tourne avec user=null et plante par endroits. On
            // recrée un profil étudiant minimal — la policy INSERT
            // (auth.uid() = id) l'autorise.
            const fullName = authUser.user_metadata?.full_name || '';
            const [prenom, ...reste] = fullName.split(' ');
            const { data: created, error: insertErr } = await supabase
                .from('users')
                .insert({
                    id: authUser.id,
                    email: authUser.email,
                    prenom: prenom || '',
                    nom: reste.join(' ') || '',
                    role: 'student',
                    approuve: true
                })
                .select()
                .single();
            if (insertErr) throw insertErr;
            console.warn('[Auth] Profil manquant recréé automatiquement pour', authUser.email);
            return created;
        } catch (err) {
            console.error("Error fetching user profile:", err);
            return null;
        }
    };

    useEffect(() => {
        let active = true;

        const initSession = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (currentSession && active) {
                    setSession(currentSession);
                    const profile = await fetchProfile(currentSession.user);
                    if (profile && profile.role === 'admin' && profile.approuve === false) {
                        await supabase.auth.signOut();
                        if (active) {
                            setSession(null);
                            setUser(null);
                        }
                    } else {
                        if (active) setUser(profile);
                    }
                }
            } catch (err) {
                console.error("Error initializing session:", err);
            } finally {
                if (active) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!active) return;
            setSession(newSession);
            if (newSession) {
                setLoading(true);
                const profile = await fetchProfile(newSession.user);
                if (profile && profile.role === 'admin' && profile.approuve === false) {
                    await supabase.auth.signOut();
                    if (active) {
                        setSession(null);
                        setUser(null);
                        setLoading(false);
                    }
                } else {
                    if (active) {
                        setUser(profile);
                        setLoading(false);
                    }
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (session?.user?.id) {
            const profile = await fetchProfile(session.user);
            setUser(profile);
        }
    };

    const value = {
        user,
        session,
        loading,
        signOut,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
