import { useEffect, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, ClipboardList, RefreshCw, UserPlus } from "lucide-react";
import { API_URL } from "../api/client";
import { TextInput } from "../components/common/Inputs";

export function LoginPage({ inviteToken, onLogin }) {
  const [page, setPage] = useState(inviteToken ? "invite" : "organization");
  const [organization, setOrganization] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [invite, setInvite] = useState(null);
  const [login, setLogin] = useState({ organizationSlug: "", email: "", password: "" });
  const [adminSignup, setAdminSignup] = useState({
    organizationName: "",
    name: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [memberSignup, setMemberSignup] = useState({
    name: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [inviteSignup, setInviteSignup] = useState({ name: "", designation: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;
    setPage("invite");
    fetch(`${API_URL}/api/auth/invites/${inviteToken}`)
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message ?? "Invitation is invalid or expired");
        }
        return response.json();
      })
      .then(setInvite)
      .catch((err) => setError(err.message));
  }, [inviteToken]);

  async function checkOrganization(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/api/organizations/lookup?name=${encodeURIComponent(organizationName)}`);
      if (!response.ok) throw new Error("Could not check organization");
      const data = await response.json();
      setOrganization(data);
      if (data.exists) {
        setLogin((current) => ({ ...current, organizationSlug: data.slug }));
        setPage("member-signup");
      } else {
        setAdminSignup((current) => ({ ...current, organizationName: data.name || organizationName }));
        setPage("organization-register");
      }
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running." : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function registerOrganization(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (adminSignup.password !== adminSignup.confirmPassword) throw new Error("Passwords do not match");
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminSignup),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not register organization");
      }
      const data = await response.json();
      setLogin({ organizationSlug: data.organizationSlug, email: adminSignup.email, password: "" });
      setNotice(`Organization registered. Sign in with workspace "${data.organizationSlug}".`);
      setPage("login");
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running." : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function registerMember(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (memberSignup.password !== memberSignup.confirmPassword) throw new Error("Passwords do not match");
      const response = await fetch(`${API_URL}/api/auth/member-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationSlug: organization.slug, ...memberSignup }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not create member account");
      }
      const data = await response.json();
      setLogin({ organizationSlug: data.organizationSlug, email: memberSignup.email, password: "" });
      setNotice("Account created. Please sign in.");
      setPage("login");
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running." : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
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
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. Check that Spring Boot is running." : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitInviteSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (inviteSignup.password !== inviteSignup.confirmPassword) throw new Error("Passwords do not match");
      const response = await fetch(`${API_URL}/api/auth/invites/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken, ...inviteSignup }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not join organization");
      }
      const data = await response.json();
      localStorage.setItem("officeflow_token", data.token);
      localStorage.setItem("officeflow_user", JSON.stringify(data.user));
      window.history.replaceState({}, "", "/");
      onLogin(data);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend is not reachable. " : err.message);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    setNotice("");
    setPage("organization");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-20">
          <div className="w-full max-w-xl">
            <BrandHeader />
            {page !== "organization" && !inviteToken && (
              <button type="button" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ocean" onClick={goBack}>
                <ArrowLeft size={16} /> Change organization
              </button>
            )}

            {page === "organization" && (
              <form onSubmit={checkOrganization} className="max-w-md space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold">Enter your organization</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">We will check whether your workspace already exists and guide you to the right setup.</p>
                </div>
                <TextInput label="Organization name" value={organizationName} onChange={setOrganizationName} required autoFocus />
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                  Continue
                </button>
              </form>
            )}

            {page === "organization-register" && (
              <form onSubmit={registerOrganization} className="max-w-md space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Register organization</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">This is the first account for this organization. Assign an admin to monitor projects, tasks, and members.</p>
                </div>
                <TextInput label="Organization name" value={adminSignup.organizationName} onChange={(value) => setAdminSignup({ ...adminSignup, organizationName: value })} required />
                <TextInput label="Admin name" value={adminSignup.name} onChange={(value) => setAdminSignup({ ...adminSignup, name: value })} required />
                <TextInput label="Admin designation" value={adminSignup.designation} onChange={(value) => setAdminSignup({ ...adminSignup, designation: value })} required />
                <TextInput label="Admin email" type="email" value={adminSignup.email} onChange={(value) => setAdminSignup({ ...adminSignup, email: value })} required />
                <TextInput label="Password" type="password" value={adminSignup.password} onChange={(value) => setAdminSignup({ ...adminSignup, password: value })} required minLength={8} />
                <TextInput label="Confirm password" type="password" value={adminSignup.confirmPassword} onChange={(value) => setAdminSignup({ ...adminSignup, confirmPassword: value })} required minLength={8} />
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  Register organization
                </button>
              </form>
            )}

            {page === "member-signup" && (
              <form onSubmit={registerMember} className="max-w-md space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Create member account</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Organization found: <span className="font-semibold text-ink">{organization?.name}</span>. Create your user account, then sign in.</p>
                </div>
                <TextInput label="Name" value={memberSignup.name} onChange={(value) => setMemberSignup({ ...memberSignup, name: value })} required />
                <TextInput label="Designation" value={memberSignup.designation} onChange={(value) => setMemberSignup({ ...memberSignup, designation: value })} required />
                <TextInput label="Email" type="email" value={memberSignup.email} onChange={(value) => setMemberSignup({ ...memberSignup, email: value })} required />
                <TextInput label="Password" type="password" value={memberSignup.password} onChange={(value) => setMemberSignup({ ...memberSignup, password: value })} required minLength={8} />
                <TextInput label="Confirm password" type="password" value={memberSignup.confirmPassword} onChange={(value) => setMemberSignup({ ...memberSignup, confirmPassword: value })} required minLength={8} />
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  Create member account
                </button>
                <button type="button" className="button-secondary w-full" onClick={() => setPage("login")}>Already have an account</button>
              </form>
            )}

            {page === "login" && (
              <form onSubmit={submitLogin} className="max-w-md space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold">Sign in</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Use your workspace slug, email, and password to continue.</p>
                </div>
                <TextInput label="Workspace" value={login.organizationSlug} onChange={(value) => setLogin({ ...login, organizationSlug: value })} required />
                <TextInput label="Email" type="email" value={login.email} onChange={(value) => setLogin({ ...login, email: value })} required />
                <TextInput label="Password" type="password" value={login.password} onChange={(value) => setLogin({ ...login, password: value })} required />
                {notice && <p className="text-sm text-moss">{notice}</p>}
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Sign in
                </button>
              </form>
            )}

            {page === "invite" && (
              <form onSubmit={submitInviteSignup} className="max-w-md space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Accept invitation</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{invite ? `${invite.organizationName} invited ${invite.email}` : "Loading invitation..."}</p>
                </div>
                <TextInput label="Name" value={inviteSignup.name} onChange={(value) => setInviteSignup({ ...inviteSignup, name: value })} required />
                <TextInput label="Designation" value={inviteSignup.designation} onChange={(value) => setInviteSignup({ ...inviteSignup, designation: value })} required />
                <TextInput label="Password" type="password" value={inviteSignup.password} onChange={(value) => setInviteSignup({ ...inviteSignup, password: value })} required minLength={8} />
                <TextInput label="Confirm password" type="password" value={inviteSignup.confirmPassword} onChange={(value) => setInviteSignup({ ...inviteSignup, confirmPassword: value })} required minLength={8} />
                {error && <p className="text-sm text-rosewood">{error}</p>}
                <button className="button-primary w-full" disabled={loading || !invite}>
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  Join organization
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="hidden bg-ink text-white lg:block">
          <div className="flex h-full flex-col justify-between p-12">
            <div className="grid grid-cols-2 gap-4">
              {["Organizations", "Projects", "Tasks", "Teams"].map((label) => (
                <div key={label} className="border border-white/15 p-5">
                  <p className="text-sm text-white/60">{label}</p>
                  <p className="mt-8 text-2xl font-semibold">Ready</p>
                </div>
              ))}
            </div>
            <p className="max-w-md text-2xl font-medium leading-snug">
              Separate every organization, invite the right people, and keep work visible from summary to board.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BrandHeader() {
  return (
    <div className="mb-10 flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center bg-ocean text-white">
        <ClipboardList size={22} />
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">OfficeFlow</h1>
        <p className="text-sm text-slate-600">Organization work control desk</p>
      </div>
    </div>
  );
}
