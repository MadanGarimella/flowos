import { useEffect, useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { API_URL } from "./api/client";
import { clearStoredSession, hasStoredToken, loadStoredSession, saveStoredUser } from "./utils/sessionStorage";

export default function App() {
  const [checkingSession, setCheckingSession] = useState(hasStoredToken);
  const [session, setSession] = useState(loadStoredSession);

  useEffect(() => {
    if (!session?.token) {
      setCheckingSession(false);
      return;
    }
    setCheckingSession(true);
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Session expired");
        return response.json();
      })
      .then((user) => {
        saveStoredUser(user);
        setSession((current) => current ? { ...current, user } : current);
      })
      .catch(() => {
        clearStoredSession();
        setSession(null);
      })
      .finally(() => setCheckingSession(false));
  }, [session?.token]);

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-paper text-sm text-slate-500">Loading workspace...</main>;
  }

  if (!session) {
    const inviteToken = window.location.pathname.startsWith("/invite/")
      ? window.location.pathname.split("/invite/")[1]
      : null;
    return <LoginPage inviteToken={inviteToken} onLogin={setSession} />;
  }

  return (
    <WorkspacePage
      session={session}
      onLogout={() => {
        clearStoredSession();
        setSession(null);
      }}
    />
  );
}
