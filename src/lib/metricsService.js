import { supabase } from './supabase';

export const metricsService = {
  async getDashboardMetrics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Récupérer les métriques de base
      const [
        revenueData,
        clientsData,
        tasksData,
        invoicesData
      ] = await Promise.all([
        // Chiffre d'affaires (factures payées)
        supabase
          .from('invoices')
          .select('total')
          .eq('profile_id', user.id)
          .eq('status', 'paid'),

        // Clients actifs
        supabase
          .from('clients')
          .select('id')
          .eq('profile_id', user.id)
          .eq('status', 'active'),

        // Tâches en cours
        supabase
          .from('tasks')
          .select('id, status')
          .eq('profile_id', user.id),

        // Factures impayées
        supabase
          .from('invoices')
          .select('total')
          .eq('profile_id', user.id)
          .eq('status', 'pending')
      ]);

      // Calculer les totaux
      const revenue = revenueData.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
      const activeClients = clientsData.data?.length || 0;
      const pendingTasks = tasksData.data?.filter(t => t.status === 'pending').length || 0;
      const pendingInvoices = invoicesData.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      // Récupérer les métriques d'hier pour la comparaison
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [
        yesterdayRevenue,
        yesterdayClients,
        yesterdayTasks,
        yesterdayPendingInvoices
      ] = await Promise.all([
        supabase
          .from('metrics_daily')
          .select('total_value')
          .eq('profile_id', user.id)
          .eq('category', 'financial')
          .eq('metric_name', 'revenue')
          .eq('date', yesterdayStr)
          .single(),

        supabase
          .from('metrics_daily')
          .select('total_value')
          .eq('profile_id', user.id)
          .eq('category', 'clients')
          .eq('metric_name', 'active_clients')
          .eq('date', yesterdayStr)
          .single(),

        supabase
          .from('metrics_daily')
          .select('total_value')
          .eq('profile_id', user.id)
          .eq('category', 'tasks')
          .eq('metric_name', 'pending_tasks')
          .eq('date', yesterdayStr)
          .single(),

        supabase
          .from('metrics_daily')
          .select('total_value')
          .eq('profile_id', user.id)
          .eq('category', 'financial')
          .eq('metric_name', 'pending_invoices')
          .eq('date', yesterdayStr)
          .single()
      ]);

      // Calculer les variations
      const calculateChange = (current, previous) => {
        if (!previous || previous.total_value === 0) return 0;
        return ((current - previous.total_value) / previous.total_value) * 100;
      };

      return {
        revenue: {
          value: revenue,
          change: calculateChange(revenue, yesterdayRevenue?.data),
          trend: revenue >= (yesterdayRevenue?.data?.total_value || 0) ? 'up' : 'down'
        },
        active_clients: {
          value: activeClients,
          change: calculateChange(activeClients, yesterdayClients?.data),
          trend: activeClients >= (yesterdayClients?.data?.total_value || 0) ? 'up' : 'down'
        },
        pending_tasks: {
          value: pendingTasks,
          change: calculateChange(pendingTasks, yesterdayTasks?.data),
          trend: pendingTasks <= (yesterdayTasks?.data?.total_value || 0) ? 'up' : 'down'
        },
        pending_invoices: {
          value: pendingInvoices,
          change: calculateChange(pendingInvoices, yesterdayPendingInvoices?.data),
          trend: pendingInvoices <= (yesterdayPendingInvoices?.data?.total_value || 0) ? 'up' : 'down'
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  formatMetricValue(value, unit) {
    switch (unit) {
      case 'EUR':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString('fr-FR');
      default:
        return value;
    }
  }
};
