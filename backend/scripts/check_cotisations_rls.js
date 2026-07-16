import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("1. Testing anonymous insert into cotisations...");
    const payloadAnon = {
        nom: "Test Anon",
        classe: "Licence 3",
        montant: 5000,
        date_paiement: new Date().toLocaleDateString('fr-FR'),
        statut: 'en_attente',
        enregistre_par: 'Déclaration Étudiant'
    };
    const { data: dataAnon, error: errorAnon } = await supabase.from('cotisations').insert([payloadAnon]).select();
    console.log("Anon insert result:", dataAnon, errorAnon);

    // Sign in as a test student
    console.log("2. Signing in as test student...");
    const email = "maambaara56@gmail.com";
    const password = "password123"; // Let's try, or sign up a new temporary user
    
    // Create new temp user to be sure of credentials
    const tempEmail = `test.cotis.${Date.now()}@ucak.edu.sn`;
    const tempPassword = "password123";
    console.log(`Signing up ${tempEmail}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: { data: { full_name: "Test Cotis User" } }
    });
    
    if (signUpErr) {
        console.error("Sign up failed:", signUpErr);
        return;
    }
    
    const user = signUpData.user;
    // Insert into public.users
    const { error: insUserErr } = await supabase.from('users').insert({
        id: user.id,
        nom: "User",
        prenom: "TestCotis",
        email: tempEmail,
        niveau: "Licence 3",
        role: "student"
    });
    console.log("Insert user profile result:", insUserErr);

    // Sign in
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword
    });
    
    if (signInErr) {
        console.error("Sign in failed:", signInErr);
        return;
    }

    console.log("3. Testing authenticated student insert...");
    const payloadAuth = {
        user_id: user.id,
        nom: "TestCotis User",
        classe: "Licence 3",
        montant: 6000,
        date_paiement: new Date().toLocaleDateString('fr-FR'),
        statut: 'en_attente',
        enregistre_par: 'Déclaration Étudiant'
    };
    
    const { data: dataAuth, error: errorAuth } = await supabase.from('cotisations').insert([payloadAuth]).select();
    console.log("Auth student insert result:", dataAuth, errorAuth);

    // Clean up
    await supabase.from('cotisations').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', user.id);
}

check();
