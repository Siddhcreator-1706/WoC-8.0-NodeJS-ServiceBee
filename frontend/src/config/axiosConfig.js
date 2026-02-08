import axios from 'axios';
import API_URL from './api';

const setupAxios = () => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = API_URL;

    // NOTE:
    // This function is currently called at module load time in main.jsx.
    // Making an async call there can cause React startup to race with CSRF initialization.
    // To preserve existing behaviour safely, we keep configuration synchronous here
    // and leave any CSRF-token fetching to explicit call sites or interceptors if added later.
};

export default setupAxios;
