-- Supprimer d'abord les tables existantes et leurs dépendances
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

DROP POLICY IF EXISTS "Users can view their invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

DROP TRIGGER IF EXISTS calculate_invoice_item_amounts_trigger ON public.invoice_items;
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;
DROP TRIGGER IF EXISTS handle_updated_at_invoices ON public.invoices;
DROP TRIGGER IF EXISTS handle_updated_at_invoice_items ON public.invoice_items;

DROP FUNCTION IF EXISTS calculate_invoice_item_amounts();
DROP FUNCTION IF EXISTS update_invoice_totals();
DROP FUNCTION IF EXISTS check_overdue_invoices();

DROP TABLE IF EXISTS public.invoice_items;
DROP TABLE IF EXISTS public.invoices;

-- Recréer la structure complète
-- Table des factures
CREATE TABLE public.invoices (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    invoice_number text NOT NULL UNIQUE,
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'cancelled', 'overdue')),
    subtotal numeric(15,2) NOT NULL DEFAULT 0,
    tax_rate numeric(4,2) NOT NULL DEFAULT 20.00,
    tax_amount numeric(15,2) NOT NULL DEFAULT 0,
    total numeric(15,2) NOT NULL DEFAULT 0,
    notes text,
    company_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    payment_conditions text,
    payment_method text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des articles de facture
CREATE TABLE public.invoice_items (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    quantity numeric(10,2) NOT NULL DEFAULT 1,
    unit_price numeric(15,2) NOT NULL DEFAULT 0,
    amount numeric(15,2) NOT NULL DEFAULT 0,
    tax_rate numeric(4,2) NOT NULL DEFAULT 20.00,
    tax_amount numeric(15,2) NOT NULL DEFAULT 0,
    total_amount numeric(15,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer les index pour optimiser les performances
CREATE INDEX idx_invoices_profile_id ON public.invoices(profile_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Activer RLS sur les tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité pour les factures
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

-- Créer les politiques de sécurité pour les articles de facture
CREATE POLICY "Users can view their invoice items"
    ON public.invoice_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.profile_id = auth.uid()
    ));

CREATE POLICY "Users can create invoice items"
    ON public.invoice_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.profile_id = auth.uid()
    ));

CREATE POLICY "Users can update invoice items"
    ON public.invoice_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.profile_id = auth.uid()
    ));

CREATE POLICY "Users can delete invoice items"
    ON public.invoice_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.profile_id = auth.uid()
    ));

-- Créer une fonction pour calculer automatiquement les montants
CREATE OR REPLACE FUNCTION calculate_invoice_item_amounts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount = NEW.quantity * NEW.unit_price;
    NEW.tax_amount = NEW.amount * (NEW.tax_rate / 100);
    NEW.total_amount = NEW.amount + NEW.tax_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction pour mettre à jour les totaux de la facture
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    invoice_totals RECORD;
BEGIN
    SELECT 
        COALESCE(SUM(amount), 0) as subtotal,
        COALESCE(SUM(tax_amount), 0) as tax_amount,
        COALESCE(SUM(total_amount), 0) as total
    INTO invoice_totals
    FROM public.invoice_items
    WHERE invoice_id = NEW.invoice_id;

    UPDATE public.invoices
    SET 
        subtotal = invoice_totals.subtotal,
        tax_amount = invoice_totals.tax_amount,
        total = invoice_totals.total,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
CREATE TRIGGER calculate_invoice_item_amounts_trigger
    BEFORE INSERT OR UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_item_amounts();

CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER handle_updated_at_invoices
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_invoice_items
    BEFORE UPDATE ON public.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Créer une fonction pour vérifier les factures en retard
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
    UPDATE public.invoices
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
