-- Create inventory items table
CREATE TABLE public.inventory_items (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    description text,
    category text,
    unit text NOT NULL,
    current_stock numeric(10,2) NOT NULL DEFAULT 0,
    minimum_stock numeric(10,2) NOT NULL DEFAULT 0,
    reorder_point numeric(10,2) NOT NULL DEFAULT 0,
    unit_price numeric(15,2) NOT NULL DEFAULT 0,
    supplier_id uuid REFERENCES public.clients(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, sku)
);

-- Create inventory movements table
CREATE TABLE public.inventory_movements (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    movement_type text NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity numeric(10,2) NOT NULL,
    reference_type text,
    reference_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create inventory alerts table
CREATE TABLE public.inventory_alerts (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'reorder', 'overstock')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own inventory items"
    ON public.inventory_items FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can create their own inventory items"
    ON public.inventory_items FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own inventory items"
    ON public.inventory_items FOR UPDATE
    USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own inventory items"
    ON public.inventory_items FOR DELETE
    USING (profile_id = auth.uid());

-- Movement policies
CREATE POLICY "Users can view their own inventory movements"
    ON public.inventory_movements FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can create inventory movements"
    ON public.inventory_movements FOR INSERT
    WITH CHECK (profile_id = auth.uid());

-- Alert policies
CREATE POLICY "Users can view their own inventory alerts"
    ON public.inventory_alerts FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own inventory alerts"
    ON public.inventory_alerts FOR UPDATE
    USING (profile_id = auth.uid());

-- Create indexes
CREATE INDEX idx_inventory_items_profile_id ON public.inventory_items(profile_id);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX idx_inventory_alerts_item_id ON public.inventory_alerts(item_id);
CREATE INDEX idx_inventory_alerts_status ON public.inventory_alerts(status);

-- Create function to update stock levels
CREATE OR REPLACE FUNCTION update_stock_level()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type = 'in' THEN
            UPDATE public.inventory_items
            SET current_stock = current_stock + NEW.quantity
            WHERE id = NEW.item_id;
        ELSIF NEW.movement_type = 'out' THEN
            UPDATE public.inventory_items
            SET current_stock = current_stock - NEW.quantity
            WHERE id = NEW.item_id;
        ELSIF NEW.movement_type = 'adjustment' THEN
            UPDATE public.inventory_items
            SET current_stock = current_stock + NEW.quantity
            WHERE id = NEW.item_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
CREATE TRIGGER update_stock_after_movement
    AFTER INSERT ON public.inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_level();

-- Create function to check stock levels and create alerts
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for low stock
    IF NEW.current_stock <= NEW.minimum_stock THEN
        INSERT INTO public.inventory_alerts (
            profile_id,
            item_id,
            alert_type,
            message
        )
        VALUES (
            NEW.profile_id,
            NEW.id,
            'low_stock',
            'Stock level is below minimum threshold'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Check for reorder point
    IF NEW.current_stock <= NEW.reorder_point THEN
        INSERT INTO public.inventory_alerts (
            profile_id,
            item_id,
            alert_type,
            message
        )
        VALUES (
            NEW.profile_id,
            NEW.id,
            'reorder',
            'Stock level has reached reorder point'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock level checks
CREATE TRIGGER check_stock_levels_trigger
    AFTER INSERT OR UPDATE OF current_stock ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_levels();
