export const API_URL = "https://retained-antiques-walk-anonymous.trycloudflare.com";

export async function request(path, options, token) {
  const headers = {
    "Content-Type": "application/json",
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
