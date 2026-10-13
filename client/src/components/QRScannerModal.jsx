import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, CheckCircle2, AlertTriangle, Sparkles, Image, RefreshCw, Upload, Check } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function QRScannerModal({ isOpen, onClose, onHandoverComplete }) {
  const { token, user } = useAuth();
  const [manualTrailId, setManualTrailId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingHandovers, setPendingHandovers] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Clean up states on modal close
  useEffect(() => {
    if (!isOpen) {
      setManualTrailId('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  // Load active accepted requests for the user for 1-click handover
  useEffect(() => {
    if (!isOpen || !token) return;

    async function loadPendingHandovers() {
      try {
        const res = await fetch('/api/requests/outgoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const accepted = (data.requests || []).filter(r => r.status === 'ACCEPTED');
          setPendingHandovers(accepted);
        }
      } catch (err) {
        console.error('Failed to load pending handovers:', err);
      }
    }
    loadPendingHandovers();
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Scan QR code from photo/image using Html5Qrcode.scanFile
  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      // Ensure reader container exists
      let html5QrCode;
      try {
        html5QrCode = new Html5Qrcode('qr-reader-hidden');
      } catch (initErr) {
        html5QrCode = new Html5Qrcode('qr-reader-hidden');
      }

      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        handleProcessPayload(decodedText);
      } else {
        setError('No QR code detected in the photo. Please try a clearer, well-lit picture.');
      }
    } catch (err) {
      console.error('File scan failed:', err);
      setError('Could not decode QR code from the photo. Make sure the QR code is centered and readable, or select from your active batches below.');
    } finally {
      setLoading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleProcessPayload = async (rawPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    let trailId = rawPayload.trim();
    try {
      const parsed = JSON.parse(rawPayload);
      if (parsed.trail_id) trailId = parsed.trail_id;
    } catch (e) {
      // Plain trail ID string
    }

    try {
      const res = await fetch('/api/handovers/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trail_id: trailId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify handover QR code');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccess({
        message: data.message,
        trail_id: data.trail_id,
        points: data.points_earned
      });

      if (onHandoverComplete) {
        onHandoverComplete(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTrailId.trim()) return;
    handleProcessPayload(manualTrailId.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      {/* Hidden element for Html5Qrcode file scan */}
      <div id="qr-reader-hidden" className="hidden" />

      {/* Hidden Native Camera & Gallery file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileScan}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileScan}
        className="hidden"
      />

      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Scan Handover QR Code
              </h3>
              <p className="text-[11px] text-slate-400">
                Confirm physical receipt of donated medicine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3.5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-900 dark:text-emerald-100 text-lg">
                Handover Confirmed!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                Batch Trail <strong className="font-mono">{success.trail_id}</strong> is completed and permanently sealed in the audit trail.
              </p>
            </div>
            {success.points && (
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/40 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Donor awarded +{success.points} points!</span>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Phone Scanner Card: Snap Photo / Upload */}
            <div className="rounded-3xl border-2 border-dashed border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/20 p-6 text-center space-y-3.5">
              <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Point Camera at Donor's QR Code
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap below to open your phone's camera and snap the QR code:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>📸 Take Photo of QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-slate-50 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Choose Image</span>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center space-x-2 text-xs text-teal-600 font-semibold pt-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decoding QR code...</span>
                </div>
              )}
            </div>

            {/* 1-Click Handover Confirmation (If User has Accepted Batches) */}
            {pendingHandovers.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    ⚡ Your Batches Ready for Handover ({pendingHandovers.length}):
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">1-Click Confirm</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {pendingHandovers.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 shadow-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300 mr-1.5">
                          {h.trail_id}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {h.medicine_name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Donor: {h.donor_name} • Qty: {h.quantity}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setManualTrailId(h.trail_id);
                          handleProcessPayload(h.trail_id);
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] whitespace-nowrap shadow-sm active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual ID Input Fallback */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Or Type Batch Trail ID Manually:
              </span>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualTrailId}
                  onChange={(e) => setManualTrailId(e.target.value.toUpperCase())}
                  placeholder="e.g. MED-TR-016"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={loading || !manualTrailId.trim()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center space-x-1 active:scale-95 transition-all"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
