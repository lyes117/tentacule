import { supabase } from './supabase';

export const taskService = {
  async createTask(taskData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .match({ id: taskId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .match({ id: taskId });

    if (error) throw error;
  },

  async getTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:employees(id, first_name, last_name)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateTaskStatus(taskId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .match({ id: taskId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
