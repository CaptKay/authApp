import axios from 'axios'

const fallbackBaseUrl =
  (typeof window !== 'undefined' && window.orderlyDesktop?.apiBaseUrl) ||
  'http://localhost:3000/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || fallbackBaseUrl,
  withCredentials: true, // for refresh cookie
})

// Attach access token per request (set by AuthProvider)
export function setAccessToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function fetchMe() {
  const r = await api.get('/me')
  return r.data
}

let refreshing = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {}
    if (!response || response.status !== 401 || config?.__retried) {
      throw error
    }

    try {
      if (!refreshing) {
        refreshing = api.post('/auth/refresh').finally(() => {
          refreshing = null
        })
      }

      const refreshResp = await refreshing
      const newToken = refreshResp?.data?.accessToken
      if (!newToken) {
        throw error
      }

      setAccessToken(newToken)
      config.__retried = true
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${newToken}`,
      }

      return api(config)
    } catch (refreshError) {
      setAccessToken(null)
      throw refreshError
    }
  }
)

export default api
