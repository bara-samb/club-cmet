import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const email = `test.complete.${Date.now()}@ucak.edu.sn`;
    const password = "password123";
    
    console.log(`Signing up user: ${email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: "Test Complete Profile"
            }
        }
    });
    
    if (signUpErr) {
        console.error("❌ Sign up failed:", signUpErr);
        return;
    }
    
    const user = signUpData.user;
    console.log("✅ Sign up succeeded! User ID:", user.id);
    
    // Insert into public.users
    console.log("Inserting user profile into public.users...");
    const { error: profileErr } = await supabase
        .from("users")
        .insert({
            id: user.id,
            nom: "Profile",
            prenom: "Test",
            email: email,
            niveau: "TC1",
            role: "student"
        });
        
    if (profileErr) {
        console.error("❌ Profile insert failed:", profileErr);
        return;
    }
    console.log("✅ Profile insert succeeded!");
    
    // Sign in
    console.log("Signing in...");
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (signInErr) {
        console.error("❌ Sign in failed:", signInErr);
        return;
    }
    
    console.log("✅ Sign in succeeded!");
    
    console.log("Inserting message...");
    const testMsg = {
        nom: "Test Profile",
        email: email,
        message: "Hello admin, this is a message from a fully registered student.",
        statut: "non_lu"
    };
    
    const { data, error } = await supabase.from('messages').insert([testMsg]).select();
    if (error) {
        console.error("❌ Message insert failed:", error);
    } else {
        console.log("✅ Message insert succeeded:", data);
        // Clean up
        await supabase.from('messages').delete().eq('email', email);
    }
    
    // Clean up profile
    console.log("Cleaning up profile...");
    await supabase.from('users').delete().eq('id', user.id);
    console.log("Cleanup done.");
}

check();
