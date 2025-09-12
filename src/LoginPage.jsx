// LoginPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase-client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // If already signed in, go straight to dashboard
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) navigate('/dashboard', { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) navigate('/dashboard', { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signInEmail = async () => {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    // onAuthStateChange will navigate
  };

  const signUpEmail = async () => {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg('Check your email to confirm your account.');
  };

  const resetPassword = async () => {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg('Password reset email sent. Please check your inbox.');
  };

  const signInGoogle = async () => {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setMsg(error.message);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create an account' : 'Reset your password'}
        </h1>

        {msg && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {msg}
          </div>
        )}

        {/* Email */}
        <label className="block text-sm text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 mb-3 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {/* Password (not shown in reset mode) */}
        {mode !== 'reset' && (
          <>
            <label className="block text-sm text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 mb-4 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </>
        )}

        {/* Primary action */}
        <button
          type="button"
          disabled={busy}
          onClick={mode === 'signin' ? signInEmail : mode === 'signup' ? signUpEmail : resetPassword}
          className="mb-3 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy
            ? 'Please wait…'
            : mode === 'signin'
            ? 'Sign in'
            : mode === 'signup'
            ? 'Create account'
            : 'Send reset link'}
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="px-3 text-xs uppercase tracking-wide text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={signInGoogle}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.739 31.563 29.223 35 24 35 16.82 35 11 29.18 11 22S16.82 9 24 9c3.419 0 6.532 1.285 8.899 3.387l5.657-5.657C34.675 3.039 29.602 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24 24-10.745 24-24c0-1.627-.167-3.217-.389-4.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.68 16.048 18.958 13 24 13c3.419 0 6.532 1.285 8.899 3.387l5.657-5.657C34.675 3.039 29.602 1 24 1 14.616 1 6.616 6.16 2.976 13.691z"/>
            <path fill="#4CAF50" d="M24 47c5.32 0 10.223-1.839 14.055-4.938l-6.483-5.315C29.999 38.53 27.146 39.5 24 39.5c-5.178 0-9.564-3.513-11.158-8.243l-6.54 5.037C9.005 42.466 15.961 47 24 47z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303C33.739 31.563 29.223 35 24 35c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.419 0 6.532 1.285 8.899 3.387l5.657-5.657C34.675 3.039 29.602 1 24 1c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24c0-1.627-.167-3.217-.389-4.917z"/>
          </svg>
          Continue with Google
        </button>

        {/* Links */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          {mode !== 'signin' && (
            <button type="button" onClick={() => setMode('signin')} className="underline">
              Have an account? Sign in
            </button>
          )}
          {mode !== 'signup' && (
            <button type="button" onClick={() => setMode('signup')} className="underline">
              Create account
            </button>
          )}
          {mode !== 'reset' && (
            <button type="button" onClick={() => setMode('reset')} className="underline">
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
