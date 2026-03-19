import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure Axios to automatically attach the CSRF token to headers
api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFToken';

function getCsrfCookie() {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

// Fetch CSRF token before any mutating request if cookie is absent
api.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method) && !getCsrfCookie()) {
        await axios.get('http://localhost:8000/api/csrf/', { withCredentials: true });
    }
    return config;
});

// Interceptor to handle auth errors (401/403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth state and redirect to login if session expired
        }
        return Promise.reject(error);
    }
);

export default api;
