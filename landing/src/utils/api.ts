/**
 * Get the API URL based on the current environment
 * - In production (solarbuyside.com.br): uses Render backend
 * - In development: uses VITE_API_URL env variable or localhost:5000
 */
export const getApiUrl = (): string => {
  // Explicit env var always wins (useful for production overrides)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // In production (deployed site), use Render backend
  if (
    window.location.hostname === 'solarbuyside.com.br' ||
    window.location.hostname === 'www.solarbuyside.com.br'
  ) {
    return 'https://solar-buy-side-v2.onrender.com'
  }

  // In development, fallback to localhost
  return 'http://localhost:5000'
}

export const API_URL = getApiUrl()
