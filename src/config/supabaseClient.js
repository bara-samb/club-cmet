import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs par celles que tu as récupérées sur ton dashboard Supabase
const supabaseUrl = "https://znqctltzyvwmhwbhqvvk.supabase.co";
const supabaseAnonKey = "sb_publishable_8aQegfNcLYwZNsoGQj9bgQ_sCioRIdS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);