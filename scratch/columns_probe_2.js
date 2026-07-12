import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imageFields = ['image', 'image_url', 'imageUrl', 'url'];

async function testImageFields() {
    for (const field of imageFields) {
        console.log(`Probing 'activites' with image field: ${field}...`);
        const payload = {
            titre: 'Test Probe Image',
            type: 'Hackathon',
            description: 'Description test',
            places: 5,
            date: '2026-06-15'
        };
        payload[field] = 'https://example.com/test.jpg';
        
        const { error } = await supabase.from('activites').insert([payload]).select();
        if (error) {
            console.log(`  ❌ Error: ${error.message} (${error.code})`);
        } else {
            console.log(`  ✅ Success with field: ${field}!`);
            return;
        }
    }
}

async function testInsertWithoutImage() {
    console.log("\nProbing 'activites' without any image field...");
    const { error } = await supabase.from('activites').insert([{
        titre: 'Test Probe No Image',
        type: 'Hackathon',
        description: 'Description test',
        places: 5,
        date: '2026-06-15'
    }]).select();
    if (error) {
        console.log(`  ❌ Error: ${error.message} (${error.code})`);
    } else {
        console.log(`  ✅ Success without image field!`);
    }
}

async function run() {
    await testImageFields();
    await testInsertWithoutImage();
}

run();
