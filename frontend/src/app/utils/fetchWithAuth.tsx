export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const defaults: RequestInit = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  return fetch(input, { ...defaults, ...init });
}