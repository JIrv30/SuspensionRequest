import { supabase } from "./supabase-client";

export function LoginButton () {
  const signInWithGoogle = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if(error) console.error('OAuth.error:',error.message)
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
    >
      Sign in with Google
    </button>
  );
}

export function LogoutButton() {
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
  };

  return (
    <button
      onClick={signOut}
      className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
    >
      Sign out
    </button>
  );
}