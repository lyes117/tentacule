-- Vérifier et corriger la structure des tables
DO $$ 
BEGIN
    -- Vérifier si la colonne profile_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE public.invoices 
        ADD COLUMN profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL;
    END IF;

    -- Vérifier si la colonne client_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'client_id'
    ) THEN
        ALTER TABLE public.invoices 
        ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL;
    END IF;

    -- Ajouter les colonnes manquantes si nécessaire
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'company_details'
    ) THEN
        ALTER TABLE public.invoices 
        ADD COLUMN company_details jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Mettre à jour les politiques RLS
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices"
    ON public.invoices FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can create their own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own invoices"
    ON public.invoices FOR UPDATE
    USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own invoices"
    ON public.invoices FOR DELETE
    USING (profile_id = auth.uid());

-- Vérifier les index
CREATE INDEX IF NOT EXISTS idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
