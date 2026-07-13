import { supabase } from '../config/supabaseClient';

/**
 * Service to centralize all Supabase Database and Storage operations.
 */

// User Profiles
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
};

export const updateUserProfile = async (userId, profileData) => {
    const { data, error } = await supabase.from('users').update(profileData).eq('id', userId).select().single();
    if (error) throw error;
    return data;
};

export const deleteUserProfile = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
};

export const getAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
};

// Bureau Members
export const getBureauMembers = async () => {
    const { data, error } = await supabase.from('bureau').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
};

// Ressources (Documents)
export const getRessources = async () => {
    const { data, error } = await supabase.from('ressources').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
};

// Maquettes
export const getMaquettes = async () => {
    const { data, error } = await supabase.from('maquettes').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
};

// Events (Activités)
export const getEvents = async () => {
    const { data, error } = await supabase.from('activites').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
};

// Media (Photos/Vidéos)
export const getMedias = async () => {
    const { data, error } = await supabase.from('medias').select('*').order('date_ajout', { ascending: false });
    if (error) throw error;
    return data;
};

// Messages
export const getMessages = async (email = null) => {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (email) {
        query = query.eq('email', email);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const insertMessage = async (messageData) => {
    const { data, error } = await supabase.from('messages').insert([messageData]).select();
    if (error) throw error;
    return data;
};

// Notifications
export const getNotifications = async (limit = null) => {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (limit) {
        query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const insertNotification = async (notifData) => {
    const { data, error } = await supabase.from('notifications').insert([notifData]).select();
    if (error) throw error;
    return data;
};

// Storage Helpers
export const uploadFile = async (bucket, path, file) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
};
