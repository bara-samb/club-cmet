import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data: list } = await supabase.from('users').select('*').limit(1);
    if (!list || list.length === 0) {
        console.log("No users to test update on.");
        return;
    }
    const user = list[0];
    console.log(`Testing update on user ${user.id} (${user.prenom} ${user.nom}). Current role: ${user.role}`);
    
    // We try to update the role to the same value first, to see if update is allowed.
    const { data, error } = await supabase.from('users').update({ role: user.role }).eq('id', user.id).select();
    if (error) {
        console.error("Update failed:", error);
    } else {
        console.log("Update succeeded! Data returned:", data);
    }
}

check();
