const configuredApiUrl = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
const apiMode = (import.meta.env.VITE_API_MODE ?? "auto").trim().toLowerCase();

function isLocalFrontend() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)
    || window.location.hostname.startsWith("192.168.");
}

function localApiUrl() {
  if (typeof window === "undefined") return "";
  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)) {
    return "";
  }
  return `${window.location.protocol}//${window.location.hostname}:8080`;
}

export const API_URL = apiMode === "local"
  ? localApiUrl()
  : apiMode === "remote"
    ? configuredApiUrl
    : configuredApiUrl && !isLocalFrontend() ? configuredApiUrl : localApiUrl();

export async function request(path, options, token) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(options.headers ?? {}),
  };
  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch(API_URL + path, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

export async function download(path, token) {
  const response = await fetch(API_URL + path, {
    headers: token ? { Authorization: "Bearer " + token } : {},
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Download failed");
  }
  return response.blob();
}
