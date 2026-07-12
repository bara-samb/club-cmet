import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Attempting to read policies via REST api...");
    // Let's see if we can do an RPC or check if there is an error
    // In supabase, there is no direct SQL execution via JS client unless we define an RPC.
    // Let's check if there are any RPC functions.
    // We can do a request to postgrest to see the OpenAPI schema, which lists all tables and RPCs!
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        const json = await response.json();
        console.log("Rest Schema tables:", Object.keys(json.definitions || {}));
        console.log("Rest Schema paths:", Object.keys(json.paths || {}));
    } catch (err) {
        console.error("Error fetching OpenAPI schema:", err);
    }
}

check();
