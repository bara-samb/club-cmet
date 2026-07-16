-- Script SQL de réparation pour les politiques de sécurité (RLS) de la table "cotisations"
-- À exécuter dans le "SQL Editor" du tableau de bord Supabase.
-- Ce script supprime les anciennes politiques conflictuelles et recrée des règles propres :
-- 1. Permet aux étudiants d'insérer uniquement leurs propres cotisations (user_id = auth.uid())
-- 2. Permet aux étudiants de voir uniquement leurs propres cotisations (user_id = auth.uid())
-- 3. Permet aux administrateurs (role = 'admin') d'avoir un accès complet (INSERT, SELECT, UPDATE, DELETE) sur toutes les lignes.

-- Désactivation temporaire de RLS pour nettoyer les anciennes politiques
ALTER TABLE public.cotisations DISABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow users to view their own cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow users to insert their cotisations" ON public.cotisations;
DROP POLICY IF EXISTS "Allow admin full access to cotisations" ON public.cotisations;

-- 1. Politique d'insertion pour les étudiants
CREATE POLICY "Allow users to insert their cotisations" ON public.cotisations 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- 2. Politique de lecture pour les étudiants
CREATE POLICY "Allow users to view their own cotisations" ON public.cotisations 
    FOR SELECT 
    USING (user_id = auth.uid());

-- 3. Politique d'accès total pour l'administrateur
CREATE POLICY "Allow admin full access to cotisations" ON public.cotisations 
    FOR ALL 
    TO authenticated
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

-- Ré-activation de RLS
ALTER TABLE public.cotisations ENABLE ROW LEVEL SECURITY;
