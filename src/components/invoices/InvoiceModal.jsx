import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../lib/invoiceService';
import { clientService } from '../../lib/clientService';

export default function InvoiceModal({ invoice, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 20 }],
    notes: '',
    company_details: {},
    payment_conditions: 'À régler sous 30 jours',
    payment_method: 'Virement bancaire'
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchCompanyProfile();
    if (invoice) {
      setFormData({
        client_id: invoice.client_id,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        items: invoice.invoice_items || [{ description: '', quantity: 1, unit_price: 0, tax_rate: 20 }],
        notes: invoice.notes || '',
        company_details: invoice.company_details || {},
        payment_conditions: invoice.payment_conditions || 'À régler sous 30 jours',
        payment_method: invoice.payment_method || 'Virement bancaire'
      });
    }
  }, [invoice]);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Erreur lors du chargement des clients');
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const profile = await invoiceService.getCompanyProfile();
      setCompanyProfile(profile);
      if (!invoice) {
        setFormData(prev => ({
          ...prev,
          company_details: {
            company_name: profile.company_name,
            address: profile.address,
            postal_code: profile.postal_code,
            city: profile.city,
            country: profile.country,
            phone: profile.phone,
            email: profile.email,
            siret: profile.siret,
            vat_number: profile.vat_number
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.client_id) {
        throw new Error('Veuillez sélectionner un client');
      }
      if (!formData.due_date) {
        throw new Error('Veuillez définir une date d\'échéance');
      }
      if (formData.items.length === 0) {
        throw new Error('Veuillez ajouter au moins un article');
      }
      if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
        throw new Error('Veuillez remplir correctement tous les articles');
      }

      if (invoice) {
        await invoiceService.updateInvoice(invoice.id, formData);
      } else {
        await invoiceService.createInvoice(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError(error.message || 'Erreur lors de l\'enregistrement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 20 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' ? parseInt(value) || 0 : 
               field === 'unit_price' ? parseFloat(value) || 0 : 
               field === 'tax_rate' ? parseFloat(value) || 0 :
               value
    };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    return formData.items.reduce((totals, item) => {
      const amount = item.quantity * item.unit_price;
      const taxAmount = (amount * item.tax_rate) / 100;
      return {
        subtotal: totals.subtotal + amount,
        tax_amount: totals.tax_amount + taxAmount,
        total: totals.total + amount + taxAmount
      };
    }, { subtotal: 0, tax_amount: 0, total: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="cosmic-card w-full max-w-4xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Dates */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Client
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name || client.contact_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date de facturation
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                required
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Articles</h3>
              <button
                type="button"
                onClick={addItem}
                className="cosmic-button px-3 py-1 rounded-lg text-sm"
              >
                + Ajouter un article
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="cosmic-input w-full px-3 py-2 rounded-lg"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      min="1"
                      placeholder="Quantité"
                      className="cosmic-input w-full px-3 py-2 rounded-lg"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Prix unitaire"
                      className="cosmic-input w-full px-3 py-2 rounded-lg"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.tax_rate}
                      onChange={(e) => updateItem(index, 'tax_rate', e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="TVA %"
                      className="cosmic-input w-full px-3 py-2 rounded-lg"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      disabled={formData.items.length === 1}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sous-total HT</span>
                  <span className="text-white">{totals.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TVA</span>
                  <span className="text-white">{totals.tax_amount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-300">Total TTC</span>
                  <span className="text-white">{totals.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Conditions de paiement
              </label>
              <input
                type="text"
                value={formData.payment_conditions}
                onChange={(e) => setFormData({ ...formData, payment_conditions: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Méthode de paiement
              </label>
              <input
                type="text"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="cosmic-input w-full px-3 py-2 rounded-lg"
              rows="3"
            />
          </div>

          {/* Informations légales de l'entreprise */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-4">Informations légales de l'entreprise</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={formData.company_details.company_name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      company_name: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  value={formData.company_details.siret || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      siret: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Numéro de TVA
                </label>
                <input
                  type="text"
                  value={formData.company_details.vat_number || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      vat_number: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  RCS
                </label>
                <input
                  type="text"
                  value={formData.company_details.rcs || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      rcs: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.company_details.address || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      address: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.company_details.postal_code || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      postal_code: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.company_details.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      city: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.company_details.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      phone: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.company_details.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      email: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Informations bancaires
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.company_details.bank_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      company_details: {
                        ...formData.company_details,
                        bank_name: e.target.value
                      }
                    })}
                    placeholder="Nom de la banque"
                    className="cosmic-input w-full px-3 py-2 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.company_details.iban || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      company_details: {
                        ...formData.company_details,
                        iban: e.target.value
                      }
                    })}
                    placeholder="IBAN"
                    className="cosmic-input w-full px-3 py-2 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.company_details.bic || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      company_details: {
                        ...formData.company_details,
                        bic: e.target.value
                      }
                    })}
                    placeholder="BIC/SWIFT"
                    className="cosmic-input w-full px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mentions légales supplémentaires
                </label>
                <textarea
                  value={formData.company_details.legal_mentions || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    company_details: {
                      ...formData.company_details,
                      legal_mentions: e.target.value
                    }
                  })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                  rows="3"
                  placeholder="Mentions légales supplémentaires à afficher sur la facture"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cosmic-button px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
