// RequireAuth.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabase-client';

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true

    // 1) check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setStatus(session ? 'in' : 'out');
    });

    // 2) subscribe to changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'in' : 'out');
    });

    return () => {
      mounted = false
      sub.subscription.unsubscribe();
    }
      
      
  }, []);

  if (status === 'loading') return <div className="p-6 text-gray-600">Loading…</div>;
  if (status === 'out') return <Navigate to="/login" replace />; // create a /login route with the LoginButton
  return children;
}
