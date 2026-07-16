-- ══════════════════════════════════════════════════════════════════════
-- Correctif des écarts entre la base Supabase réelle et le frontend.
-- À exécuter UNE FOIS dans l'éditeur SQL du dashboard Supabase.
-- Script 100 % idempotent et additif : ré-exécutable sans risque,
-- n'efface ni ne modifie aucune donnée existante.
-- (Remplace l'ancien fix_activites_img.sql, dont le contenu est repris ici.)
-- ══════════════════════════════════════════════════════════════════════

-- 1. ÉVÉNEMENTS : le frontend (ManageEvents/Home) lit et écrit "activites.img"
--    (tableau JSON d'URLs stringifié). Sans cette colonne, tout insert
--    d'événement échoue et la page publique reste vide.
ALTER TABLE public.activites ADD COLUMN IF NOT EXISTS img TEXT;

-- 2. COTISATIONS : la déclaration étudiante et la validation admin écrivent
--    ces colonnes ; "enregistre_par" au moins manque en production
--    (erreur « Could not find the 'enregistre_par' column »).
ALTER TABLE public.cotisations ADD COLUMN IF NOT EXISTS enregistre_par TEXT;
ALTER TABLE public.cotisations ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'valide' NOT NULL;
ALTER TABLE public.cotisations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.cotisations ADD COLUMN IF NOT EXISTS date_paiement TEXT;

-- 3. CONFIG : persiste le lien Wave marchand utilisé par défaut par le code
--    tant qu'aucun admin ne l'a modifié (la table est vide en production).
INSERT INTO public.config (cle, valeur)
VALUES ('wave_link', 'https://pay.wave.com/m/M_sn_UGcGdaAUDasK/c/sn/')
ON CONFLICT (cle) DO NOTHING;

-- 4. Rafraîchit le cache de schéma de PostgREST pour que les nouvelles
--    colonnes soient visibles immédiatement, sans redémarrage.
NOTIFY pgrst, 'reload schema';
