import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking insert into messages table...");
    const testMsg = {
        nom: "Test Student",
        email: "test.student@ucak.edu.sn",
        message: "Hello admin, this is a test message.",
        statut: "non_lu"
    };
    
    const { data: insData, error: insErr } = await supabase.from('messages').insert([testMsg]).select();
    if (insErr) {
        console.error("❌ Insert failed:", insErr);
    } else {
        console.log("✅ Insert succeeded:", insData);
        
        console.log("Checking select from messages table...");
        const { data: selData, error: selErr } = await supabase.from('messages').select('*').eq('email', "test.student@ucak.edu.sn");
        if (selErr) {
            console.error("❌ Select failed:", selErr);
        } else {
            console.log("✅ Select succeeded:", selData);
            
            // Clean up test message
            const { error: delErr } = await supabase.from('messages').delete().eq('email', "test.student@ucak.edu.sn");
            if (delErr) {
                console.error("❌ Cleanup failed:", delErr);
            } else {
                console.log("✅ Cleanup succeeded");
            }
        }
    }
}

check();
