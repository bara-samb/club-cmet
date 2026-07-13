// Discover activites schema by: 
// 1) Reading existing rows to see actual column names
// 2) Trying HEAD request to get column info from PostgREST
// 3) Trying the OpenAPI spec at the root

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

async function discover() {
    const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };

    // Method 1: Fetch 1 row from activites to see column names
    console.log("=== METHOD 1: Fetch 1 row from 'activites' ===");
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/activites?limit=1`, { headers });
        const data = await res.json();
        if (data.length > 0) {
            console.log("Columns found:", Object.keys(data[0]).join(", "));
            console.log("Sample row:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("No rows found in activites, trying empty insert to trigger column error...");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }

    // Method 2: Fetch 1 row from each key table
    const tables = ['users', 'bureau', 'medias', 'messages', 'ressources', 'maquettes', 'notifications'];
    for (const table of tables) {
        console.log(`\n=== TABLE: ${table} ===`);
        try {
            const res = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, { headers });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                console.log("Columns:", Object.keys(data[0]).join(", "));
            } else if (Array.isArray(data)) {
                console.log("(empty table)");
            } else {
                console.log("Response:", JSON.stringify(data));
            }
        } catch (err) {
            console.error(`Error for ${table}:`, err.message);
        }
    }

    // Method 3: Try OPTIONS on activites
    console.log("\n=== METHOD 3: OPTIONS request on 'activites' ===");
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/activites`, {
            method: 'OPTIONS',
            headers
        });
        console.log("Status:", res.status);
        // Check for Content-Profile or other useful headers
        for (const [key, value] of res.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

discover();
