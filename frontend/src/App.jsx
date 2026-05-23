import { useEffect, useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { API_URL } from "./api/client";

export default function App() {
  const [checkingSession, setCheckingSession] = useState(() => Boolean(localStorage.getItem("officeflow_token")));
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("officeflow_token");
    const user = localStorage.getItem("officeflow_user");
    try {
      return token && user ? { token, user: JSON.parse(user) } : null;
    } catch {
      localStorage.removeItem("officeflow_token");
      localStorage.removeItem("officeflow_user");
      return null;
    }
  });

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
        localStorage.setItem("officeflow_user", JSON.stringify(user));
        setSession((current) => current ? { ...current, user } : current);
      })
      .catch(() => {
        localStorage.removeItem("officeflow_token");
        localStorage.removeItem("officeflow_user");
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
        localStorage.removeItem("officeflow_token");
        localStorage.removeItem("officeflow_user");
        setSession(null);
      }}
    />
  );
}
