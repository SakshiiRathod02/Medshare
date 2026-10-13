import React, { useState } from 'react';
import {
  Package,
  HeartHandshake,
  ShieldCheck,
  Shield,
  User,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCw,
  QrCode,
  FileCheck
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

const ROLE_METADATA = {
  donor: {
    title: 'Donor Portal',
    badge: 'Institutional & Individual Donor',
    theme: 'emerald',
    icon: Package,
    bgGradient: 'from-emerald-900/90 via-teal-900/90 to-slate-900',
    borderColor: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    mission: 'Prevent medicine waste by listing surplus stock before expiry. Track pharmacist verification, approve requests from charitable clinics, and issue handover QR codes.',
    workflowSteps: [
      { step: '1', title: 'List Stock', desc: 'Add surplus with batch #, expiry & photo' },
      { step: '2', title: 'Pharmacist Review', desc: 'Chief pharmacist verifies safety & seal' },
      { step: '3', title: 'Clinic Requests', desc: 'Review & approve incoming requests' },
      { step: '4', title: 'Handover QR', desc: 'Issue secure QR code for recipient pickup' }
    ],
    primaryActions: ['List Medicine', 'Incoming Requests', 'My Cabinet', 'Clinic Shortages', 'Impact Score']
  },
  recipient: {
    title: 'Recipient Portal',
    badge: 'Verified Charitable Clinic / NGO',
    theme: 'blue',
    icon: HeartHandshake,
    bgGradient: 'from-blue-900/90 via-indigo-900/90 to-slate-900',
    borderColor: 'border-blue-500/30',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    mission: 'Procure verified surplus medicines for patients and charitable clinics. Search approved stock, submit allocation requests, post urgent deficits, and scan QR on handover.',
    workflowSteps: [
      { step: '1', title: 'Browse Surplus', desc: 'Find approved medicines by safety score & distance' },
      { step: '2', title: 'Request Allocation', desc: 'Submit request stating patient count & urgency' },
      { step: '3', title: 'Donor Approves', desc: 'Donor confirms match and prepares batch' },
      { step: '4', title: 'Scan Handover QR', desc: 'Scan QR at pickup to confirm transfer' }
    ],
    primaryActions: ['Browse Surplus Catalog', 'Request Allocations', 'Post Urgent Needs', 'Scan Handover QR']
  },
  verifier: {
    title: 'Pharmacist Verifier Queue',
    badge: 'Licensed Pharmacist Reviewer',
    theme: 'amber',
    icon: ShieldCheck,
    bgGradient: 'from-amber-950/90 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/30',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    mission: 'Statutory pharmaceutical safety review under CDSCO protocols. Inspect batch photos, packaging seals, cold-chain conditions, and shelf-life thresholds before public listing.',
    workflowSteps: [
      { step: '1', title: 'Inspect Queue', desc: 'Review newly listed medicines' },
      { step: '2', title: 'Safety Verification', desc: 'Validate seal, batch #, shelf life (≥90d)' },
      { step: '3', title: 'Approve or Reject', desc: 'Approved items enter surplus matching' },
      { step: '4', title: 'Disposal Queue', desc: 'Flag rejected / expired items for safe disposal' }
    ],
    primaryActions: ['Verification Queue', 'Approve/Reject Batches', 'Safe Disposal Queue', 'Batch Audit Trail']
  },
  admin: {
    title: 'Central Command Center',
    badge: 'Platform Administrator / HQ',
    theme: 'purple',
    icon: Shield,
    bgGradient: 'from-purple-950/90 via-slate-900 to-slate-950',
    borderColor: 'border-purple-500/30',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    mission: 'Full platform governance. Verify partner organizations, configure matching engine parameters (min shelf life, max radius), audit biomedical waste disposal, and monitor metrics.',
    workflowSteps: [
      { step: '1', title: 'User Approvals', desc: 'Verify recipient clinics and donor licenses' },
      { step: '2', title: 'Rule Config', desc: 'Adjust shelf life & safety thresholds' },
      { step: '3', title: 'Audit Oversight', desc: 'Inspect immutable logs and chain of custody' },
      { step: '4', title: 'Disposal Compliance', desc: 'Ensure bio-medical waste regulations' }
    ],
    primaryActions: ['Admin Portal', 'User Verification', 'All Surplus & Donations', 'All Queues & Dashboards', 'Platform Settings']
  },
  guest: {
    title: 'MedShare Public Explorer',
    badge: 'Guest Viewer',
    theme: 'slate',
    icon: User,
    bgGradient: 'from-slate-800 via-slate-900 to-slate-950',
    borderColor: 'border-slate-700',
    accentText: 'text-teal-400',
    badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
    mission: 'You are viewing MedShare in guest mode. Select a persona below to experience role-specific workflows (Donor, Recipient Clinic, Pharmacist Verifier, or Admin).',
    workflowSteps: [
      { step: '1', title: 'Choose Role', desc: 'Select a demo persona below to unlock actions' },
      { step: '2', title: 'Explore Features', desc: 'Each role has a dedicated workspace and permissions' },
      { step: '3', title: 'Live Testing', desc: 'Simulate end-to-end medicine donation & verification' }
    ],
    primaryActions: ['Sign In', 'Browse Public Surplus', 'Explore Impact Metrics']
  }
};

export default function RoleBanner({ onTabSelect }) {
  const { user, token, switchAccount } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [switching, setSwitching] = useState(false);

  const role = user?.role || 'guest';
  const meta = ROLE_METADATA[role] || ROLE_METADATA.guest;
  const IconComponent = meta.icon;

  const handleQuickSwitch = async (email, defaultTab) => {
    setSwitching(true);
    await switchAccount(email);
    setSwitching(false);
    if (defaultTab && onTabSelect) {
      onTabSelect(defaultTab);
    }
  };

  return (
    <div className={`mb-6 rounded-3xl bg-gradient-to-r ${meta.bgGradient} border ${meta.borderColor} text-white shadow-xl overflow-hidden transition-all duration-300`}>
      {/* Top Bar: Role Identity & Quick Switcher */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
            <IconComponent className={`w-6 h-6 ${meta.accentText}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                {meta.title}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${meta.badgeBg}`}>
                {meta.badge}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center space-x-2">
              <span className="font-semibold text-white">{user?.name || 'Public Guest'}</span>
              <span>•</span>
              <span className="text-slate-400 truncate max-w-[200px]">{user?.email || 'Not logged in'}</span>
              {user?.org_type && (
                <>
                  <span>•</span>
                  <span className="text-teal-300 capitalize">{user.org_type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="w-full lg:w-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:hidden">
            Switch Persona:
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full">
            <button
              onClick={() => handleQuickSwitch('donor.pharma@example.com', 'my-donations')}
              disabled={switching}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === 'donor' && user?.email === 'donor.pharma@example.com'
                  ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400/50'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>🏥</span>
              <span>Donor</span>
            </button>

            <button
              onClick={() => handleQuickSwitch('recipient.clinic@example.com', 'browse')}
              disabled={switching}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === 'recipient'
                  ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-400/50'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>🤝</span>
              <span>Recipient</span>
            </button>

            <button
              onClick={() => handleQuickSwitch('verifier1@medshare.org', 'verifier-queue')}
              disabled={switching}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === 'verifier'
                  ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/50'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>🩺</span>
              <span>Verifier</span>
            </button>

            <button
              onClick={() => handleQuickSwitch('admin@medshare.org', 'admin-portal')}
              disabled={switching}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === 'admin'
                  ? 'bg-purple-500 text-white shadow-md ring-2 ring-purple-400/50'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Workflow & Actions Guide */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-black/25 backdrop-blur-sm space-y-4 text-xs">
          {/* Mission Statement */}
          <div className="flex items-start space-x-2 text-slate-200">
            <Sparkles className={`w-4 h-4 ${meta.accentText} flex-shrink-0 mt-0.5`} />
            <p className="leading-relaxed">
              <strong>Your Role:</strong> {meta.mission}
            </p>
          </div>

          {/* Workflow Steps Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {meta.workflowSteps.map((s, idx) => (
              <div
                key={s.step}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-2"
              >
                <div className="h-5 w-5 rounded-full bg-white/15 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="font-bold text-white text-[11px] leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Allowed Features Tag Strip */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Features enabled for your role:</span>
            {meta.primaryActions.map((action) => (
              <span
                key={action}
                className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10 text-[10px] font-medium"
              >
                ✓ {action}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
