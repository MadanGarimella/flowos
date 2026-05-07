import { useState } from "react";
import { CheckCircle2, ClipboardList, RefreshCw, UserPlus } from "lucide-react";
import { API_URL } from "../api/client";
import { TextInput } from "../components/common/Inputs";

export function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState({
    name: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Invalid email or password");
      }
      const data = await response.json();
      localStorage.setItem("officeflow_token", data.token);
      localStorage.setItem("officeflow_user", JSON.stringify(data.user));
      onLogin(data);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running on port 8080." : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (signup.password !== signup.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not create account");
      }
      setEmail(signup.email);
      setPassword("");
      setSignup({ name: "", designation: "", email: "", password: "", confirmPassword: "" });
      setMode("login");
      setNotice("Account created. Please sign in.");
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running on port 8080." : err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateSignup(key, value) {
    setSignup((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-20">
          <div className="w-full max-w-xl">
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center bg-ocean text-white">
                <ClipboardList size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-normal">OfficeFlow</h1>
                <p className="text-sm text-slate-600">Internal task control desk</p>
              </div>
            </div>

            <div className="mb-6 inline-flex border border-slate-300 bg-white p-1">
              <button className={`segmented-button ${mode === "login" ? "segmented-button-active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
                Login
              </button>
              <button className={`segmented-button ${mode === "signup" ? "segmented-button-active" : ""}`} onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>
                Signup
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={submitLogin} className="max-w-md space-y-5">
                <label className="block">
                  <span className="label">Office email</span>
                  <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className="block">
                  <span className="label">Password</span>
                  <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                {notice && <p className="text-sm text-moss">{notice}</p>}
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Sign in
                </button>
              </form>
            ) : (
              <form onSubmit={submitSignup} className="max-w-md space-y-4">
                <TextInput label="Name" value={signup.name} onChange={(value) => updateSignup("name", value)} required />
                <TextInput label="Designation" value={signup.designation} onChange={(value) => updateSignup("designation", value)} required />
                <TextInput label="Office email" type="email" value={signup.email} onChange={(value) => updateSignup("email", value)} required />
                <TextInput label="Password" type="password" value={signup.password} onChange={(value) => updateSignup("password", value)} required minLength={8} />
                <TextInput label="Confirm password" type="password" value={signup.confirmPassword} onChange={(value) => updateSignup("confirmPassword", value)} required minLength={8} />
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  Create account
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="hidden bg-ink text-white lg:block">
          <div className="flex h-full flex-col justify-between p-12">
            <div className="grid grid-cols-2 gap-4">
              {["Projects", "Team", "Tasks", "Comments"].map((label) => (
                <div key={label} className="border border-white/15 p-5">
                  <p className="text-sm text-white/60">{label}</p>
                  <p className="mt-8 text-2xl font-semibold">Ready</p>
                </div>
              ))}
            </div>
            <p className="max-w-md text-2xl font-medium leading-snug">
              Assign owners, watch progress, discuss blockers, and close work without losing the thread.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
