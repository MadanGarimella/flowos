import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { WorkspacePage } from "./pages/WorkspacePage";

export default function App() {
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

  if (!session) {
    return <LoginPage onLogin={setSession} />;
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
