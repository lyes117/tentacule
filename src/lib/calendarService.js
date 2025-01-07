import { supabase } from './supabase';

export const calendarService = {
  async getEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('profile_id', user.id)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createEvent(eventData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{ ...eventData, profile_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(eventId, updates) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .match({ id: eventId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .match({ id: eventId });

    if (error) throw error;
  }
};
