import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dateFields = ['date', 'date_activite', 'date_evenement', 'created_at', 'createdAt'];

async function testDateFields() {
    for (const field of dateFields) {
        console.log(`Probing 'activites' with date field: ${field}...`);
        const payload = {
            titre: 'Test Probe',
            type: 'Hackathon',
            description: 'Description test',
            places: 5,
            images: ['https://example.com/test.jpg']
        };
        payload[field] = '2026-06-15';
        
        const { error } = await supabase.from('activites').insert([payload]).select();
        if (error) {
            console.log(`  ❌ Error: ${error.message} (${error.code})`);
        } else {
            console.log(`  ✅ Success with field: ${field}!`);
            return;
        }
    }
}

async function testInsertWithoutDate() {
    console.log("Probing 'activites' without any date field...");
    const { error } = await supabase.from('activites').insert([{
        titre: 'Test Probe No Date',
        type: 'Hackathon',
        description: 'Description test',
        places: 5,
        images: ['https://example.com/test.jpg']
    }]).select();
    if (error) {
        console.log(`  ❌ Error: ${error.message} (${error.code})`);
    } else {
        console.log(`  ✅ Success without date field!`);
    }
}

async function run() {
    await testDateFields();
    await testInsertWithoutDate();
}

run();
