const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const defaults: RequestInit = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  // Якщо input - це відносний URL, додаємо базовий URL
  let url = input;
  if (typeof input === 'string' && input.startsWith('/')) {
    url = `${API_BASE_URL}${input}`;
  }

  return fetch(url, { ...defaults, ...init });
}