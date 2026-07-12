import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablesToCheck = [
    'evenements',
    'evenement',
    'events',
    'activites',
    'activities',
    'medias',
    'media'
];

async function run() {
    for (const tableName of tablesToCheck) {
        console.log(`Checking table: ${tableName}...`);
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        if (error) {
            console.log(`  ❌ Error: ${error.message} (${error.code})`);
        } else {
            console.log(`  ✅ Success! Found ${data.length} rows.`);
            if (data.length > 0) {
                console.log(`  Columns:`, Object.keys(data[0]));
            } else {
                // Si la table est vide, essayons d'insérer un objet vide pour voir les erreurs de colonnes,
                // ou simplement faire une requête select pour obtenir les colonnes si possible (on ne peut pas facilement avec l'API JS).
                // Mais regardons si PostgREST nous donne plus d'infos sur une table vide.
                console.log(`  Columns (empty table, keys not available directly)`);
            }
        }
    }
}

run();
