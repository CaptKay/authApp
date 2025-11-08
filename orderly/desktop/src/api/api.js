import axios from 'axios'

const fallback = typeof window !== 'undefined' && window.orderlyDesktop?.apiBaseUrl
  ? window.orderlyDesktop.apiBaseUrl
  : 'http://localhost:3000/api'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || fallback,
    withCredentials: true, //for refresh cookie
})

//Attach access token per request (set by AuthProvider)
export function setAccessToken(token){
    if(token){
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
}

export async function fetchMe() {
    const r = await api.get('/me')
    return r.data
}

//Response interceptor: 401, try refresh once


export default api
