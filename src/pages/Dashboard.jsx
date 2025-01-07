import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import { Card } from '../components/ui/Card';
import { metricsService } from '../lib/metricsService';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await metricsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <div className="animate-pulse p-6">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Tableau de bord">
        <Card>
          <div className="p-4 text-center text-red-400">
            Une erreur est survenue lors du chargement des métriques
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="space-y-6">
        <MetricsOverview metrics={metrics} />
        
        {/* Autres sections du tableau de bord */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Actions rapides
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  title="Nouvelle facture"
                  href="/dashboard/invoices"
                />
                <QuickActionButton
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                  title="Nouvelle tâche"
                  href="/dashboard/tasks"
                />
                <QuickActionButton
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  }
                  title="Nouveau client"
                  href="/dashboard/clients"
                />
                <QuickActionButton
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  }
                  title="Nouvel article"
                  href="/dashboard/inventory"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Activité récente
              </h3>
              <div className="space-y-4">
                <div className="text-gray-400 text-center py-4">
                  Les activités récentes seront affichées ici
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickActionButton({ icon, title, href }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/50 hover:bg-purple-500/10 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
    >
      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
        {icon}
      </div>
      <span className="text-sm font-medium text-white">{title}</span>
    </a>
  );
}
