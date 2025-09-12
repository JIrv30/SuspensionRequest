import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {supabase} from './supabase-client'
import { LoginButton, LogoutButton } from "./LoginButton";

export default function Header() {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || "");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / Title */}
        <h1 className="text-xl font-bold text-indigo-700">
          Suspension Management
        </h1>
        {userEmail ? (
          <>
            <span className="text-sm text-gray-600">{userEmail}</span>
              <LogoutButton />
          </>
        ) : (
          <LoginButton />
        )}

        {/* Nav Buttons */}
        <nav className="flex gap-3">
          <Link
            to="/form"
            className={`rounded-lg px-4 py-2 font-medium ${
              location.pathname === "/form"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            New Suspension
          </Link>

          <Link
            to="/approvals"
            className={`rounded-lg px-4 py-2 font-medium ${
              location.pathname === "/approvals"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Authorisation
          </Link>

          <Link
            to="/dashboard"
            className={`rounded-lg px-4 py-2 font-medium ${
              location.pathname === "/dashboard"
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
