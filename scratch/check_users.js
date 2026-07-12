import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Querying users table...");
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log("Success! Users found:", data.length);
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
            console.log("Sample:", data[0]);
        }
    }
}

check();
