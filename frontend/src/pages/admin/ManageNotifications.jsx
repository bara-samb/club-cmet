import React, { useState, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Send, Loader2, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function ManageNotifications() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

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

            // CORRECTION : utilisation de 'image_url' (avec underscore)
            const { error: insertError } = await supabase.from('notifications').insert([{
                message,
                image_url: finalImageUrl
            }]);

            if (insertError) throw insertError;

            alert("✅ Alerte diffusée avec succès !");
            setMessage('');
            removeImage();

        } catch (err) {
            console.error(err);
            setError(`Erreur : ${err.message || "Une erreur est survenue lors de l'envoi."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-[#003058] tracking-tight">Diffuser une alerte</h1>
                <p className="text-sm text-slate-500 mt-1">Envoyez un message important à tous les étudiants en temps réel.</p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-700 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSend} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-lg shadow-[#003058]/5 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Message de l'alerte</label>
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
                                className="flex items-center gap-2.5 px-5 py-3 bg-[#F8F0F0] text-[#003058] rounded-xl border border-slate-100 text-xs font-semibold hover:bg-[#187840]/10 hover:text-[#187840] transition"
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
                        {loading ? "Diffusion en cours..." : "Diffuser l'alerte"}
                    </button>
                </div>
            </form>
        </div>
    );
}