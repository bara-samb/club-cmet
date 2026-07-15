// src/pages/student/TutoratHub.jsx — Renamed to "Messages" (student → admin communication)
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Send, CheckCircle2, MessageSquare, Clock, Loader2, Mail, MailOpen, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function MessagesHub() {
    const { user } = useAuth();

    /* ── Form state ── */
    const [objet, setObjet] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    /* ── History state ── */
    const [myMessages, setMyMessages] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    /* ── Toast ── */
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    /* ── Fetch student's message history ── */
    const fetchMyMessages = async () => {
        if (!user) return;
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('email', user.email)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setMyMessages(data || []);
        } catch (err) {
            console.error('Erreur chargement messages:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyMessages();

            // Real-time subscription
            const channel = supabase.channel('student-messages')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                    fetchMyMessages();
                })
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    /* ── Submit new message ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!objet.trim() || !message.trim() || !user) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from('messages').insert([{
                nom: `${user.prenom} ${user.nom}`,
                email: user.email,
                telephone: user.telephone || null,
                message: `[${objet.trim()}] ${message.trim()}`,
                statut: 'non_lu',
            }]);

            if (error) throw error;

            setSubmitted(true);
            showToast('Votre message a été envoyé avec succès au bureau du club.');
            setObjet('');
            setMessage('');
            setTimeout(() => setSubmitted(false), 4000);
        } catch (err) {
            console.error('Erreur envoi message:', err);
            showToast("Une erreur est survenue lors de l'envoi.", 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="anim-fade-up p-6 max-w-6xl mx-auto">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white text-xs font-bold shadow-lg transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#187840]'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── FORMULAIRE D'ENVOI (2/3) ── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-ucak-dark-card p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#003058] dark:text-white flex items-center gap-3">
                                <MessageSquare className="text-[#187840] w-7 h-7" />
                                Envoyer un message
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                Contactez directement le bureau du Club-MET. Votre message sera lu par les administrateurs qui vous répondront dans les meilleurs délais.
                            </p>
                        </div>

                        {submitted && (
                            <div className="bg-[#187840]/10 text-[#187840] p-4 rounded-xl border border-[#187840]/20 flex items-start gap-3 text-sm font-semibold">
                                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                                <span>Votre message a bien été envoyé ! Le bureau du club le recevra et le traitera sous peu.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">Objet du message</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Question sur l'inscription, Demande d'aide, Suggestion..."
                                    value={objet}
                                    onChange={(e) => setObjet(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f1f5f9] dark:bg-ucak-dark border border-[#e2e8f0]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">Votre message</label>
                                <textarea
                                    rows="5"
                                    required
                                    placeholder="Rédigez votre message ici... Soyez le plus précis possible pour que le bureau puisse vous aider efficacement."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f1f5f9] dark:bg-ucak-dark border border-[#e2e8f0]/60 rounded-xl text-xs focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 transition-all font-semibold resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto px-6 py-3 bg-[#003058] hover:bg-[#002850] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 className="animate-spin w-4 h-4" /> Envoi en cours...</>
                                ) : (
                                    <><Send size={16} /> Envoyer mon message</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── HISTORIQUE DES MESSAGES (1/3) ── */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-ucak-dark-card p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden sticky top-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4 mb-4">
                            <div className="flex items-center gap-2 font-bold text-[#003058] dark:text-white">
                                <Clock size={18} className="text-[#187840]" />
                                <h2>Mes messages envoyés</h2>
                            </div>
                            <button onClick={fetchMyMessages} className="p-1.5 text-slate-400 hover:text-[#187840] hover:bg-[#187840]/10 rounded-lg transition-colors" title="Actualiser">
                                <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <Loader2 className="animate-spin w-6 h-6 text-[#187840]" />
                                <p className="text-[10px] text-slate-400 font-semibold">Chargement...</p>
                            </div>
                        ) : myMessages.length === 0 ? (
                            <div className="text-center py-8">
                                <Mail className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-xs text-slate-400 font-semibold">Aucun message envoyé</p>
                                <p className="text-[10px] text-slate-300 mt-1">Vos messages apparaîtront ici après envoi.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {myMessages.map((msg) => (
                                    <div key={msg.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/10 bg-[#f1f5f9] dark:bg-ucak-dark text-xs space-y-2 hover:border-[#187840]/30 transition-colors">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-[#003058] dark:text-white text-sm leading-tight line-clamp-2 flex-1">
                                                {msg.message}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] shrink-0 border ${
                                                msg.statut === 'non_lu'
                                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'
                                                    : 'bg-[#187840]/10 text-[#187840] border-[#187840]/20'
                                            }`}>
                                                {msg.statut === 'non_lu' ? 'En attente' : 'Lu'}
                                            </span>
                                        </div>
                                        <div className="text-slate-400 flex items-center gap-1.5 mt-1">
                                            <Clock size={10} />
                                            <span className="font-semibold">{formatDate(msg.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}