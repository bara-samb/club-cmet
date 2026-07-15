import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Send, Loader2, Image as ImageIcon, X, AlertTriangle, Trash2, Clock, Bell } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function ManageNotifications() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [confirmDel, setConfirmDel] = useState(null);

    const fetchNotifications = async () => {
        setLoadingList(true);
        const { data, error: fetchErr } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (!fetchErr && data) setNotifications(data);
        setLoadingList(false);
    };

    useEffect(() => {
        fetchNotifications();
        
        const channel = supabase.channel('manage-notifs-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifications)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDeleteNotification = async (notif) => {
        try {
            const { error: delError } = await supabase.from('notifications').delete().eq('id', notif.id);
            if (delError) throw delError;

            // Supprimer l'image du stockage si présente
            if (notif.image_url && notif.image_url.includes('/notification-images/')) {
                const parts = notif.image_url.split('/notification-images/');
                if (parts.length > 1) {
                    const filePath = parts[1];
                    await supabase.storage.from('notification-images').remove([filePath]);
                }
            }
            
            setConfirmDel(null);
            fetchNotifications();
        } catch (err) {
            alert(`Erreur de suppression : ${err.message}`);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("L'image est trop lourde (max 2Mo).");
                return;
            }
            setImageFile(file);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        let finalImageUrl = null;

        try {
            if (!user) throw new Error("Vous devez être connecté.");

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `notifs/${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('notification-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('notification-images')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            }

            const { error: insertError } = await supabase.from('notifications').insert([{
                message,
                image_url: finalImageUrl
            }]);

            if (insertError) throw insertError;

            alert("Message diffusé avec succès.");
            setMessage('');
            removeImage();
            fetchNotifications();

        } catch (err) {
            console.error(err);
            setError(`Erreur : ${err.message || "Une erreur est survenue lors de l'envoi."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="anim-fade-up p-6 md:p-8 max-w-3xl mx-auto space-y-8">
            {/* Modal suppression */}
            {confirmDel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="font-black text-xl text-[#003058] dark:text-white mb-2">Supprimer ce message ?</h3>
                        <p className="text-sm text-slate-500 mb-8">Le message diffusé sera définitivement effacé pour tous les étudiants.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDel(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 transition-colors">Annuler</button>
                            <button onClick={() => handleDeleteNotification(confirmDel)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-black text-[#003058] dark:text-white tracking-tight">Diffuser un message</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Envoyez un message important à tous les étudiants en temps réel.</p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-700 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSend} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg shadow-[#003058]/5 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Contenu du message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-40 p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#187840]/30 focus:border-[#187840] outline-none transition-all resize-none text-sm leading-relaxed"
                        placeholder="Tapez votre message ici... Soyez clair et concis."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Image d'illustration (optionnelle)</label>
                    <div className="flex items-center gap-4">
                        {!imagePreview ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2.5 px-5 py-3 bg-[#f1f5f9] dark:bg-ucak-dark text-[#003058] dark:text-white rounded-xl border border-slate-100 text-xs font-semibold hover:bg-[#187840]/10 hover:text-[#187840] transition"
                            >
                                <ImageIcon size={18} />
                                Ajouter une photo
                            </button>
                        ) : (
                            <div className="relative inline-block group">
                                <img src={imagePreview} alt="Aperçu" className="w-24 h-24 object-cover rounded-xl border-2 border-[#187840] shadow-md" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <span className="text-[11px] text-slate-400">JPG, PNG. Max 2Mo.</span>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="flex items-center gap-2.5 bg-[#187840] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#125e31] transition-all duration-150 shadow-md shadow-[#187840]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {loading ? "Diffusion en cours..." : "Diffuser le message"}
                    </button>
                </div>
            </form>

            {/* Historique des messages diffusés pour l'admin */}
            <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
                <h2 className="font-black text-xl text-[#003058] dark:text-white flex items-center gap-3">
                    <Bell className="text-[#187840]" size={24} />
                    Messages diffusés
                    <span className="bg-[#187840]/10 text-[#187840] text-sm px-3 py-1 rounded-full">{notifications.length}</span>
                </h2>

                {loadingList ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Chargement de l'historique...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 bg-[#f1f5f9] dark:bg-ucak-dark rounded-2xl border border-slate-100 border-dashed">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-500">Aucun message diffusé pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 group relative bg-white">
                                <div className="flex-grow min-w-0 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                        <Clock size={12} />
                                        <span>{new Date(notif.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                        {notif.message}
                                    </p>

                                    {notif.image_url && (
                                        <a href={notif.image_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                                            <img src={notif.image_url} alt="Attaché" className="max-w-[120px] max-h-[80px] object-cover rounded-lg border border-slate-150 shadow-sm" />
                                        </a>
                                    )}
                                </div>

                                <button
                                    onClick={() => setConfirmDel(notif)}
                                    title="Supprimer cette notification pour tous les étudiants"
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}