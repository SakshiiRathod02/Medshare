import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { role: 'admin', email: 'admin@medshare.org', label: 'Admin (MedShare HQ)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { role: 'verifier', email: 'verifier1@medshare.org', label: 'Verifier (Dr. Aditi Sharma)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { role: 'donor', email: 'donor.pharma@example.com', label: 'Donor (Apex Care Pharmacy)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { role: 'donor', email: 'donor.hosp@example.com', label: 'Donor (Lifeline Hospital)', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { role: 'donor', email: 'donor.indiv@example.com', label: 'Donor (Rahul Verma - Individual)', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { role: 'recipient', email: 'recipient.sewa@example.com', label: 'Recipient (Sewa Foundation NGO)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { role: 'recipient', email: 'recipient.clinic@example.com', label: 'Recipient (Asha Clinic)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('medshare_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on mount or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Default login as pharmacy donor on first visit for rich experience
        await switchAccount('donor.pharma@example.com');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('medshare_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  // Quick switch demo account
  const switchAccount = async (email) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('medshare_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medshare_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, switchAccount, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
