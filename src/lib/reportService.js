import { supabase } from './supabase';

export const reportService = {
  async getReports() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createReport(reportData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...reportData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async generateReport(reportId) {
    const { data: report } = await this.getReportById(reportId);
    
    // Récupérer les données nécessaires selon le type de rapport
    let reportData = {};
    
    switch (report.type) {
      case 'financial':
        reportData = await this.generateFinancialReport(report);
        break;
      case 'activity':
        reportData = await this.generateActivityReport(report);
        break;
      case 'performance':
        reportData = await this.generatePerformanceReport(report);
        break;
      default:
        reportData = await this.generateCustomReport(report);
    }

    return reportData;
  },

  async getReportById(reportId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;
    return data;
  }
};
