import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Fetching messages...");
    const { data, error } = await supabase.from('messages').select('*');
    if (error) {
        console.error("Error fetching messages:", error);
    } else {
        console.log("Success! Messages count:", data.length);
        if (data.length > 0) {
            console.log("Sample message:", data[0]);
        }
    }
}

check();
