import axios from 'axios';
import API_URL from './api';

let csrfToken = null;

const fetchCsrfToken = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/csrf-token`, { withCredentials: true });
        csrfToken = res.data.csrfToken;
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err.message);
    }
};

const setupAxios = () => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = API_URL;

    // Request interceptor: attach CSRF token to mutation requests
    axios.interceptors.request.use(async (config) => {
        const mutationMethods = ['post', 'put', 'delete', 'patch'];
        if (mutationMethods.includes(config.method)) {
            if (!csrfToken) {
                await fetchCsrfToken();
            }
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
            }
        }
        return config;
    });

    // Response interceptor: retry once on CSRF error (token may have expired)
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (
                error.response?.status === 403 &&
                error.response?.data?.message?.toLowerCase().includes('csrf') &&
                !originalRequest._csrfRetry
            ) {
                originalRequest._csrfRetry = true;
                csrfToken = null;
                await fetchCsrfToken();
                if (csrfToken) {
                    originalRequest.headers['x-csrf-token'] = csrfToken;
                }
                return axios(originalRequest);
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxios;
