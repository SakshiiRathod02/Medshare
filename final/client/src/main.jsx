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
const apiBase = configuredBase || (Capacitor.isNativePlatform() ? 'http://192.168.1.8:5000' : '');

if (apiBase) {
  const originalFetch = window.fetch;
  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        input = `${apiBase}${input}`;
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
