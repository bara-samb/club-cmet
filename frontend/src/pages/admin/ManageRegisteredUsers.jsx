// src/pages/admin/ManageRegisteredUsers.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabaseClient";
import { Search, Shield, User, Trash2, ShieldAlert, Loader2, RefreshCw, GraduationCap, Mail, Check, ChevronDown } from "lucide-react";

import { NIVEAUX } from "../../config/constants";

export default function ManageRegisteredUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [actionLoading, setActionLoading] = useState(null); // id of user undergoing action
    const [toast, setToast] = useState(null);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
    const [confirmRoleUser, setConfirmRoleUser] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("createdAt", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error("Erreur chargement utilisateurs:", err);
            showToast("Impossible de charger les utilisateurs.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Abonnement Supabase Temps Réel
        const channel = supabase.channel("users-db-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleRole = async (user) => {
        const targetRole = user.role === "admin" ? "student" : "admin";
        setActionLoading(user.id);
        setConfirmRoleUser(null);
        try {
            const { error } = await supabase
                .from("users")
                .update({ 
                    role: targetRole,
                    approuve: targetRole === "admin" ? true : user.approuve
                })
                .eq("id", user.id);

            if (error) throw error;
            showToast(`Rôle mis à jour avec succès : ${user.prenom} ${user.nom} est désormais ${targetRole === "admin" ? "Administrateur" : "Étudiant"}.`);
        } catch (err) {
            console.error("Erreur mise à jour rôle:", err);
            showToast("Échec de la modification du rôle.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveAdmin = async (user) => {
        setActionLoading(user.id);
        try {
            const { error } = await supabase
                .from("users")
                .update({ approuve: true })
                .eq("id", user.id);

            if (error) throw error;
            showToast(`L'administrateur ${user.prenom} ${user.nom} a été approuvé avec succès.`);
        } catch (err) {
            console.error("Erreur approbation administrateur:", err);
            showToast("Échec de l'approbation.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (user) => {
        setActionLoading(user.id);
        setConfirmDeleteUser(null);
        try {
            const { error } = await supabase
                .from("users")
                .delete()
                .eq("id", user.id);

            if (error) throw error;
            showToast(`L'utilisateur ${user.prenom} ${user.nom} a été supprimé de l'application.`);
        } catch (err) {
            console.error("Erreur suppression utilisateur:", err);
            showToast("Impossible de supprimer cet utilisateur.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // Filtrage
    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            (u.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.prenom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        const matchesLevel = levelFilter === "all" || u.niveau === levelFilter;
        return matchesSearch && matchesRole && matchesLevel;
    });

    // Statistiques
    const totalCount = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const studentCount = users.filter((u) => u.role === "student").length;

    return (
        <div className="anim-fade-up min-h-screen p-4 md:p-8">
            {/* Toast Alerts */}
            {toast && (
                <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-xs font-bold shadow-lg transition-all transform translate-y-0 ${toast.type === "error" ? "bg-red-500" : "bg-[#187840]"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Modal de confirmation de rôle */}
            {confirmRoleUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-ucak-dark-card rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Shield className="w-8 h-8 text-[#003058] dark:text-white" />
                        </div>
                        <h3 className="font-black text-xl text-[#003058] dark:text-white mb-2">Modifier le rôle ?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Voulez-vous vraiment changer le rôle de <strong>{confirmRoleUser.prenom} {confirmRoleUser.nom}</strong> en tant que{" "}
                            <span className="font-extrabold text-[#187840]">
                                {confirmRoleUser.role === "admin" ? "Étudiant" : "Administrateur"}
                            </span> ?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmRoleUser(null)} className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => handleToggleRole(confirmRoleUser)} className="flex-1 bg-[#003058] hover:bg-[#002545] text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm">
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {confirmDeleteUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-ucak-dark-card rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                            <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-300" />
                        </div>
                        <h3 className="font-black text-xl text-red-600 dark:text-red-300 mb-2">Supprimer l'utilisateur ?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Cette action supprimera définitivement le compte de <strong>{confirmDeleteUser.prenom} {confirmDeleteUser.nom}</strong> ({confirmDeleteUser.email}) de l'application Club-MET.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDeleteUser(null)} className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => handleDeleteUser(confirmDeleteUser)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-sm shadow-red-500/20">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#003058] dark:text-white tracking-tight">Utilisateurs Inscrits</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Visualiser, filtrer et gérer les permissions des utilisateurs enregistrés sur la plateforme.</p>
                    </div>
                    <button onClick={fetchUsers} className="self-start md:self-auto flex items-center gap-2 bg-white dark:bg-ucak-dark-card border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Utilisateurs</span>
                            <span className="block text-2xl font-black text-[#003058] dark:text-white mt-1">{totalCount}</span>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                            <User size={22} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider">Administrateurs</span>
                            <span className="block text-2xl font-black text-[#187840] mt-1">{adminCount}</span>
                        </div>
                        <div className="w-12 h-12 bg-[#187840]/10 rounded-xl flex items-center justify-center text-[#187840]">
                            <Shield size={22} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider">Étudiants</span>
                            <span className="block text-2xl font-black text-[#003058] dark:text-white mt-1">{studentCount}</span>
                        </div>
                        <div className="w-12 h-12 bg-[#003058]/10 rounded-xl flex items-center justify-center text-[#003058] dark:text-white">
                            <GraduationCap size={22} />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#187840] focus:ring-1 focus:ring-[#187840] font-medium transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="w-full md:w-48 relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#187840] cursor-pointer"
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="student">Étudiants</option>
                            <option value="admin">Administrateurs</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Level Filter */}
                    <div className="w-full md:w-56 relative">
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#187840] cursor-pointer"
                        >
                            <option value="all">Tous les niveaux</option>
                            {NIVEAUX.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Users List Container */}
                <div className="bg-white dark:bg-ucak-dark-card border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-[#187840] animate-spin" />
                            <p className="text-sm font-bold text-slate-500">Chargement des comptes...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-ucak-dark-card px-4">
                            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="font-bold text-slate-600 dark:text-slate-300">Aucun utilisateur trouvé</h3>
                            <p className="text-xs text-slate-400 mt-1">Essayez d'ajuster vos filtres ou termes de recherche.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Niveau / Classe</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Rôle</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {filteredUsers.map((user) => {
                                        const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();
                                        const isActionLoading = actionLoading === user.id;

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0 ${user.role === "admin" ? "bg-[#187840]/10 text-[#187840] border border-[#187840]/10" : "bg-[#003058]/10 text-[#003058] dark:text-white border border-[#003058]/10"}`}>
                                                            {user.avatar_url || user.profilePic ? (
                                                                <img src={user.avatar_url || user.profilePic} alt="" className="w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                initials || "?"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-[#003058] dark:text-white">{user.prenom} {user.nom}</div>
                                                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {user.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-[#f1f5f9] dark:bg-ucak-dark border border-slate-200/50 dark:border-white/10 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                                                        {user.niveau || "Non spécifié"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={user.role === "admin" ? "badge bg-[#187840]/10 text-[#125e31] border border-[#187840]/20 text-[9px] px-2.5 py-1 rounded-full uppercase font-black w-max" : "badge bg-[#003058]/10 text-[#003058] dark:text-white border border-[#003058]/10 text-[9px] px-2.5 py-1 rounded-full uppercase font-black w-max"}>
                                                            {user.role === "admin" ? "Administrateur" : "Étudiant"}
                                                        </span>
                                                        {user.role === "admin" && (
                                                            user.approuve ? (
                                                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-wider w-max">Approuvé</span>
                                                            ) : (
                                                                <span className="text-[8px] font-black text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-500/20 uppercase tracking-wider w-max animate-pulse">En attente</span>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isActionLoading ? (
                                                            <Loader2 size={16} className="animate-spin text-[#187840]" />
                                                        ) : (
                                                            <>
                                                                {user.role === "admin" && !user.approuve && (
                                                                    <button
                                                                        onClick={() => handleApproveAdmin(user)}
                                                                        title="Approuver l'administrateur"
                                                                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-[#187840] hover:text-white text-[#187840] border border-emerald-200 dark:border-emerald-500/20 hover:border-[#187840] rounded-xl transition-all shadow-sm text-[9px] font-black uppercase flex items-center gap-1"
                                                                    >
                                                                        <Check size={11} strokeWidth={3} /> Approuver
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setConfirmRoleUser(user)}
                                                                    title={user.role === "admin" ? "Rétrograder en Étudiant" : "Promouvoir en Administrateur"}
                                                                    className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-[#003058]/10 text-[#003058] dark:text-white border border-slate-200 dark:border-white/10 hover:border-[#003058]/20 rounded-xl transition-all shadow-sm"
                                                                >
                                                                    <Shield size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmDeleteUser(user)}
                                                                    title="Supprimer l'utilisateur"
                                                                    className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-white/10 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
