import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const tables = ['inscriptions', 'registrations', 'participations', 'inscrits'];
    for (const t of tables) {
        console.log(`Checking table: ${t}`);
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`  ❌ ${t} does not exist or error: ${error.message}`);
        } else {
            console.log(`  ✅ ${t} exists! Row count limit 1: ${data.length}`);
        }
    }
}

check();
