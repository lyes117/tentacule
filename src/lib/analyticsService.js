import { supabase } from './supabase';

export const analyticsService = {
  async recordMetric(metricType, metricName, metricValue, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('record_metric', {
        p_profile_id: user.id,
        p_metric_type: metricType,
        p_metric_name: metricName,
        p_metric_value: metricValue,
        p_metadata: metadata
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording metric:', error);
      throw error;
    }
  },

  async getMetrics(metricType, startDate, endDate) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('profile_id', user.id)
        .eq('metric_type', metricType)
        .gte('timestamp', startDate)
        .lt('timestamp', endDate)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  async getAggregatedMetrics(periodType, startDate, endDate) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('analytics_aggregated_metrics')
        .select('*')
        .eq('profile_id', user.id)
        .eq('period_type', periodType)
        .gte('period_start', startDate)
        .lt('period_end', endDate)
        .order('period_start', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      throw error;
    }
  },

  async getMetricDefinitions() {
    try {
      const { data, error } = await supabase
        .from('analytics_metric_definitions')
        .select('*')
        .order('metric_type', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching metric definitions:', error);
      throw error;
    }
  },

  async getDashboardMetrics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get today's date boundaries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get current metrics
      const { data: currentMetrics, error: currentError } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('profile_id', user.id)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString());

      if (currentError) throw currentError;

      // Get previous day's metrics for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: previousMetrics, error: previousError } = await supabase
        .from('analytics_aggregated_metrics')
        .select('*')
        .eq('profile_id', user.id)
        .eq('period_type', 'daily')
        .eq('period_start', yesterday.toISOString());

      if (previousError) throw previousError;

      // Process and return the metrics
      return this.processMetricsComparison(currentMetrics, previousMetrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  processMetricsComparison(currentMetrics, previousMetrics) {
    const metrics = {};
    const processedMetrics = {};

    // Process current metrics
    currentMetrics.forEach(metric => {
      if (!metrics[metric.metric_name]) {
        metrics[metric.metric_name] = {
          current: 0,
          previous: 0
        };
      }
      metrics[metric.metric_name].current += metric.metric_value;
    });

    // Process previous metrics
    previousMetrics.forEach(metric => {
      if (!metrics[metric.metric_name]) {
        metrics[metric.metric_name] = {
          current: 0,
          previous: 0
        };
      }
      metrics[metric.metric_name].previous += metric.metric_value;
    });

    // Calculate changes and format metrics
    Object.entries(metrics).forEach(([name, values]) => {
      const percentChange = values.previous !== 0
        ? ((values.current - values.previous) / values.previous) * 100
        : 0;

      processedMetrics[name] = {
        value: values.current,
        change: percentChange.toFixed(1),
        trend: percentChange >= 0 ? 'up' : 'down'
      };
    });

    return processedMetrics;
  }
};
