import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import './i18n.js'
import App from './App.jsx'

// API base URL configuration:
// In browser development, relative paths (/api) use Vite's dev proxy to localhost:5000.
// In native Android/Capacitor, requests use VITE_API_BASE_URL (or the host machine Wi-Fi IP).
const configuredBase = import.meta.env.VITE_API_BASE_URL || '';
const storedBase = typeof localStorage !== 'undefined' ? localStorage.getItem('medshare_api_base') : null;
const defaultPhoneIp = 'http://192.168.1.2:5000';
const apiBase = storedBase || configuredBase || (Capacitor.isNativePlatform() ? defaultPhoneIp : '');

if (apiBase || Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        const activeBase = (typeof localStorage !== 'undefined' && localStorage.getItem('medshare_api_base')) || apiBase || defaultPhoneIp;
        input = `${activeBase}${input}`;
      }
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
