import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Testing insert without statut field...");
    const testMsg = {
        nom: "Test Anon",
        email: "test.anon@gmail.com",
        message: "Hello admin, this is an anonymous test message without status."
    };
    
    const { data, error } = await supabase.from('messages').insert([testMsg]).select();
    if (error) {
        console.error("❌ Insert failed:", error);
    } else {
        console.log("✅ Insert succeeded:", data);
        // Clean up
        await supabase.from('messages').delete().eq('email', "test.anon@gmail.com");
    }
}

check();
