// AuthCallback.jsx
import { useEffect } from 'react';
import { supabase } from './supabase-client';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // When supabase returns here, session is already set in local storage.
    // You can optionally check it and then send user on their way.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // You could stash session/user into your app state here if you keep one.
      navigate('/', { replace: true });
    })();
  }, [navigate]);

  return <div className="p-6 text-gray-600">Signing you in…</div>;
}
