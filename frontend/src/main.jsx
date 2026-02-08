import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import setupAxios from './config/axiosConfig';

// Initialize global axios configuration (baseURL, withCredentials, etc.)
setupAxios();

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  // Defensive: avoid runtime crash if root element is missing
  // eslint-disable-next-line no-console
  console.error('Failed to find the root element to mount React app.');
}
