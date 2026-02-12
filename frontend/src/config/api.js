const API_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || '')
    : 'http://localhost:5000';

// On Render, Socket.IO runs on the same server as the API
export const SOCKET_URL = API_URL || window.location.origin;

export default API_URL;