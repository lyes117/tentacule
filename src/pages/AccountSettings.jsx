import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import useStore from '../lib/store';

export default function AccountSettings() {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyData, setCompanyData] = useState({
    company_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    siret: '',
    vat_number: '',
    logo_url: ''
  });

  const [userData, setUserData] = useState({
    email: user?.email || '',
    new_password: '',
    confirm_password: '',
    notification_preferences: {
      email_notifications: true,
      invoice_reminders: true,
      task_notifications: true
    }
  });

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setCompanyData({
          ...companyData,
          ...data
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update(companyData)
        .eq('id', user?.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Informations de l\'entreprise mises à jour avec succès' });
    } catch (error) {
      console.error('Error updating company data:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des informations' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (userData.new_password !== userData.confirm_password) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: userData.new_password
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
      setUserData({ ...userData, new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preferences: userData.notification_preferences
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Préférences mises à jour avec succès' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des préférences' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Paramètres du compte">
      <div className="space-y-6">
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Company Information */}
        <Card>
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-white">Informations de l'entreprise</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={companyData.company_name}
                  onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className="cosmic-input w-full px-3 py-2 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={companyData.city}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={companyData.postal_code}
                  onChange={(e) => setCompanyData({ ...companyData, postal_code: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  value={companyData.country}
                  onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  value={companyData.siret}
                  onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Numéro de TVA
                </label>
                <input
                  type="text"
                  value={companyData.vat_number}
                  onChange={(e) => setCompanyData({ ...companyData, vat_number: e.target.value })}
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="cosmic-button px-4 py-2 rounded-lg"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </Card>

        {/* User Account Settings */}
        <Card>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Paramètres du compte utilisateur</h2>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Changer le mot de passe</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={userData.new_password}
                    onChange={(e) => setUserData({ ...userData, new_password: e.target.value })}
                    className="cosmic-input w-full px-3 py-2 rounded-lg"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={userData.confirm_password}
                    onChange={(e) => setUserData({ ...userData, confirm_password: e.target.value })}
                    className="cosmic-input w-full px-3 py-2 rounded-lg"
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cosmic-button px-4 py-2 rounded-lg"
                  >
                    {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Préférences de notification</h3>
              <form onSubmit={handlePreferencesUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={userData.notification_preferences.email_notifications}
                      onChange={(e) => setUserData({
                        ...userData,
                        notification_preferences: {
                          ...userData.notification_preferences,
                          email_notifications: e.target.checked
                        }
                      })}
                      className="form-checkbox h-4 w-4 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">Notifications par email</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={userData.notification_preferences.invoice_reminders}
                      onChange={(e) => setUserData({
                        ...userData,
                        notification_preferences: {
                          ...userData.notification_preferences,
                          invoice_reminders: e.target.checked
                        }
                      })}
                      className="form-checkbox h-4 w-4 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">Rappels de factures</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={userData.notification_preferences.task_notifications}
                      onChange={(e) => setUserData({
                        ...userData,
                        notification_preferences: {
                          ...userData.notification_preferences,
                          task_notifications: e.target.checked
                        }
                      })}
                      className="form-checkbox h-4 w-4 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">Notifications de tâches</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cosmic-button px-4 py-2 rounded-lg"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
