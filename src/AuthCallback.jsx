// AuthCallback.jsx
import { useEffect } from 'react';
import { supabase } from './supabase-client';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // Parses the hash, stores the session if present
      await supabase.auth.getSession();
      // Send the user someplace useful after login
      navigate('/dashboard', { replace: true });
    })();
  }, [navigate]);

  return <div className="p-6 text-gray-600">Signing you in…</div>;
}
