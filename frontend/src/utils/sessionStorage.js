const TOKEN_KEY = "flowos_token";
const USER_KEY = "flowos_user";

export function loadStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  if (!token || !user) return null;
  try {
    const session = { token, user: JSON.parse(user) };
    saveStoredSession(session);
    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function hasStoredToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function saveStoredSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function saveStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
