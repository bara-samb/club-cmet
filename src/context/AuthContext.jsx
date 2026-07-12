import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({
    user: null,
    session: null,
    loading: true,
    signOut: async () => {},
    refreshProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
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
                    const profile = await fetchProfile(currentSession.user.id);
                    if (active) setUser(profile);
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
                const profile = await fetchProfile(newSession.user.id);
                if (active) {
                    setUser(profile);
                    setLoading(false);
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
            const profile = await fetchProfile(session.user.id);
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
