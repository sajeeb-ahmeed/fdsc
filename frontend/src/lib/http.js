import axios from 'axios';

const http = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '') + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Auth Token
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s and standardize errors
http.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Extract backend error message if available
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        error.message = message;

        return Promise.reject(error);
    }
);

export default http;
