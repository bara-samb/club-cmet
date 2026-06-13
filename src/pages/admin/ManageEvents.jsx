import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const ManageEvents = () => {
    const [titre, setTitre] = useState('');
    const [type, setType] = useState('');

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('activites')
            .insert([{ titre, type }]); // Ajoutez les autres champs selon votre table

        if (error) alert("Erreur: " + error.message);
        else alert("Événement ajouté avec succès !");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Gérer les Événements</h2>
            <form onSubmit={handleAddEvent} className="mt-4 flex flex-col gap-4">
                <input type="text" placeholder="Titre" onChange={(e) => setTitre(e.target.value)} className="border p-2" />
                <input type="text" placeholder="Type (ex: Hackathon)" onChange={(e) => setType(e.target.value)} className="border p-2" />
                <button type="submit" className="bg-blue-600 text-white p-2">Ajouter</button>
            </form>
        </div>
    );
};

export default ManageEvents;