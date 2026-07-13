const url = "https://znqctltzyvwmhwbhqvvk.supabase.co/rest/v1/";
const apiKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

fetch(url, {
    headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
    }
})
.then(res => {
    console.log("Status:", res.status);
    return res.text();
})
.then(text => {
    console.log("Raw response length:", text.length);
    try {
        const json = JSON.parse(text);
        console.log("JSON Keys:", Object.keys(json));
        if (json.message) console.log("Message:", json.message);
        if (json.hint) console.log("Hint:", json.hint);
    } catch(e) {
        console.log("Raw response (not JSON):", text.slice(0, 1000));
    }
})
.catch(err => console.error("Erreur:", err));
