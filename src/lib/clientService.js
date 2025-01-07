import { supabase } from './supabase';

export const clientService = {
  async getClients() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        invoices:invoices(
          id,
          invoice_number,
          total,
          status,
          created_at
        )
      `)
      .eq('profile_id', user.id)
      .order('company_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createClient(clientData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...clientData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClient(clientId, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .match({ id: clientId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClient(clientId) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .match({ id: clientId });

    if (error) throw error;
  },

  async getClientDetails(clientId) {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        invoices:invoices(
          id,
          invoice_number,
          total,
          status,
          created_at,
          due_date,
          subtotal,
          tax_rate,
          tax_amount
        )
      `)
      .eq('id', clientId)
      .single();

    if (error) throw error;
    return data;
  }
};
