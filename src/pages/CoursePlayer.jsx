import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient'; 
import { ChevronLeft, Menu, X, FileText } from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // CHARGEMENT
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (data) setCourseData(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <div className="h-screen bg-[#0f1117] text-white flex items-center justify-center">Chargement...</div>;
  if (!courseData) return <div className="h-screen bg-[#0f1117] text-white flex items-center justify-center">Cours introuvable.</div>;

  const activeModule = courseData.modules && courseData.modules.length > 0 ? courseData.modules[0] : null;
  const videoUrl = activeModule && activeModule.video_url ? `https://www.youtube.com/embed/${activeModule.video_url}` : null;

  return (
    <div className="h-screen bg-[#0f1117] text-gray-300 flex overflow-hidden font-sans">
      {/* GAUCHE */}
      <div className={`flex-grow flex flex-col relative transition-all duration-300 ${isSidebarOpen ? 'mr-0 md:mr-[400px]' : 'mr-0'}`}>
        <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center justify-between pointer-events-none">
           <Link to="/knowledge" className="pointer-events-auto flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white font-medium text-sm transition-all border border-white/10">
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Retour</span>
           </Link>
           <div className="pointer-events-auto bg-ucak-blue/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg">
              {courseData.filiere_tag} • {courseData.level}
           </div>
        </div>

        <div className="flex-grow bg-black relative flex items-center justify-center">
           {videoUrl ? (
             <iframe width="100%" height="100%" src={videoUrl} title="Video" frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
           ) : (
             <div className="text-gray-500">Aucune vidéo.</div>
           )}
        </div>

        <div className="h-16 bg-[#0f1117] border-t border-gray-800 flex items-center justify-between px-6 z-10">
           <h1 className="text-white font-bold text-lg truncate">{courseData.title}</h1>
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">{isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>

      {/* DROITE */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#161b22] border-l border-gray-800 shadow-2xl transform transition-transform duration-300 z-30 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-[#0f1117]">
            <span className="font-bold text-white tracking-wide text-sm uppercase">Contenu</span>
         </div>
         <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-6">
            <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700">
                <h3 className="text-white font-bold mb-2">Description</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{courseData.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                    <span>Prof: {courseData.instructor_name}</span>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Modules</h4>
                {courseData.modules.map((mod, idx) => (
                    <div key={idx} className="bg-[#0f1117] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                        <span className="text-sm text-gray-300">{mod.title}</span>
                        {mod.pdf_url && <a href={mod.pdf_url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs font-bold hover:underline">PDF</a>}
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
}