const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const defaults: RequestInit = {
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
  };

  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];
    
    if (token) {
      defaults.headers = {
        ...defaults.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  let url = input;
  if (typeof input === 'string' && input.startsWith('/')) {
    url = `${API_BASE_URL}${input}`;
  }

  try {
    const response = await fetch(url, { 
      ...defaults, 
      ...init,
      headers: {
        ...defaults.headers,
        ...init.headers
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${url}`, {
        status: response.status,
        statusText: response.statusText,
      });
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}