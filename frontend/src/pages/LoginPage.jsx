import { useEffect, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, RefreshCw, UserPlus } from "lucide-react";
import { API_URL } from "../api/client";
import { BRAND_LOGO_URL } from "../constants/brand";
import { SelectInput, TextInput } from "../components/common/Inputs";
import { BrandLogo } from "../components/layout/BrandLogo";
import { organizationIndustries } from "../constants/workflow";
import { saveStoredSession } from "../utils/sessionStorage";

export function LoginPage({ inviteToken, onLogin }) {
  const [page, setPage] = useState(inviteToken ? "invite" : "organization");
  const [organization, setOrganization] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [invite, setInvite] = useState(null);
  const [login, setLogin] = useState({ organizationSlug: "", email: "", password: "" });
  const [adminSignup, setAdminSignup] = useState({
    organizationName: "",
    industry: "GENERAL_BUSINESS",
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
        setNotice(`Workspace found. Sign in with your account, or ask your admin for an invitation.`);
        setPage("login");
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
      saveStoredSession(data);
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
      saveStoredSession(data);
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
        <section className="h-screen overflow-y-auto px-6 py-10 sm:px-12 lg:px-20">
          <div className="w-full max-w-xl mt-16">
            <div className="relative w-[200px] h-[20px] overflow-visible">
              <img
                src="/flowos-logo.png"
                alt="FlowOS"
                className="absolute left-14 mt-10 w-auto h-[150px] -translate-y-1/2 object-contain scale-[2]"
              />
            </div>
            {/* {page !== "organization" && !inviteToken && (
              <button type="button" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ocean" onClick={goBack}>
                <ArrowLeft size={16} /> Change organization
              </button>
            )} */}

            {page === "organization" && (
              <form onSubmit={checkOrganization} className="max-w-md space-y-5 mt-20">
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
                  <h2 className="text-2xl font-semibold mt-16">Register organization</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">This is the first account for this organization. Assign an admin to monitor projects, tasks, and members.</p>
                </div>
                <TextInput label="Organization name" value={adminSignup.organizationName} onChange={(value) => setAdminSignup({ ...adminSignup, organizationName: value })} required />
                <SelectInput label="Primary business" value={adminSignup.industry} onChange={(value) => setAdminSignup({ ...adminSignup, industry: value })} options={organizationIndustries} />
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
                  <h2 className="text-2xl font-semibold mt-14">Sign in</h2>
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
                  <h2 className="text-2xl font-semibold mt-14">Accept invitation</h2>
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

        <section className="hidden h-screen bg-ink text-white lg:sticky lg:top-0 lg:flex lg:items-center lg:justify-center">
          <div className="w-full max-w-2xl px-12">

            {/* Logo */}
            <div className="relative w-[200px] h-[20px] overflow-visible mt-10">
              <img
                src="/logo3.png"
                alt="FlowOS"
                className="absolute left-14 w-auto h-[130px] -translate-y-1/2 object-contain scale-[2]"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-20">
              {["Organizations", "Projects", "Tasks", "Teams", "Collaborations"].map((label) => (
                <div key={label} className="border border-white/15 p-5">
                  <p className="text-sm text-white/60">{label}</p>
                  {/* <p className="mt-6 text-2xl font-semibold">Ready</p> */}
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="max-w-xl text-2xl font-medium leading-snug text-white mt-10">
              Run projects, operations, approvals, teams, deadlines, and client work
              from one controlled workspace.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

function BrandHeader() {
  return (
    <div className="mb-[-50px]">
      <BrandLogo />
    </div>
  );
}
