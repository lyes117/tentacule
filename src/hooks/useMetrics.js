import { useState, useEffect } from 'react';
import { metricsService } from '../lib/metricsService';

export function useMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await metricsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}

export function useCategoryMetrics(category, period = 'daily') {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        let data;
        if (period === 'daily') {
          data = await metricsService.getDailyMetrics(
            category,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );
        } else {
          const year = endDate.getFullYear();
          const month = endDate.getMonth() + 1;
          data = await metricsService.getMonthlyMetrics(category, year, month);
        }

        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [category, period]);

  return { metrics, loading, error };
}

export function useMetricDefinitions() {
  const [definitions, setDefinitions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        setLoading(true);
        const data = await metricsService.getMetricDefinitions();
        setDefinitions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitions();
  }, []);

  return { definitions, loading, error };
}
