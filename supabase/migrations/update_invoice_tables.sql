-- Mettre à jour la table invoices existante
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS company_details jsonb,
ADD COLUMN IF NOT EXISTS invoice_date date NOT NULL DEFAULT current_date,
ALTER COLUMN tax_rate SET DEFAULT 20.00,
ALTER COLUMN status SET DEFAULT 'pending';

-- Vérifier et ajouter les index manquants
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_profile_id') THEN
        CREATE INDEX idx_invoices_profile_id ON public.invoices(profile_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_client_id') THEN
        CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoice_items_invoice_id') THEN
        CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
    END IF;
END$$;

-- Mettre à jour ou créer les politiques RLS
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

-- Mettre à jour ou créer les politiques pour invoice_items
DROP POLICY IF EXISTS "Users can view their invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

CREATE POLICY "Users can view their invoice items"
    ON public.invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create invoice items"
    ON public.invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invoice items"
    ON public.invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete invoice items"
    ON public.invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.profile_id = auth.uid()
        )
    );

-- S'assurer que RLS est activé
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Ajouter une fonction de trigger pour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ajouter ou mettre à jour les triggers
DROP TRIGGER IF EXISTS handle_updated_at ON public.invoices;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.invoice_items;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
