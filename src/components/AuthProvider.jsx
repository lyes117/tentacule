import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../lib/store';
import { supabase } from '../lib/supabase';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { setUser, setSession, setInitialized } = useStore();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setSession(session);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user);
          setSession(session);
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return children;
}
