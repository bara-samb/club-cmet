import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient'; 
import { useUser } from '../context/UserContext'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, ExternalLink, Plus, Code, Layers, 
  Terminal, User, Search, Rocket, X, Lock, Sparkles
} from 'lucide-react';

export default function Showroom() {
  const { user } = useUser(); // Récupère l'utilisateur connecté
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '', 
    githubUrl: '',
    demoUrl: ''
  });

  // 1. Charger les projets (Public : Tout le monde peut voir)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("createdAt", { ascending: false });
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Erreur chargement projets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isFormOpen]); // Rafraîchir après ajout

  // 2. Envoyer un projet (Privé : Seul connecté)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // SÉCURITÉ : Double vérification
    if (!user) return alert("Accès refusé. Veuillez vous connecter.");

    try {
      const { error } = await supabase.from("projects").insert({
        title: formData.title,
        description: formData.description,
        techStack: formData.techStack,
        githubUrl: formData.githubUrl,
        demoUrl: formData.demoUrl,
        authorName: user.full_name || "Étudiant Club MET",
        authorId: user.uid || user.id,
        tags: formData.techStack.split(',').map(tag => tag.trim())
      });
      if (error) throw error;
      
      setIsFormOpen(false);
      setFormData({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '' });
    } catch (error) {
      console.error("Erreur envoi:", error);
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) || 
    p.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ucak-dark pt-28 pb-24 px-4 sm:px-6">
      
      {/* --- EN-TÊTE --- */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Innovation Étudiante
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
              Le <span className="text-transparent bg-clip-text bg-gradient-to-r from-ucak-blue to-purple-600">Showroom</span>
            </h1>
            <p className="text-gray-500 max-w-xl text-sm md:text-base">
              La vitrine technologique du Club MET. Explorez les créations de vos camarades.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Recherche */}
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher (ex: React)..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-ucak-dark-card border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-ucak-blue shadow-sm text-sm"
              />
            </div>
            
            {/* BOUTON CONDITIONNEL : AJOUTER OU LOGIN */}
            {user ? (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-ucak-blue hover:bg-ucak-green text-white rounded-xl font-bold shadow-lg shadow-ucak-blue/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> <span className="hidden sm:inline">Ajouter mon projet</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            ) : (
              <Link to="/login" className="px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Lock size={18} /> <span className="text-xs uppercase tracking-wide">Se connecter pour poster</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* --- FORMULAIRE D'AJOUT (MODAL) --- */}
      <AnimatePresence>
        {isFormOpen && user && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#161b22] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"><X size={20}/></button>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Rocket className="text-ucak-blue" /> Nouveau Projet
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Nom du projet</label>
                  <input required placeholder="ex: Site E-commerce Sénégal" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none outline-none focus:ring-2 ring-ucak-blue/50 dark:text-white" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Description</label>
                  <textarea required placeholder="Expliquez votre projet en quelques lignes..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none outline-none focus:ring-2 ring-ucak-blue/50 dark:text-white h-24 resize-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Stack Technique (séparé par virgules)</label>
                  <input required placeholder="React, Django, Flutter..." value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none outline-none focus:ring-2 ring-ucak-blue/50 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Lien GitHub</label>
                    <input type="url" placeholder="https://github.com/..." value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none outline-none focus:ring-2 ring-ucak-blue/50 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Lien Démo (Optionnel)</label>
                    <input type="url" placeholder="https://..." value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-black/20 rounded-xl border-none outline-none focus:ring-2 ring-ucak-blue/50 dark:text-white" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 mt-2 bg-ucak-blue text-white font-black rounded-xl hover:bg-ucak-green transition-colors uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                  <Rocket size={18} /> Publier maintenant
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GRILLE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-ucak-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm animate-pulse">Chargement du showroom...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-ucak-dark-card rounded-3xl border border-dashed border-gray-300 dark:border-white/10 mx-auto max-w-2xl">
          <Terminal size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">C'est bien vide ici...</h3>
          <p className="text-gray-500 font-medium text-sm">Aucun projet ne correspond à votre recherche.</p>
          {user && <button onClick={() => setIsFormOpen(true)} className="mt-4 text-ucak-blue font-bold text-sm hover:underline">Soyez le premier à publier !</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} data={project} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- COMPOSANT CARTE ---
const ProjectCard = ({ data }) => {
  const gradients = [
    "from-blue-600 to-cyan-500", "from-violet-600 to-purple-500", 
    "from-emerald-500 to-teal-500", "from-orange-500 to-pink-500"
  ];
  // Choix déterministe de la couleur basé sur l'ID (pour que ça change pas au reload)
  const colorIndex = data.id.charCodeAt(0) % gradients.length;
  const gradient = gradients[colorIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#161b22] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group h-full"
    >
      {/* Header Visuel */}
      <div className={`h-36 bg-gradient-to-br ${gradient} relative p-6 flex flex-col justify-between overflow-hidden`}>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start relative z-10">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest border border-white/10">
            Showroom
            </div>
            {data.githubUrl && <a href={data.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full transition-all"><Github size={16}/></a>}
        </div>

        <div className="w-12 h-12 bg-white dark:bg-[#0b0f19] rounded-2xl flex items-center justify-center text-gray-900 dark:text-white shadow-xl relative z-10 translate-y-8 group-hover:scale-110 transition-transform duration-300">
          <Code size={24} />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 pt-10 flex-grow flex flex-col">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
          {data.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 pb-4 border-b border-gray-50 dark:border-white/5">
          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"><User size={10}/></div> 
          <span>{data.authorName}</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
          {data.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {data.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-wide border border-gray-100 dark:border-white/5">
              {tag}
            </span>
          ))}
        </div>

        {/* Action */}
        <div className="pt-2">
            {data.demoUrl ? (
                <a href={data.demoUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-ucak-blue/10 dark:bg-white/5 text-ucak-blue dark:text-white rounded-xl text-xs font-bold hover:bg-ucak-blue hover:text-white transition-all">
                    <ExternalLink size={16} /> Voir le projet
                </a>
            ) : (
                <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 text-gray-300 rounded-xl text-xs font-bold cursor-not-allowed">
                    <Layers size={16} /> Code uniquement
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}; 