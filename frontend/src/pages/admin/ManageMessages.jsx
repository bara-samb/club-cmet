// src/pages/admin/ManageMessages.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Mail, MailOpen, Trash2, Search, X, Filter, Calendar, User, Phone, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('tous'); // 'tous', 'non_lu', 'lu'
    const [activeMessage, setActiveMessage] = useState(null);
    const [confirmDelId, setConfirmDelId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setMessages(data);
        setLoading(false);
    };

    useEffect(() => {
        let active = true;
        let channel;

        const init = async () => {
            await fetchMessages();
            if (!active) return;

            // Abonnement aux changements en temps réel
            channel = supabase.channel('messages-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                    fetchMessages();
                })
                .subscribe();
        };

        init();

        return () => {
            active = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3500);
    };

    // Marquer un message comme Lu
    const lireMessage = async (msg) => {
        setActiveMessage(msg);
        
        if (msg.statut === 'non_lu') {
            try {
                const { error } = await supabase
                    .from('messages')
                    .update({ statut: 'lu' })
                    .eq('id', msg.id);

                if (error) throw error;
                
                // Mettre à jour l'état local
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, statut: 'lu' } : m));
            } catch (err) {
                console.error("Erreur de mise à jour du statut:", err);
            }
        }
    };

    // Supprimer un message
    const supprimerMessage = async (id) => {
        setDeletingId(id);
        setConfirmDelId(null);
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.filter(m => m.id !== id));
            if (activeMessage?.id === id) setActiveMessage(null);
            showToast("Message supprimé définitivement.");
        } catch (err) {
            console.error("Erreur de suppression:", err);
            showToast("Impossible de supprimer le message.");
        } finally {
            setDeletingId(null);
        }
    };

    // Filtrer et rechercher
    const messagesFiltrés = messages.filter(msg => {
        const matchStatut = filtreStatut === 'tous' || msg.statut === filtreStatut;
        
        const term = recherche.toLowerCase();
        const matchRecherche = !recherche ||
            msg.nom?.toLowerCase().includes(term) ||
            msg.email?.toLowerCase().includes(term) ||
            msg.message?.toLowerCase().includes(term) ||
            msg.telephone?.includes(term);

        return matchStatut && matchRecherche;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500 relative">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#003058] flex items-center gap-3">
                        <Mail className="text-[#187840] w-8 h-8" /> Messages de Contact
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Gérez et répondez aux messages envoyés par les visiteurs du site via le formulaire de contact.
                    </p>
                </div>

                {/* Recherche */}
                <div className="relative w-full md:w-80 shrink-0">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        placeholder="Rechercher un expéditeur ou mot-clé..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#C8C8C8] rounded-xl text-sm focus:outline-none focus:border-[#187840] focus:ring-2 focus:ring-[#187840]/20 shadow-sm transition-all font-medium text-slate-700"
                    />
                    {recherche && (
                        <button onClick={() => setRecherche('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Barre de Filtres */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#003058] font-bold text-sm">
                    <Filter size={16} className="text-[#187840]" /> Filtres rapides :
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { id: 'tous', label: 'Tous les messages' },
                        { id: 'non_lu', label: 'Non lus' },
                        { id: 'lu', label: 'Lus' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFiltreStatut(f.id)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                filtreStatut === f.id
                                    ? 'bg-[#003058] text-white border-[#003058] shadow-sm'
                                    : 'bg-[#F8F0F0] text-slate-600 border-[#C8C8C8]/50 hover:border-[#003058] hover:text-[#003058]'
                            }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenu principal */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8 text-[#187840]" />
                        <p className="text-xs text-slate-400">Chargement des messages...</p>
                    </div>
                </div>
            ) : messagesFiltrés.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm">
                    <MailOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-base font-bold text-slate-400">Aucun message trouvé</p>
                    <p className="text-xs text-slate-300 mt-2">Votre boîte de réception est vide ou aucun message ne correspond à vos critères.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100 text-[#003058] font-bold uppercase tracking-wider">
                                    <th className="p-4 pl-6 w-16 text-center">Statut</th>
                                    <th className="p-4">Expéditeur</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4 w-44">Date de réception</th>
                                    <th className="p-4 w-24 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {messagesFiltrés.map(msg => (
                                    <tr 
                                        key={msg.id} 
                                        onClick={() => lireMessage(msg)}
                                        className={`hover:bg-[#F8F0F0]/50 transition-colors cursor-pointer ${
                                            msg.statut === 'non_lu' ? 'font-bold bg-green-50/20' : 'text-slate-500'
                                        }`}>
                                        
                                        {/* Statut badge */}
                                        <td className="p-4 pl-6 text-center" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-center">
                                                {msg.statut === 'non_lu' ? (
                                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="Non lu" />
                                                ) : (
                                                    <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" title="Lu" />
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Expéditeur */}
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-800 font-bold max-w-[200px] truncate">{msg.nom}</span>
                                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{msg.email}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Extrait Message */}
                                        <td className="p-4 max-w-xs md:max-w-md truncate font-medium text-slate-600">
                                            {msg.message}
                                        </td>
                                        
                                        {/* Date */}
                                        <td className="p-4 text-slate-400 font-medium whitespace-nowrap">
                                            {formatDate(msg.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setConfirmDelId(msg.id)}
                                                disabled={deletingId === msg.id}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Lecture Détaillée */}
            <AnimatePresence>
                {activeMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveMessage(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 overflow-hidden relative text-left">
                            
                            <button 
                                onClick={() => setActiveMessage(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={16} />
                            </button>

                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="p-2.5 bg-[#187840]/10 rounded-xl text-[#187840]">
                                    <MailOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[#003058] uppercase tracking-wide">Lecture du message</h3>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Statut : Lu</p>
                                </div>
                            </div>

                            {/* Contenu Expéditeur */}
                            <div className="bg-[#F8F0F0]/50 rounded-2xl p-4 space-y-2.5 mb-6 border border-gray-100">
                                <div className="flex items-center gap-2 text-xs">
                                    <User size={14} className="text-[#003058]" />
                                    <span className="font-bold text-slate-700">{activeMessage.nom}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <Mail size={14} className="text-[#003058]" />
                                    <a href={`mailto:${activeMessage.email}`} className="text-[#187840] font-bold hover:underline">{activeMessage.email}</a>
                                </div>
                                {activeMessage.telephone && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Phone size={14} className="text-[#003058]" />
                                        <a href={`tel:${activeMessage.telephone}`} className="text-slate-600 font-bold hover:underline">{activeMessage.telephone}</a>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                    <Clock size={12} />
                                    <span>Reçu le : {formatDate(activeMessage.created_at)}</span>
                                </div>
                            </div>

                            {/* Corps du message */}
                            <div className="mb-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message</h4>
                                <div className="bg-white border border-gray-200/80 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-text text-justify">
                                    {activeMessage.message}
                                </div>
                            </div>

                            {/* Actions du Modal */}
                            <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setConfirmDelId(activeMessage.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-red-100">
                                    <Trash2 size={14} /> Supprimer
                                </button>
                                <button
                                    onClick={() => setActiveMessage(null)}
                                    className="bg-[#003058] hover:bg-[#002850] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
                                    Fermer la lecture
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmation de Suppression */}
            <AnimatePresence>
                {confirmDelId && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-base font-black text-[#003058] mb-2">Supprimer ce message ?</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-6">Cette action est irréversible. Le message sera définitivement retiré de la base de données.</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setConfirmDelId(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex-1">
                                    Annuler
                                </button>
                                <button
                                    onClick={() => supprimerMessage(confirmDelId)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex-1 shadow-sm">
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 z-55 bg-[#003058] text-white px-5 py-3.5 rounded-2xl shadow-xl font-bold text-xs border border-white/10 flex items-center gap-2">
                        <span>💡 {toastMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
