-- ==========================================
-- SCRIPT DE RÉPARATION DES RLS POUR SUPABASE
-- Tables impactées : cotisations et config
-- ==========================================

-- ------------------------------------------
-- 1. Réparation des RLS de la table 'config'
-- ------------------------------------------

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.config DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Allow public read access to config" ON public.config;
DROP POLICY IF EXISTS "Allow admin write access to config" ON public.config;
DROP POLICY IF EXISTS "Allow admin all access to config" ON public.config;

-- Recréer les politiques
-- A. Lecture publique
CREATE POLICY "Allow public read access to config" ON public.config
    FOR SELECT USING (true);

-- B. Accès complet (ALL) pour l'administrateur (avec USING et WITH CHECK explicites)
CREATE POLICY "Allow admin all access to config" ON public.config
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Ré-activer RLS
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------
-- 2. Réparation des RLS de la table 'cotisations'
-- ------------------------------------------

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.cotisations DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Allow users to view own or validated cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow users to view own cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow users to insert own cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow admin write access to cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow admin all access to cotisations" ON public.cotisations;

-- Recréer les politiques
-- A. Lecture pour les étudiants : leurs propres cotisations OU toutes les cotisations validées (transparence)
CREATE POLICY "Allow users to view own or validated cotisations" ON public.cotisations
    FOR SELECT USING (
        user_id = auth.uid() 
        OR statut = 'valide'
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- B. Insertion pour les étudiants : uniquement pour leur propre compte (user_id doit correspondre)
CREATE POLICY "Allow users to insert own cotisations" ON public.cotisations
    FOR INSERT 
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- C. Accès total pour l'administrateur (ALL : lecture, insertion, modification, suppression)
CREATE POLICY "Allow admin all access to cotisations" ON public.cotisations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Ré-activer RLS
ALTER TABLE public.cotisations ENABLE ROW LEVEL SECURITY;
