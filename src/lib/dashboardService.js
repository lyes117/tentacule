import { supabase } from './supabase';

export const dashboardService = {
  async getDashboardStats() {
    const { data: { user } } = await supabase.auth.getUser();

    const [
      employeesCount,
      activeTasks,
      clientsCount,
      invoicesStats
    ] = await Promise.all([
      // Nombre d'employés
      supabase
        .from('employees')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id),

      // Tâches actives
      supabase
        .from('tasks')
        .select('id, status')
        .eq('profile_id', user.id),

      // Nombre de clients
      supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id),

      // Statistiques des factures
      supabase
        .from('invoices')
        .select('total, status')
        .eq('profile_id', user.id)
    ]);

    const tasksStats = {
      total: activeTasks.data?.length || 0,
      pending: activeTasks.data?.filter(t => t.status === 'pending').length || 0,
      inProgress: activeTasks.data?.filter(t => t.status === 'in-progress').length || 0,
      completed: activeTasks.data?.filter(t => t.status === 'completed').length || 0
    };

    const totalRevenue = invoicesStats.data
      ?.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

    return {
      employeesCount: employeesCount.count || 0,
      tasksStats,
      clientsCount: clientsCount.count || 0,
      totalRevenue
    };
  },

  async getRecentActivity() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  },

  async getTasksOverview() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:employees(id, first_name, last_name)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  }
};
