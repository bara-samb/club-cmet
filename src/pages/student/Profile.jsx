// src/pages/student/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Camera, Save, User as UserIcon, Mail, BookOpen, Loader2 } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        let active = true;
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            if (data && active) {
                setUser(data);
                setPrenom(data.prenom || '');
                setNom(data.nom || '');
            }
        };
        fetchUser();
        return () => { active = false; };
    }, []);

    const handleUpdate = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from('users').update({ prenom, nom }).eq('id', user.id);
        setSaving(false);
        if (error) {
            alert("Erreur lors de la mise à jour : " + error.message);
        } else {
            setUser(prev => ({ ...prev, prenom, nom }));
            alert("Profil mis à jour !");
        }
    };

    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `profiles/${user.id}.${fileExt}`;

        // Upload to bucket 'club-met-storage'
        const { error: uploadError } = await supabase.storage
            .from('club-met-storage')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            alert("Erreur upload photo : " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('club-met-storage')
            .getPublicUrl(filePath);

        // Ajout d'un timestamp pour contourner le cache du navigateur
        const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;

        const { error: dbError } = await supabase
            .from('users')
            .update({ profilePic: urlWithCacheBuster })
            .eq('id', user.id);

        setUploading(false);
        if (dbError) {
            alert("Erreur base de données : " + dbError.message);
        } else {
            setUser(prev => ({ ...prev, profilePic: urlWithCacheBuster }));
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
            </div>
        );
    }

    const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Titre de la page */}
            <div>
                <h1 className="text-2xl font-black text-[#0f213a] tracking-tight">Paramètres du profil</h1>
                <p className="text-sm text-slate-500 mt-1">Gérez vos informations personnelles et votre apparence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Colonne Gauche: Avatar & Info Résumé */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-50 flex items-center justify-center relative group">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-[#22c55e]/50">{initiales}</span>
                                )}
                                
                                {/* Overlay Upload */}
                                <div 
                                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-6 h-6 text-white mb-1" />
                                            <span className="text-[10px] text-white font-bold">Modifier</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handlePhoto} 
                                disabled={uploading}
                            />
                        </div>
                        
                        <h2 className="text-lg font-bold text-[#0f213a]">{user.prenom} {user.nom}</h2>
                        <p className="text-xs text-slate-400 font-medium">{user.role === 'admin' ? 'Administrateur' : 'Étudiant'}</p>
                        
                        <div className="mt-6 flex flex-col gap-3 text-left bg-slate-50 p-4 rounded-2xl">
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <Mail size={16} className="text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <BookOpen size={16} className="text-slate-400 shrink-0" />
                                <span>{user.niveau || 'Non spécifié'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne Droite: Formulaire */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-base font-bold text-[#0f213a] mb-6 flex items-center gap-2">
                            <UserIcon size={18} className="text-[#22c55e]" />
                            Informations Personnelles
                        </h3>
                        
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 ml-1">Prénom</label>
                                    <input 
                                        type="text" 
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#22c55e] focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 ml-1">Nom</label>
                                    <input 
                                        type="text" 
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#22c55e] focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Bouton de sauvegarde */}
                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={handleUpdate} 
                                    disabled={saving || (!prenom && !nom)}
                                    className="bg-[#0f213a] hover:bg-[#1e3a5f] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}