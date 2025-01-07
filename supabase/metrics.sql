-- Ajout des tables pour les métriques utilisateur

-- Table des métriques générales
CREATE TABLE public.user_metrics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_employees INT DEFAULT 0,
  active_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  total_clients INT DEFAULT 0,
  total_invoices INT DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des métriques de tâches
CREATE TABLE public.task_metrics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_created INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  tasks_overdue INT DEFAULT 0,
  average_completion_time INTERVAL,
  UNIQUE(profile_id, date)
);

-- Table des métriques financières
CREATE TABLE public.financial_metrics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(15,2) DEFAULT 0,
  expenses DECIMAL(15,2) DEFAULT 0,
  outstanding_invoices DECIMAL(15,2) DEFAULT 0,
  paid_invoices DECIMAL(15,2) DEFAULT 0,
  UNIQUE(profile_id, date)
);

-- Table des métriques clients
CREATE TABLE public.client_metrics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  new_clients INT DEFAULT 0,
  active_clients INT DEFAULT 0,
  churned_clients INT DEFAULT 0,
  total_client_value DECIMAL(15,2) DEFAULT 0,
  UNIQUE(profile_id, date)
);

-- Table des notifications
CREATE TABLE public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fonction pour mettre à jour les métriques utilisateur
CREATE OR REPLACE FUNCTION update_user_metrics()
RETURNS trigger AS $$
BEGIN
  -- Mise à jour des métriques générales
  INSERT INTO public.user_metrics (profile_id)
  VALUES (NEW.profile_id)
  ON CONFLICT (profile_id) DO UPDATE
  SET
    total_employees = (SELECT COUNT(*) FROM public.employees WHERE profile_id = NEW.profile_id),
    active_tasks = (SELECT COUNT(*) FROM public.tasks WHERE profile_id = NEW.profile_id AND status = 'in-progress'),
    completed_tasks = (SELECT COUNT(*) FROM public.tasks WHERE profile_id = NEW.profile_id AND status = 'completed'),
    total_clients = (SELECT COUNT(*) FROM public.clients WHERE profile_id = NEW.profile_id),
    total_invoices = (SELECT COUNT(*) FROM public.invoices WHERE profile_id = NEW.profile_id),
    total_revenue = (SELECT COALESCE(SUM(total), 0) FROM public.invoices WHERE profile_id = NEW.profile_id AND status = 'paid'),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour les métriques
CREATE TRIGGER update_metrics_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metrics();

CREATE TRIGGER update_metrics_on_client_change
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metrics();

CREATE TRIGGER update_metrics_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metrics();

-- Politiques de sécurité pour les nouvelles tables
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques d'accès
CREATE POLICY "Users can view their own metrics"
  ON public.user_metrics FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own task metrics"
  ON public.task_metrics FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own financial metrics"
  ON public.financial_metrics FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own client metrics"
  ON public.client_metrics FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (profile_id = auth.uid());
