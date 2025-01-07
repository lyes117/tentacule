-- Create analytics tables for tracking metrics
CREATE TABLE public.analytics_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create aggregated metrics table for historical data
CREATE TABLE public.analytics_aggregated_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    period_type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create metrics definitions table
CREATE TABLE public.analytics_metric_definitions (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    metric_type text NOT NULL,
    metric_name text NOT NULL,
    display_name text NOT NULL,
    description text,
    unit text,
    aggregation_method text NOT NULL, -- 'sum', 'average', 'count', 'last', 'min', 'max'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(metric_type, metric_name)
);

-- Enable RLS
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregated_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metric_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own metrics"
    ON public.analytics_metrics FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own metrics"
    ON public.analytics_metrics FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view their own aggregated metrics"
    ON public.analytics_aggregated_metrics FOR SELECT
    USING (profile_id = auth.uid());

-- Create indexes
CREATE INDEX idx_analytics_metrics_profile_timestamp 
    ON public.analytics_metrics(profile_id, timestamp);
CREATE INDEX idx_analytics_metrics_type_name 
    ON public.analytics_metrics(metric_type, metric_name);
CREATE INDEX idx_analytics_aggregated_metrics_profile_period 
    ON public.analytics_aggregated_metrics(profile_id, period_type, period_start);

-- Insert default metric definitions
INSERT INTO public.analytics_metric_definitions 
    (metric_type, metric_name, display_name, description, unit, aggregation_method)
VALUES
    ('financial', 'total_revenue', 'Chiffre d''affaires total', 'Montant total des factures payées', 'EUR', 'sum'),
    ('financial', 'average_invoice_value', 'Valeur moyenne des factures', 'Montant moyen des factures', 'EUR', 'average'),
    ('financial', 'outstanding_invoices', 'Factures en attente', 'Montant total des factures non payées', 'EUR', 'sum'),
    ('clients', 'total_clients', 'Nombre total de clients', 'Nombre total de clients actifs', 'count', 'last'),
    ('clients', 'new_clients', 'Nouveaux clients', 'Nombre de nouveaux clients', 'count', 'sum'),
    ('tasks', 'tasks_completed', 'Tâches terminées', 'Nombre de tâches terminées', 'count', 'sum'),
    ('tasks', 'tasks_overdue', 'Tâches en retard', 'Nombre de tâches en retard', 'count', 'sum'),
    ('employees', 'total_employees', 'Nombre total d''employés', 'Nombre total d''employés actifs', 'count', 'last'),
    ('inventory', 'low_stock_items', 'Articles en stock bas', 'Nombre d''articles en stock bas', 'count', 'last'),
    ('inventory', 'stock_value', 'Valeur du stock', 'Valeur totale du stock', 'EUR', 'last');

-- Create function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_metrics(
    p_profile_id uuid,
    p_period_type text,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone
)
RETURNS void AS $$
BEGIN
    -- Insert aggregated metrics
    INSERT INTO public.analytics_aggregated_metrics (
        profile_id,
        metric_type,
        metric_name,
        metric_value,
        period_type,
        period_start,
        period_end
    )
    SELECT 
        am.profile_id,
        am.metric_type,
        am.metric_name,
        CASE amd.aggregation_method
            WHEN 'sum' THEN SUM(am.metric_value)
            WHEN 'average' THEN AVG(am.metric_value)
            WHEN 'count' THEN COUNT(am.metric_value)
            WHEN 'last' THEN MAX(am.metric_value)
            WHEN 'min' THEN MIN(am.metric_value)
            WHEN 'max' THEN MAX(am.metric_value)
        END as metric_value,
        p_period_type,
        p_start_date,
        p_end_date
    FROM public.analytics_metrics am
    JOIN public.analytics_metric_definitions amd 
        ON am.metric_type = amd.metric_type 
        AND am.metric_name = amd.metric_name
    WHERE 
        am.profile_id = p_profile_id
        AND am.timestamp >= p_start_date
        AND am.timestamp < p_end_date
    GROUP BY 
        am.profile_id,
        am.metric_type,
        am.metric_name,
        amd.aggregation_method;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_daily_metrics()
RETURNS void AS $$
DECLARE
    profile record;
    yesterday date := current_date - interval '1 day';
BEGIN
    FOR profile IN SELECT DISTINCT profile_id FROM public.analytics_metrics
    LOOP
        PERFORM aggregate_metrics(
            profile.profile_id,
            'daily',
            yesterday::timestamp with time zone,
            (yesterday + interval '1 day')::timestamp with time zone
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to record metric
CREATE OR REPLACE FUNCTION record_metric(
    p_profile_id uuid,
    p_metric_type text,
    p_metric_name text,
    p_metric_value numeric,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
    v_metric_id uuid;
BEGIN
    INSERT INTO public.analytics_metrics (
        profile_id,
        metric_type,
        metric_name,
        metric_value,
        metadata
    )
    VALUES (
        p_profile_id,
        p_metric_type,
        p_metric_name,
        p_metric_value,
        p_metadata
    )
    RETURNING id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql;
