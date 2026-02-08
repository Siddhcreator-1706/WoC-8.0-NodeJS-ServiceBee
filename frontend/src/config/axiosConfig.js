import axios from 'axios';
import API_URL from './api';

const setupAxios = async () => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = API_URL;

    try {
        const response = await axios.get(`${API_URL}/api/csrf-token`);
        axios.defaults.headers.common['x-csrf-token'] = response.data.csrfToken;
        console.log('CSRF protection initialized');
    } catch (error) {
        console.error('Failed to fetch CSRF token', error);
    }
};

export default setupAxios;
