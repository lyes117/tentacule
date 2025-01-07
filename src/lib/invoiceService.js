import { supabase } from './supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const invoiceService = {
  async getInvoices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(
            id,
            company_name,
            contact_name,
            email,
            phone,
            address,
            city,
            postal_code,
            country
          )
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async updateInvoiceStatus(invoiceId, status) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  },

  // ... rest of the service methods remain the same ...

  formatAmount(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }
};
