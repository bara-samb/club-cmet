import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testActivites() {
    console.log("=== Testing 'activites' ===");
    // Test 1: all columns we expect
    const { data, error } = await supabase.from('activites').insert([{
        titre: 'Test Activite',
        type: 'Hackathon',
        date_evenement: '2026-06-15',
        description: 'Description test',
        places: 10,
        images: ['https://example.com/test.jpg']
    }]).select();

    if (error) {
        console.log("Error inserting into activites:", error.message, `(${error.code})`);
    } else {
        console.log("Success inserting into activites!", data);
    }
}

async function testMedias() {
    console.log("\n=== Testing 'medias' ===");
    // Test 1: try to insert without 'description'
    const { data, error } = await supabase.from('medias').insert([{
        titre: 'Test Media',
        type: 'Photo',
        url: 'https://example.com/test.jpg'
    }]).select();

    if (error) {
        console.log("Error inserting into medias (without description):", error.message, `(${error.code})`);
    } else {
        console.log("Success inserting into medias (without description)!", data);
    }
}

async function run() {
    await testActivites();
    await testMedias();
}

run();
