import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs par celles que tu as récupérées sur ton dashboard Supabase
const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Self-healing inserts that automatically detect if columns are missing
 * in the database/cache, remove them, and retry.
 */
export async function safeInsert(table, payload) {
    let currentPayload = { ...payload };
    const isArray = Array.isArray(payload);
    if (isArray) {
        currentPayload = payload.map(item => ({ ...item }));
    }

    while (true) {
        const { data, error } = await supabase
            .from(table)
            .insert(isArray ? currentPayload : [currentPayload])
            .select();

        if (error) {
            const errorMsg = error.message || "";
            const missingColumnMatch = errorMsg.match(/Could not find the '(.+)' column/i) 
                                    || errorMsg.match(/column "(.+)" of relation/i)
                                    || errorMsg.match(/column "(.+)" does not exist/i);
            
            if (missingColumnMatch && missingColumnMatch[1]) {
                const col = missingColumnMatch[1];
                console.warn(`[Self-healing] Removing missing column '${col}' from table '${table}' insert payload.`);
                if (isArray) {
                    currentPayload.forEach(item => delete item[col]);
                } else {
                    delete currentPayload[col];
                }
                continue;
            }
            return { data: null, error };
        }
        return { data, error: null };
    }
}

/**
 * Self-healing updates that automatically detect if columns are missing
 * in the database/cache, remove them, and retry.
 */
export async function safeUpdate(table, payload, queryFn) {
    let currentPayload = { ...payload };
    while (true) {
        let query = supabase.from(table).update(currentPayload);
        query = queryFn(query);
        const { data, error } = await query.select();

        if (error) {
            const errorMsg = error.message || "";
            const missingColumnMatch = errorMsg.match(/Could not find the '(.+)' column/i) 
                                    || errorMsg.match(/column "(.+)" of relation/i)
                                    || errorMsg.match(/column "(.+)" does not exist/i);
            
            if (missingColumnMatch && missingColumnMatch[1]) {
                const col = missingColumnMatch[1];
                console.warn(`[Self-healing] Removing missing column '${col}' from table '${table}' update payload.`);
                delete currentPayload[col];
                continue;
            }
            return { data: null, error };
        }
        return { data, error: null };
    }
}