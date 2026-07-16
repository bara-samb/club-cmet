-- Correctif : la colonne "activites.img" attendue par le frontend
-- (ManageEvents.jsx / Home.jsx) n'existe pas en base, alors que
-- schema.sql ne déclarait que "image_url". Résultat : tout insert/update
-- d'événement échoue silencieusement et la table reste vide, donc les
-- événements et la galerie médias ne s'affichent jamais côté public.
--
-- Script additif et idempotent, sans danger pour les données existantes.
-- À exécuter une seule fois dans l'éditeur SQL du dashboard Supabase.

ALTER TABLE public.activites ADD COLUMN IF NOT EXISTS img TEXT;

-- Persiste explicitement le lien Wave marchand utilisé par défaut par le
-- code (ManageCotisations.jsx) tant qu'aucun admin ne l'a encore modifié
-- depuis l'interface — la table "config" est actuellement vide.
INSERT INTO public.config (cle, valeur)
VALUES ('wave_link', 'https://pay.wave.com/m/M_sn_UGcGdaAUDasK/c/sn/')
ON CONFLICT (cle) DO NOTHING;
