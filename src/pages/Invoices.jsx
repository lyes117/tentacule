import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import InvoiceModal from '../components/invoices/InvoiceModal';
import { invoiceService } from '../lib/invoiceService';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon', color: 'gray' },
  { value: 'pending', label: 'En attente', color: 'yellow' },
  { value: 'paid', label: 'Payée', color: 'green' },
  { value: 'cancelled', label: 'Annulée', color: 'red' },
  { value: 'overdue', label: 'En retard', color: 'orange' }
];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    // Fermer le menu si on clique en dehors
    const handleClickOutside = (event) => {
      if (openStatusMenu && !event.target.closest('.status-menu')) {
        setOpenStatusMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openStatusMenu]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, newStatus);
      await fetchInvoices();
      setOpenStatusMenu(null);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'paid':
        return 'bg-green-500/20 text-green-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      case 'overdue':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const StatusMenu = ({ invoice }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-900/95 border border-gray-700 z-50 status-menu">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(invoice.id, option.value);
          }}
          className={`w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-gray-800 transition-colors
            ${invoice.status === option.value ? 'bg-gray-800' : ''}`}
        >
          <span className={`w-2 h-2 rounded-full bg-${option.color}-400`} />
          <span className="text-sm text-gray-200">{option.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout title="Factures">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Liste des factures</h2>
            <p className="text-gray-400 mt-1">
              {invoices.length} facture{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedInvoice(null);
              setShowModal(true);
            }}
            className="cosmic-button px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouvelle facture</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <Card>
          {loading ? (
            <div className="animate-pulse p-6 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      N° Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Montant TTC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {invoice.invoice_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {invoice.client?.company_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {invoice.client?.contact_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {invoiceService.formatAmount(invoice.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative status-menu">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusMenu(openStatusMenu === invoice.id ? null : invoice.id);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${getStatusColor(invoice.status)}`}
                          >
                            <span>{getStatusLabel(invoice.status)}</span>
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                openStatusMenu === invoice.id ? 'transform rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openStatusMenu === invoice.id && <StatusMenu invoice={invoice} />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowModal(true);
                            }}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            title="Modifier"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => invoiceService.generatePDF(invoice.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Exporter en PDF"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                                invoiceService.deleteInvoice(invoice.id).then(fetchInvoices);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">Aucune facture</h3>
              <p className="mt-1 text-sm text-gray-400">
                Commencez par créer votre première facture.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="cosmic-button px-4 py-2 rounded-lg"
                >
                  Nouvelle facture
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowModal(false);
            setSelectedInvoice(null);
          }}
          onSave={fetchInvoices}
        />
      )}
    </DashboardLayout>
  );
}
