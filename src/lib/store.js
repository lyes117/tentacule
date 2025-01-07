import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      initialized: false,
      notifications: [],
      unreadNotificationsCount: 0,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      
      fetchNotifications: async () => {
        try {
          const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          const unreadCount = notifications.filter(n => !n.read).length;
          set({ notifications, unreadNotificationsCount: unreadCount });
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      },

      markNotificationAsRead: async (notificationId) => {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .match({ id: notificationId });

          if (error) throw error;

          await get().fetchNotifications();
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          set({ user: data.user, session: data.session });
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, session: null });
          window.location.href = '/';
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }
    }),
    {
      name: 'tentacule-storage',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);

export default useStore;
