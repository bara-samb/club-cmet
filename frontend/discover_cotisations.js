const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

async function discover() {
    const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };

    console.log(`\n=== TABLE: cotisations ===`);
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cotisations?limit=1`, { headers });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]).join(", "));
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        } else if (Array.isArray(data)) {
            console.log("(empty table)");
        } else {
            console.log("Response:", JSON.stringify(data));
        }
    } catch (err) {
        console.error(`Error for cotisations:`, err.message);
    }
}

discover();
