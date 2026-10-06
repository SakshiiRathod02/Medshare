import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, HeartHandshake, MapPin, Calendar, Clock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BrowseDonationsView({ onOpenNewDonation }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minSafetyScore, setMinSafetyScore] = useState(0);
  const [storageFilter, setStorageFilter] = useState('');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'APPROVED');
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (minSafetyScore > 0) params.append('min_safety_score', minSafetyScore);
      if (storageFilter) params.append('storage_condition', storageFilter);

      const res = await fetch(`/api/donations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, minSafetyScore, storageFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const categories = [
    'Antibiotic', 'Analgesic', 'Antidiabetic', 'Cardiovascular',
    'Gastrointestinal', 'Antihistamine', 'Respiratory', 'Vitamins', 'Vaccines'
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Waste Healthcare Logistics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Verified Medicine Surplus</h1>
          <p className="text-sm text-teal-100/90 mt-2 leading-relaxed">
            All listed medicines have undergone sealed packaging validation and pharmacist verification. Available for registered NGOs, charitable dispensaries, and low-income clinics.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/10">
              ⚡ Real-Time Expiry Engine
            </span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/10">
              🛡️ Multi-Factor Safety Score
            </span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/10">
              📦 Tamper-Evident QR Tracking
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name, generic name, or batch number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                selectedCategory === ''
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-semibold text-xs">Safety Score ≥</span>
              <select
                value={minSafetyScore}
                onChange={(e) => setMinSafetyScore(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">Any Score</option>
                <option value="70">70+ (Good)</option>
                <option value="85">85+ (High Safety)</option>
                <option value="95">95+ (Elite Quality)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-semibold text-xs">Storage:</span>
              <select
                value={storageFilter}
                onChange={(e) => setStorageFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Storage</option>
                <option value="normal">Room Temp</option>
                <option value="cold-chain">Cold-Chain (2-8°C)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Available Listings ({donations.length})
        </span>
        <button
          onClick={fetchDonations}
          className="text-xs text-teal-600 font-semibold hover:underline flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Donations Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-sm">Fetching verified donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">No surplus found matching your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {donations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Badges & Score */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                    {d.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-semibold text-slate-400">Safety</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {d.safety_score} / 100
                    </span>
                  </div>
                </div>

                {/* Medicine Title */}
                <h3 className="font-bold text-base text-slate-900 leading-snug">{d.medicine_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{d.generic_name}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {d.requires_prescription === 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Rx Only
                    </span>
                  )}
                  {d.storage_condition === 'cold-chain' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Cold-Chain (2-8°C)
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Room Temp
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Sealed Original
                  </span>
                </div>

                {/* Details Table */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Quantity</span>
                    <span className="font-bold text-slate-800">{d.quantity} {d.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expiry Countdown</span>
                    <span className={`font-bold ${d.days_remaining < 60 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {d.expiry_date}
                    </span>
                    <span className="text-[10px] text-teal-600 block">({d.days_remaining}d remaining)</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Donor info & action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">{d.donor_name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{d.donor_org_type}</div>
                </div>

                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  {d.trail_id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
