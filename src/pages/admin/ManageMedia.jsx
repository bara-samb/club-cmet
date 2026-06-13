import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const ManageMedia = () => {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) return;

        // 1. Upload du fichier vers le Storage
        const { data, error } = await supabase.storage
            .from('club-media')
            .upload(`public/${Date.now()}_${file.name}`, file);

        if (error) {
            alert("Erreur upload: " + error.message);
            return;
        }

        // 2. Récupérer l'URL publique et l'insérer en base de données
        const { data: { publicUrl } } = supabase.storage.from('club-media').getPublicUrl(data.path);

        await supabase.from('medias').insert([{ url: publicUrl, titre: file.name, type: 'photo' }]);
        alert("Média ajouté !");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Gérer la Galerie</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="my-4" />
            <button onClick={handleUpload} className="bg-green-600 text-white p-2">Ajouter à la galerie</button>
        </div>
    );
};

export default ManageMedia;