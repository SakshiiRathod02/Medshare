import React, { useState } from 'react';
import { HeartHandshake, ShieldCheck, PlusCircle, CheckCircle, ChevronDown, User, Award, ListFilter, Eye } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenNewDonation, queueCount = 0 }) {
  const { user, switchAccount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = user?.role || 'guest';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('browse')}
              className="flex items-center space-x-3 text-left focus:outline-none"
            >
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight text-slate-900 flex items-center">
                  Med<span className="text-teal-600">Share</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Medicine Rescue Platform
                </div>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Browse Surplus
              </button>

              {(role === 'donor' || role === 'admin') && (
                <button
                  onClick={() => setActiveTab('my-donations')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'my-donations'
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Donations
                </button>
              )}

              {(role === 'verifier' || role === 'admin') && (
                <button
                  onClick={() => setActiveTab('verifier-queue')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'verifier-queue'
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Verification Queue</span>
                  {queueCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                      {queueCount}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* New Donation CTA for Donors */}
            {(role === 'donor' || role === 'admin') && (
              <button
                onClick={onOpenNewDonation}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 shadow-sm transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Donate Medicine</span>
              </button>
            )}

            {/* Role Switcher & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs uppercase border border-slate-200">
                  {user?.role?.slice(0, 2) || 'GU'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                    {user?.name || 'Guest User'}
                  </div>
                  <div className="text-[10px] text-teal-700 capitalize font-medium">
                    {user?.role} {user?.org_type ? `(${user.org_type})` : ''}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Active Session</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                    {user?.reputation && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        <span>Badge: {user.reputation.badge} ({user.reputation.points} pts)</span>
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                      Switch Role for Testing
                    </div>
                    <div className="space-y-1">
                      {DEMO_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.email}
                          onClick={() => {
                            switchAccount(acc.email);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user?.email === acc.email
                              ? 'bg-teal-50 font-bold text-teal-900'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{acc.label}</span>
                          {user?.email === acc.email && <CheckCircle className="w-3.5 h-3.5 text-teal-600 ml-1.5 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
