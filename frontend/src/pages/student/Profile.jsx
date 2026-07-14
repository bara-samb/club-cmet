import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Camera, Save, Loader2, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { NIVEAUX } from '../../config/constants';

export default function Profile() {
    const { user, session, refreshProfile, loading } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [nom, setNom] = useState(user?.nom || '');
    const [prenom, setPrenom] = useState(user?.prenom || '');
    const [niveau, setNiveau] = useState(user?.niveau || '');

    useEffect(() => {
        if (user) {
            setNom(user.nom || '');
            setPrenom(user.prenom || '');
            setNiveau(user.niveau || '');
        }
    }, [user]);

    const handleUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('club-met-storage')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('club-met-storage').getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            await refreshProfile();
            alert('Photo de profil mise à jour !');
        } catch (error) {
            alert('Erreur lors de l\'upload : ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ nom, prenom, niveau })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile();
            alert('Profil mis à jour avec succès !');
        } catch (error) {
            alert('Erreur lors de la mise à jour : ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="text-sm">Chargement du profil...</span>
            </div>
        );
    }

    return (
        <div className="anim-fade-up p-4 md:p-6 max-w-2xl mx-auto space-y-8">
            {/* En-tête */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <User className="text-[#003058]" size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#003058] tracking-tight">Mon Profil</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Gérez vos informations personnelles et votre photo de profil</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                {/* Photo de profil */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-md transition-all group-hover:brightness-90"
                                alt="Avatar"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003058] to-[#187840] flex items-center justify-center text-white text-5xl font-black shadow-md">
                                {prenom?.[0] || session?.user?.email?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 p-3 bg-[#187840] text-white rounded-full cursor-pointer hover:bg-[#125e31] hover:scale-105 transition-all shadow-md">
                            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                        </label>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mettre à jour ma photo</span>
                </div>

                {/* Formulaire */}
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Adresse e-mail</label>
                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed" value={session?.user?.email || ''} disabled />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Prénom</label>
                            <input className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/10 transition-all font-semibold" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom</label>
                            <input className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/10 transition-all font-semibold" value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Niveau d'études</label>
                        <select 
                            value={niveau} 
                            onChange={e => setNiveau(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F8F0F0] border border-[#C8C8C8]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/10 transition-all font-semibold"
                        >
                            <option value="">Sélectionnez un niveau</option>
                            {NIVEAUX.map(niv => (
                                <option key={niv} value={niv}>{niv}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleUpdateProfile} 
                    className="w-full bg-[#003058] hover:bg-[#002850] text-white p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                    <Save size={18} /> Enregistrer les modifications
                </button>
            </div>
        </div>
    );
}