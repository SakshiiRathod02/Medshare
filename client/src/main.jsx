import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import './i18n.js'
import App from './App.jsx'

// Robust API Base Routing for Mobile APK & Web
const defaultPhoneIp = 'http://192.168.1.3:5000';

const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let targetUrl = input;
  const isViteDev = window.location.port === '5173';
  const storedBase = typeof localStorage !== 'undefined' ? localStorage.getItem('medshare_api_base') : null;
  const activeBase = (storedBase || (!isViteDev ? defaultPhoneIp : '')).replace(/\/+$/, '');

  if (typeof input === 'string') {
    if (input.startsWith('/api') || input.startsWith('/uploads')) {
      if (activeBase) {
        targetUrl = `${activeBase}${input}`;
      }
    }
  } else if (input instanceof Request) {
    const url = new URL(input.url);
    if ((url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) && activeBase) {
      targetUrl = new Request(`${activeBase}${url.pathname}${url.search}`, input);
    }
  }

  try {
    return await originalFetch(targetUrl, init);
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medshare:network-error', {
        detail: { url: typeof targetUrl === 'string' ? targetUrl : targetUrl.url, error: err.message }
      }));
    }
    throw err;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
