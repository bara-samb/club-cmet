import { useState, useEffect } from 'react';
import { Search, GraduationCap, Video, ArrowRight, FolderOpen, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient'; 

export default function Knowledge() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('Tous');
  const [activeFiliere, setActiveFiliere] = useState('Tous');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("*");
        if (error) throw error;
        setCourses(data || []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const filteredItems = courses.filter(item => {
    const matchLevel = filterLevel === 'Tous' || item.level === filterLevel;
    const matchFiliere = activeFiliere === 'Tous' || item.filiere_tag === activeFiliere;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchFiliere && matchSearch;
  });

  return (
    // Padding-bottom ajouté pour ne pas cacher le contenu derrière la barre mobile
    <div className="min-h-screen pt-24 pb-24 bg-gray-50 dark:bg-ucak-dark px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Mobile-Friendly */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ucak-blue dark:text-white mb-2">Bibliothèque</h1>
          <p className="text-sm text-gray-500 mb-6">Ressources mises à jour en temps réel.</p>
          
          {/* Barre de recherche */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un cours..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-ucak-dark-card border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:border-ucak-blue shadow-sm text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filtres avec Scroll Horizontal (Stories style) */}
        <div className="space-y-4 mb-8">
            
            {/* Filières */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {['Tous', 'Informatique', 'HEC', 'Génie Civil'].map(fil => (
                    <button key={fil} onClick={() => setActiveFiliere(fil)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeFiliere === fil ? 'bg-ucak-blue text-white shadow-lg' : 'bg-white dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/10'}`}>
                        {fil}
                    </button>
                ))}
            </div>

            {/* Niveaux */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-center pr-2 text-gray-400"><Filter size={16}/></div>
                {['Tous', 'L1', 'L2', 'L3', 'M1'].map(lvl => (
                <button key={lvl} onClick={() => setFilterLevel(lvl)} className={`flex-shrink-0 w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all ${filterLevel === lvl ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                    {lvl}
                </button>
                ))}
            </div>
        </div>

        {/* Grille */}
        {loading ? (
            <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(course => (
                <Link to={`/course/${course.id}`} key={course.id} className="bg-white dark:bg-ucak-dark-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-transform flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${course.filiere_tag === 'Informatique' ? 'bg-blue-600' : 'bg-purple-600'}`}><GraduationCap size={20} /></div>
                    <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-full text-[10px] font-black uppercase text-gray-500">{course.level}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-400 mb-4">{course.instructor_name}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg"><Video size={12}/> {course.modules?.length || 0} Modules</div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/10 text-gray-400 flex items-center justify-center"><ArrowRight size={14} /></div>
                    </div>
                </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}