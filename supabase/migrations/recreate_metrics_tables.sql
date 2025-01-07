-- First, drop existing metrics tables
DROP TABLE IF EXISTS public.user_metrics CASCADE;
DROP TABLE IF EXISTS public.task_metrics CASCADE;
DROP TABLE IF EXISTS public.financial_metrics CASCADE;
DROP TABLE IF EXISTS public.client_metrics CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create new optimized metrics tables
-- Core metrics table for raw data points
CREATE TABLE public.metrics_data (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL, -- 'financial', 'tasks', 'clients', 'inventory', 'employees'
    metric_name text NOT NULL,
    value numeric NOT NULL,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_category CHECK (
        category IN ('financial', 'tasks', 'clients', 'inventory', 'employees')
    )
);

-- Daily aggregated metrics
CREATE TABLE public.metrics_daily (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    metric_name text NOT NULL,
    date date NOT NULL,
    min_value numeric,
    max_value numeric,
    avg_value numeric,
    total_value numeric,
    count integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_category CHECK (
        category IN ('financial', 'tasks', 'clients', 'inventory', 'employees')
    ),
    CONSTRAINT unique_daily_metric UNIQUE (profile_id, category, metric_name, date)
);

-- Monthly aggregated metrics
CREATE TABLE public.metrics_monthly (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    metric_name text NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    min_value numeric,
    max_value numeric,
    avg_value numeric,
    total_value numeric,
    count integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_category CHECK (
        category IN ('financial', 'tasks', 'clients', 'inventory', 'employees')
    ),
    CONSTRAINT valid_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT unique_monthly_metric UNIQUE (profile_id, category, metric_name, year, month)
);

-- Metric definitions and configurations
CREATE TABLE public.metrics_definitions (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    category text NOT NULL,
    metric_name text NOT NULL,
    display_name text NOT NULL,
    description text,
    unit text, -- 'currency', 'count', 'percentage', etc.
    aggregation_type text NOT NULL, -- 'sum', 'avg', 'min', 'max', 'last'
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_metric_definition UNIQUE (category, metric_name)
);

-- Enable RLS
ALTER TABLE public.metrics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own metrics data"
    ON public.metrics_data FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own metrics data"
    ON public.metrics_data FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view their own daily metrics"
    ON public.metrics_daily FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own monthly metrics"
    ON public.metrics_monthly FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Everyone can view metric definitions"
    ON public.metrics_definitions FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX idx_metrics_data_profile_timestamp 
    ON public.metrics_data(profile_id, timestamp);
CREATE INDEX idx_metrics_data_category_name 
    ON public.metrics_data(category, metric_name);
CREATE INDEX idx_metrics_daily_profile_date 
    ON public.metrics_daily(profile_id, date);
CREATE INDEX idx_metrics_monthly_profile_year_month 
    ON public.metrics_monthly(profile_id, year, month);

-- Insert default metric definitions
INSERT INTO public.metrics_definitions 
    (category, metric_name, display_name, description, unit, aggregation_type)
VALUES
    -- Financial metrics
    ('financial', 'revenue', 'Chiffre d''affaires', 'Revenu total', 'currency', 'sum'),
    ('financial', 'pending_invoices', 'Factures en attente', 'Montant des factures non payées', 'currency', 'sum'),
    ('financial', 'average_invoice', 'Montant moyen des factures', 'Montant moyen par facture', 'currency', 'avg'),
    
    -- Task metrics
    ('tasks', 'completed_tasks', 'Tâches terminées', 'Nombre de tâches terminées', 'count', 'sum'),
    ('tasks', 'pending_tasks', 'Tâches en cours', 'Nombre de tâches en cours', 'count', 'last'),
    ('tasks', 'overdue_tasks', 'Tâches en retard', 'Nombre de tâches en retard', 'count', 'last'),
    
    -- Client metrics
    ('clients', 'total_clients', 'Total clients', 'Nombre total de clients', 'count', 'last'),
    ('clients', 'new_clients', 'Nouveaux clients', 'Nombre de nouveaux clients', 'count', 'sum'),
    ('clients', 'active_clients', 'Clients actifs', 'Nombre de clients actifs', 'count', 'last'),
    
    -- Inventory metrics
    ('inventory', 'low_stock', 'Stock bas', 'Nombre d''articles en stock bas', 'count', 'last'),
    ('inventory', 'stock_value', 'Valeur du stock', 'Valeur totale du stock', 'currency', 'last'),
    ('inventory', 'stock_movements', 'Mouvements de stock', 'Nombre de mouvements de stock', 'count', 'sum'),
    
    -- Employee metrics
    ('employees', 'total_employees', 'Total employés', 'Nombre total d''employés', 'count', 'last'),
    ('employees', 'active_employees', 'Employés actifs', 'Nombre d''employés actifs', 'count', 'last'),
    ('employees', 'productivity', 'Productivité', 'Taux de productivité', 'percentage', 'avg');

-- Create function to aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_daily_metrics(
    p_date date DEFAULT CURRENT_DATE - interval '1 day'
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.metrics_daily (
        profile_id,
        category,
        metric_name,
        date,
        min_value,
        max_value,
        avg_value,
        total_value,
        count
    )
    SELECT 
        profile_id,
        category,
        metric_name,
        p_date as date,
        MIN(value) as min_value,
        MAX(value) as max_value,
        AVG(value) as avg_value,
        SUM(value) as total_value,
        COUNT(*) as count
    FROM public.metrics_data
    WHERE DATE(timestamp) = p_date
    GROUP BY profile_id, category, metric_name
    ON CONFLICT (profile_id, category, metric_name, date)
    DO UPDATE SET
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        avg_value = EXCLUDED.avg_value,
        total_value = EXCLUDED.total_value,
        count = EXCLUDED.count;
END;
$$ LANGUAGE plpgsql;

-- Create function to aggregate monthly metrics
CREATE OR REPLACE FUNCTION aggregate_monthly_metrics(
    p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month integer DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.metrics_monthly (
        profile_id,
        category,
        metric_name,
        year,
        month,
        min_value,
        max_value,
        avg_value,
        total_value,
        count
    )
    SELECT 
        profile_id,
        category,
        metric_name,
        p_year as year,
        p_month as month,
        MIN(min_value) as min_value,
        MAX(max_value) as max_value,
        AVG(avg_value) as avg_value,
        SUM(total_value) as total_value,
        SUM(count) as count
    FROM public.metrics_daily
    WHERE 
        EXTRACT(YEAR FROM date) = p_year 
        AND EXTRACT(MONTH FROM date) = p_month
    GROUP BY profile_id, category, metric_name
    ON CONFLICT (profile_id, category, metric_name, year, month)
    DO UPDATE SET
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        avg_value = EXCLUDED.avg_value,
        total_value = EXCLUDED.total_value,
        count = EXCLUDED.count;
END;
$$ LANGUAGE plpgsql;

-- Create function to record a metric
CREATE OR REPLACE FUNCTION record_metric(
    p_profile_id uuid,
    p_category text,
    p_metric_name text,
    p_value numeric,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
    v_metric_id uuid;
BEGIN
    -- Validate category
    IF p_category NOT IN ('financial', 'tasks', 'clients', 'inventory', 'employees') THEN
        RAISE EXCEPTION 'Invalid category: %', p_category;
    END IF;

    -- Validate metric exists in definitions
    IF NOT EXISTS (
        SELECT 1 FROM public.metrics_definitions 
        WHERE category = p_category AND metric_name = p_metric_name
    ) THEN
        RAISE EXCEPTION 'Invalid metric: % - %', p_category, p_metric_name;
    END IF;

    -- Insert metric
    INSERT INTO public.metrics_data (
        profile_id,
        category,
        metric_name,
        value,
        metadata
    )
    VALUES (
        p_profile_id,
        p_category,
        p_metric_name,
        p_value,
        p_metadata
    )
    RETURNING id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to aggregate metrics daily
SELECT cron.schedule(
    'aggregate-daily-metrics',
    '0 1 * * *', -- Run at 1 AM every day
    $$SELECT aggregate_daily_metrics(CURRENT_DATE - interval '1 day')$$
);

-- Create a cron job to aggregate metrics monthly
SELECT cron.schedule(
    'aggregate-monthly-metrics',
    '0 2 1 * *', -- Run at 2 AM on the first day of each month
    $$SELECT aggregate_monthly_metrics(
        EXTRACT(YEAR FROM CURRENT_DATE - interval '1 month')::integer,
        EXTRACT(MONTH FROM CURRENT_DATE - interval '1 month')::integer
    )$$
);
