import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Testing exact insert payload...");
    const testMsg = {
        nom: "Test Exact",
        email: "test.exact@gmail.com",
        telephone: null,
        message: "Hello admin, this is a test message matching the exact contact form layout.",
        statut: "non_lu"
    };
    
    const { data, error } = await supabase.from('messages').insert([testMsg]).select();
    if (error) {
        console.error("❌ Insert failed:", error);
    } else {
        console.log("✅ Insert succeeded:", data);
        // Clean up
        await supabase.from('messages').delete().eq('email', "test.exact@gmail.com");
    }
}

check();
