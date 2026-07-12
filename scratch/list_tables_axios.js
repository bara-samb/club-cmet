import axios from 'axios';

const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

async function check() {
    console.log("Fetching API schema via Axios...");
    try {
        const response = await axios.get(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            timeout: 5000
        });
        const json = response.data;
        console.log("✅ Success!");
        console.log("Tables/Definitions:", Object.keys(json.definitions || {}));
    } catch (err) {
        console.error("❌ Failed:", err.message);
    }
}

check();
