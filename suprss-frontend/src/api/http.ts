import axios from 'axios';

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/suprss/api',
});

export function setAccessToken(token?: string) {
    if (token) {
        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete http.defaults.headers.common['Authorization'];
    }
}

export function initAuthFromStorage() {
    const token = sessionStorage.getItem('token') ?? localStorage.getItem('token');
    if (token) setAccessToken(token);
}

export function clearAuth() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    setAccessToken(undefined);
}
