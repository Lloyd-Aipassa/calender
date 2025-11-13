// API helper composable
export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl || 'https://calender.brooklynwebdesign.nl'

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || ''
    }
    return ''
  }

  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken()

    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    return await $fetch(`${apiBase}/${cleanEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    })
  }

  return {
    apiBase,
    apiCall,
    getAuthToken,
  }
}
