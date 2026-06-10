import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Plus, Trash2, Video, FileText, Save, LayoutList, ShieldAlert } from 'lucide-react';

export default function AdminCourses() {
  const [courseData, setCourseData] = useState({
    title: '', instructor_name: '', description: '',
    filiere_tag: 'Informatique', level: 'L1',
    modules: [] 
  });

  const [newModule, setNewModule] = useState({ title: '', video_url: '', pdf_url: '' });
  const [status, setStatus] = useState(null);

  const addModule = () => {
    if (!newModule.title) return alert("Titre requis");
    setCourseData({ ...courseData, modules: [...courseData.modules, newModule] });
    setNewModule({ title: '', video_url: '', pdf_url: '' });
  };

  const removeModule = (index) => {
    setCourseData({ ...courseData, modules: courseData.modules.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from("courses").insert({
        title: courseData.title,
        instructor_name: courseData.instructor_name,
        filiere_tag: courseData.filiere_tag,
        level: courseData.level,
        description: courseData.description,
        modules: courseData.modules
      });
      if (error) throw error;
      
      setStatus('success');
      setCourseData({ title: '', instructor_name: '', description: '', filiere_tag: 'Informatique', level: 'L1', modules: [] });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Erreur Supabase : ", error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0f172a] text-white px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/30 mb-2">
              <ShieldAlert size={12} /> Zone Admin
            </div>
            <h1 className="text-3xl font-black text-white">Ajouter un Cours</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire Général */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-ucak-blue"><LayoutList size={20}/> Détails</h3>
              <div className="space-y-4">
                <input placeholder="Titre du Cours" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} className="w-full p-3 bg-black/20 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-white" />
                <input placeholder="Professeur (ex: M. Diop)" value={courseData.instructor_name} onChange={(e) => setCourseData({...courseData, instructor_name: e.target.value})} className="w-full p-3 bg-black/20 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-white" />
                <div className="grid grid-cols-2 gap-2">
                    <select value={courseData.filiere_tag} onChange={(e) => setCourseData({...courseData, filiere_tag: e.target.value})} className="w-full p-3 bg-black/20 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-gray-300">
                      <option value="Informatique">Informatique</option><option value="HEC">HEC</option><option value="Génie Civil">Génie Civil</option>
                    </select>
                    <select value={courseData.level} onChange={(e) => setCourseData({...courseData, level: e.target.value})} className="w-full p-3 bg-black/20 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-gray-300">
                      <option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option><option value="M1">M1</option>
                    </select>
                </div>
                <textarea placeholder="Description..." value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} className="w-full p-3 bg-black/20 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none min-h-[100px] text-white" />
              </div>
            </div>
          </div>

          {/* Formulaire Modules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10 text-white"><Plus size={20} className="text-ucak-blue"/> Contenu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
                <input placeholder="Titre Chapitre / TD" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} className="md:col-span-2 w-full p-3 bg-black/40 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none font-bold text-white" />
                <div className="relative">
                    <Video size={16} className="absolute left-3 top-3.5 text-red-400" />
                    <input placeholder="ID YouTube (ex: dQw4w9WgXcQ)" value={newModule.video_url} onChange={(e) => setNewModule({...newModule, video_url: e.target.value})} className="w-full pl-10 p-3 bg-black/40 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-white" />
                </div>
                <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3.5 text-blue-400" />
                    <input placeholder="Lien PDF (Drive)" value={newModule.pdf_url} onChange={(e) => setNewModule({...newModule, pdf_url: e.target.value})} className="w-full pl-10 p-3 bg-black/40 rounded-xl border border-white/10 text-sm focus:border-ucak-blue outline-none text-white" />
                </div>
              </div>
              <button onClick={addModule} className="w-full py-3 bg-ucak-blue hover:bg-ucak-green text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative z-10 shadow-lg">Ajouter</button>
            </div>

            <div className="space-y-3">
              {courseData.modules.map((mod, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black text-gray-400">{idx + 1}</span>
                    <div>
                      <p className="font-bold text-sm text-white">{mod.title}</p>
                      <div className="flex gap-4 text-[10px] text-gray-400 mt-1">
                        {mod.video_url && <span className="text-red-400">Youtube</span>}
                        {mod.pdf_url && <span className="text-blue-400">PDF</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeModule(idx)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
               {status === 'success' && <span className="text-green-400 text-sm font-bold">Publié !</span>}
               <button onClick={handleSubmit} disabled={status === 'loading'} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all">
                 {status === 'loading' ? 'Envoi...' : <><Save size={18}/> Mettre en ligne</>}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}