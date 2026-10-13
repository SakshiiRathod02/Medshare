import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  PlusCircle,
  CheckCircle,
  ChevronDown,
  User,
  Award,
  Bell,
  Sun,
  Moon,
  Globe,
  QrCode,
  Package,
  Pill,
  Trash2,
  AlertCircle,
  Trophy,
  Users,
  LogOut,
  LogIn,
  Shield,
  FileCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewDonation,
  onOpenScanner,
  onOpenAuth,
  queueCount = 0
}) {
  const { user, token, switchAccount, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // Dropdown states
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('medshare_dark') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('medshare_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('medshare_dark', 'false');
    }
  }, [darkMode]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('medshare_lng', lang);
    setLangDropdownOpen(false);
  };

  const handleEditServerIp = () => {
    const current = localStorage.getItem('medshare_api_base') || 'http://192.168.1.2:5000';
    const newIp = window.prompt('Enter Backend Server URL (e.g. http://192.168.1.2:5000):', current);
    if (newIp && newIp.trim()) {
      localStorage.setItem('medshare_api_base', newIp.trim().replace(/\/+$/, ''));
      window.location.reload();
    }
  };

  const role = user?.role || 'guest';

  // Role-specific partitioned navigation tabs
  const getNavTabsForRole = () => {
    switch (role) {
      case 'verifier':
        return [
          { id: 'verifier-queue', label: 'Verification Queue', icon: ShieldCheck, badge: queueCount },
          { id: 'browse', label: 'Browse Approvals', icon: Pill },
          { id: 'public-trail', label: 'Batch Audit Trail', icon: FileCheck },
          { id: 'disposal', label: 'Safe Disposal', icon: Trash2 }
        ];
      case 'donor':
        return [
          { id: 'my-donations', label: 'My Donations', icon: Package },
          { id: 'donor-requests', label: 'Requests', icon: HeartHandshake },
          { id: 'urgent-needs', label: 'Urgent Needs', icon: AlertCircle },
          { id: 'cabinet', label: 'My Cabinet', icon: Pill },
          { id: 'impact', label: 'Impact', icon: Trophy }
        ];
      case 'recipient':
        return [
          { id: 'browse', label: 'Browse Surplus', icon: Pill },
          { id: 'recipient-requests', label: 'My Requests', icon: HeartHandshake },
          { id: 'urgent-needs', label: 'Post Urgent Need', icon: AlertCircle },
          { id: 'impact', label: 'Impact', icon: Trophy }
        ];
      case 'admin':
        return [
          { id: 'admin-portal', label: 'Admin Portal', icon: Shield, isSpecial: true },
          { id: 'verifier-queue', label: 'Verification Queue', icon: ShieldCheck, badge: queueCount },
          { id: 'browse', label: 'All Surplus', icon: Pill },
          { id: 'my-donations', label: 'All Donations', icon: Package },
          { id: 'donor-requests', label: 'Donor Requests', icon: HeartHandshake },
          { id: 'recipient-requests', label: 'Clinic Requests', icon: HeartHandshake },
          { id: 'urgent-needs', label: 'Urgent Needs', icon: AlertCircle },
          { id: 'disposal', label: 'Safe Disposal', icon: Trash2 },
          { id: 'cabinet', label: 'Cabinet Stock', icon: Pill },
          { id: 'impact', label: 'Impact & Reports', icon: Trophy },
          { id: 'public-trail', label: 'Batch Audit Trail', icon: FileCheck }
        ];
      case 'guest':
      default:
        return [
          { id: 'landing', label: 'Home', icon: HeartHandshake },
          { id: 'browse', label: 'Browse Surplus', icon: Pill },
          { id: 'impact', label: 'Public Impact', icon: Trophy },
          { id: 'public-trail', label: 'Batch Audit Trail', icon: FileCheck }
        ];
    }
  };

  const currentNavTabs = getNavTabsForRole();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <button
              onClick={() => {
                const defaults = {
                  verifier: 'verifier-queue',
                  donor: 'my-donations',
                  recipient: 'browse',
                  admin: 'admin-portal',
                  guest: 'landing'
                };
                setActiveTab(defaults[role] || 'landing');
              }}
              className="flex items-center space-x-2.5 text-left focus:outline-none flex-shrink-0"
            >
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center">
                  Med<span className="text-teal-600 dark:text-teal-400">Share</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Medicine Rescue
                </div>
              </div>
            </button>

            {/* Role-Specific Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 min-w-0 overflow-x-auto scrollbar-none py-1">
              {currentNavTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                      isActive
                        ? tab.isSpecial
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-300 dark:ring-purple-700 font-bold'
                          : 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 shadow-sm ring-1 ring-teal-200 dark:ring-teal-800 font-bold'
                        : tab.isSpecial
                          ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls - flex-shrink-0 to ALWAYS stay visible */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
            {/* Quick Action for Donor & Admin: Donate Medicine */}
            {(role === 'donor' || role === 'admin') && (
              <button
                onClick={onOpenNewDonation}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex-shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('donateMedicine') || 'Donate Medicine'}</span>
              </button>
            )}

            {/* Quick Action for Recipient: Scan Handover QR */}
            {role === 'recipient' && (
              <button
                onClick={onOpenScanner}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex-shrink-0"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Handover QR</span>
              </button>
            )}

            {/* Quick Action for Verifier: Review Queue */}
            {role === 'verifier' && queueCount > 0 && (
              <button
                onClick={() => setActiveTab('verifier-queue')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review Queue ({queueCount})</span>
              </button>
            )}

            {/* Quick Action for Guest: Sign In */}
            {!token && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* QR Scanner Icon button (Visible for Recipient & Admin who scan handovers) */}
            {(role === 'recipient' || role === 'admin') && (
              <button
                onClick={onOpenScanner}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
                title="Scan Handover QR"
              >
                <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`p-3 ${n.read ? 'opacity-70' : 'bg-teal-50/40 dark:bg-teal-950/20'}`}>
                          <p className="text-slate-800 dark:text-slate-200">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Change Language"
              >
                <Globe className="w-4 h-4" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    हिन्दी (Hindi)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('mr')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Server IP Config Quick Button - hidden on laptop/mobile (accessible in profile dropdown) */}
            <button
              onClick={handleEditServerIp}
              className="hidden 2xl:flex px-2 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-semibold items-center space-x-1 flex-shrink-0"
              title="Configure Backend Server IP"
            >
              <span>🌐</span>
              <span className="font-mono text-[10px] max-w-[110px] truncate">
                {(localStorage.getItem('medshare_api_base') || '192.168.1.2:5000').replace(/^https?:\/\//, '')}
              </span>
            </button>

            {/* Profile & Demo Switcher Dropdown - ALWAYS VISIBLE */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl border border-teal-500/30 dark:border-teal-500/40 bg-teal-50/70 dark:bg-slate-800 hover:bg-teal-100/70 dark:hover:bg-slate-700 transition-colors text-left flex-shrink-0 shadow-xs"
                title="Click to Switch Demo Persona / View Profile"
              >
                <div className="h-7 w-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-xs flex-shrink-0">
                  {user?.role?.slice(0, 2) || 'GU'}
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[90px] xl:max-w-[130px]">
                    {user?.name || 'Guest'}
                  </div>
                  <div className="text-[10px] text-teal-700 dark:text-teal-300 capitalize font-bold flex items-center space-x-0.5 leading-none">
                    <span>{user?.role || 'Sign In'}</span>
                    <span className="text-[9px]">▾</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-0.5" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Profile</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{user?.name || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                    {user?.reputation && (
                      <div className="mt-2 flex items-center space-x-1.5 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded font-semibold">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        <span>Badge: {user.reputation.badge} ({user.reputation.points} pts)</span>
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                      Switch Demo Persona
                    </div>
                    <div className="space-y-1">
                      {DEMO_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.email}
                          onClick={() => {
                            switchAccount(acc.email);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user?.email === acc.email
                              ? 'bg-teal-50 dark:bg-teal-950 font-bold text-teal-900 dark:text-teal-200'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{acc.label}</span>
                          {user?.email === acc.email && <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
                      <span>Server IP (For Phone)</span>
                      <button
                        type="button"
                        onClick={handleEditServerIp}
                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        Edit IP
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 truncate">
                      {localStorage.getItem('medshare_api_base') || 'http://192.168.1.2:5000'}
                    </div>
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {!token ? (
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full text-center py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs"
                      >
                        Sign In / Register
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-center py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Strip (visible only on mobile/small screens < lg) */}
      <div className="lg:hidden flex items-center space-x-1.5 overflow-x-auto max-w-full px-3 py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none bg-slate-50/80 dark:bg-slate-900/80 touch-pan-x">
        {currentNavTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 flex-shrink-0 ${
                isActive
                  ? tab.isSpecial
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 shadow-xs font-bold'
                    : 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 shadow-xs font-bold'
                  : tab.isSpecial
                    ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
