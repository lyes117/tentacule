import { supabase } from './supabase';

export const inventoryService = {
  async getInventoryItems() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        supplier:clients(id, company_name),
        movements:inventory_movements(
          id,
          movement_type,
          quantity,
          created_at
        ),
        alerts:inventory_alerts(
          id,
          alert_type,
          status,
          message
        )
      `)
      .eq('profile_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createInventoryItem(itemData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{ ...itemData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInventoryItem(itemId, updates) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .match({ id: itemId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInventoryItem(itemId) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .match({ id: itemId });

    if (error) throw error;
  },

  async recordMovement(movement) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([{
        ...movement,
        profile_id: user.id,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMovements(itemId) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAlerts(status = 'active') {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select(`
        *,
        item:inventory_items(id, name, sku, current_stock)
      `)
      .eq('profile_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async resolveAlert(alertId) {
    const { data, error } = await supabase
      .from('inventory_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .match({ id: alertId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
