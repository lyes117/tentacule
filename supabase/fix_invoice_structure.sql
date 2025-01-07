-- Vérifier la structure des tables et ajouter les colonnes manquantes si nécessaire
DO $$ 
BEGIN
    -- Vérifier la table invoice_items
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoice_items' 
        AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE public.invoice_items 
        ADD COLUMN tax_rate numeric(4,2) DEFAULT 20.00,
        ADD COLUMN amount numeric(15,2) DEFAULT 0,
        ADD COLUMN tax_amount numeric(15,2) DEFAULT 0,
        ADD COLUMN total_amount numeric(15,2) DEFAULT 0;
    END IF;

    -- Vérifier la table invoices
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

-- Recréer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
