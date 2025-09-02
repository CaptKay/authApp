import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, //for refresh cookie
})

//Attach access token per request (set by AuthProvider)
export function setAccessToken(token){
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ' ';
}

//Response interceptor: 401, try refresh once
