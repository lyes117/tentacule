import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import ReportModal from '../components/reports/ReportModal';
import { reportService } from '../lib/reportService';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Rapports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Rapports</h2>
          <button
            onClick={() => setShowModal(true)}
            className="cosmic-button px-4 py-2 rounded-lg"
          >
            + Nouveau rapport
          </button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="cosmic-spinner" />
            </div>
          ) : reports.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="cosmic-card p-4 rounded-lg hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{report.title}</h3>
                        <p className="text-sm text-gray-400">{report.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                            {report.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun rapport trouvé</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 cosmic-button px-4 py-2 rounded-lg"
              >
                Créer votre premier rapport
              </button>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchReports();
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
