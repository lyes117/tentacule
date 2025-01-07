import { supabase } from './supabase';

export const employeeService = {
  async getEmployees() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('profile_id', user.id)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createEmployee(employeeData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmployee(employeeId, updates) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .match({ id: employeeId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmployee(employeeId) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .match({ id: employeeId });

    if (error) throw error;
  }
};
