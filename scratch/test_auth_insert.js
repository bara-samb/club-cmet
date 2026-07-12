import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const email = `test.student.auth.${Date.now()}@ucak.edu.sn`;
    const password = "password123";
    
    console.log(`Signing up temporary user: ${email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: "Test Student Auth"
            }
        }
    });
    
    if (signUpErr) {
        console.error("❌ Sign up failed:", signUpErr);
        return;
    }
    
    const user = signUpData.user;
    console.log("✅ Sign up succeeded! User ID:", user.id);
    
    // Sign in as that user
    console.log("Signing in...");
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (signInErr) {
        console.error("❌ Sign in failed:", signInErr);
        return;
    }
    
    console.log("✅ Sign in succeeded! Session token active.");
    
    console.log("Inserting message under authenticated session...");
    const testMsg = {
        nom: "Test Student Auth",
        email: email,
        message: "Hello admin, this is an authenticated test message.",
        statut: "non_lu"
    };
    
    const { data: insData, error: insErr } = await supabase.from('messages').insert([testMsg]).select();
    if (insErr) {
        console.error("❌ Insert failed:", insErr);
    } else {
        console.log("✅ Insert succeeded:", insData);
        
        console.log("Cleaning up messages...");
        await supabase.from('messages').delete().eq('email', email);
    }
    
    // Delete user from auth.users (requires service role, so we can't easily, but we can delete from public.users)
    console.log("Cleaning up public.users record...");
    await supabase.from('users').delete().eq('id', user.id);
    console.log("Cleanup done.");
}

check();
