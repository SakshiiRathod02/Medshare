import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BrowseDonationsView from './components/BrowseDonationsView';
import MyDonationsView from './components/MyDonationsView';
import VerifierQueueView from './components/VerifierQueueView';
import DonationFormModal from './components/DonationFormModal';
import { ShieldCheck } from 'lucide-react';

function MainApp() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch queue count for verifier badge
  useEffect(() => {
    if (!token || (user?.role !== 'verifier' && user?.role !== 'admin')) return;

    async function checkQueue() {
      try {
        const res = await fetch('/api/verifications/queue', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQueueCount(data.count || 0);
        }
      } catch (e) {
        console.error('Queue poll error:', e);
      }
    }
    checkQueue();
  }, [token, user, refreshKey]);

  // Adjust active tab when switching roles
  useEffect(() => {
    if (user?.role === 'verifier' && activeTab === 'my-donations') {
      setActiveTab('verifier-queue');
    } else if (user?.role === 'donor' && activeTab === 'verifier-queue') {
      setActiveTab('my-donations');
    }
  }, [user?.role]);

  const handleDonationCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('my-donations');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Universal Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewDonation={() => setIsModalOpen(true)}
        queueCount={queueCount}
      />

      {/* Safety Notice Strip */}
      <div className="bg-teal-900 text-teal-100 text-xs py-2 px-4 border-b border-teal-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              <strong>Platform Notice:</strong> MedShare coordinates verified medicine donations. Prescription and cold-chain items require institutional credentials and pharmacist sign-off.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-teal-300">
            Phase 2: Donation & Verification Flow Active
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'browse' && (
          <BrowseDonationsView
            key={`browse-${refreshKey}`}
            onOpenNewDonation={() => setIsModalOpen(true)}
          />
        )}

        {activeTab === 'my-donations' && (
          <MyDonationsView
            key={`my-${refreshKey}`}
            onOpenNewDonation={() => setIsModalOpen(true)}
          />
        )}

        {activeTab === 'verifier-queue' && (
          <VerifierQueueView
            key={`queue-${refreshKey}`}
            onQueueCountChange={(count) => setQueueCount(count)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 MedShare – Medicine Donation & Expiry Management. Built with React, Tailwind CSS, Express & SQLite/PostgreSQL.</p>
        </div>
      </footer>

      {/* New Donation Modal */}
      <DonationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDonationCreated={handleDonationCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
