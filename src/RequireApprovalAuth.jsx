// RequireApprovalAuth.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabase-client";

const allowedEmails = ["jirving@kgabrunepark.uk"]; // add others here

export default function RequireApprovalAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (mounted) {
        setUser(!error ? data?.user : null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading…</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedEmails.includes(user.email)) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return children;
}
