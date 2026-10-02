import React, { useEffect } from 'react';
import {
  X,
  MapPinOff,
  ShieldAlert,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Lock,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onRetry,
  isBlocked = false,
  darkMode = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <MapPinOff className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="permission-modal-title"
                className="text-base font-extrabold text-slate-900 dark:text-white"
              >
                {isBlocked ? 'Location Access Is Blocked' : 'Allow Location Access'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browser Permission Setup & Troubleshooting Guide
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Status Banner */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <strong className="font-bold">
                  {isBlocked
                    ? 'Your browser has blocked location access for this site.'
                    : 'Location permission was denied or not granted.'}
                </strong>
                <p className="mt-1 text-amber-800 dark:text-amber-300">
                  PathFinder requires location access solely to display your current position on the
                  map and compute accurate real-world road routes. We never track you in the
                  background without your explicit action.
                </p>
              </div>
            </div>
          </div>

          {/* Browser Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              How to allow location in Google Chrome & Edge:
            </h3>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  1
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Look beside the URL address bar
                  </span>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    At the top of your browser window, click the <strong>Site settings / Tune icon</strong> (
                    <SlidersHorizontal className="inline h-3.5 w-3.5 text-sky-600 mx-0.5" /> or{' '}
                    <Lock className="inline h-3.5 w-3.5 text-slate-600 mx-0.5" />) located directly
                    to the left of <code>localhost:5173</code>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  2
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Toggle Location to &quot;Allow&quot;
                  </span>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Find the <strong>Location</strong> permission entry. Switch it from{' '}
                    <em className="text-rose-600 dark:text-rose-400 font-semibold">Block</em> or{' '}
                    <em className="text-slate-500 font-semibold">Ask</em> to{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Allow</strong>{' '}
                    (or click <strong>&quot;Reset permission&quot;</strong>).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-black text-white">
                  3
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Refresh the page &amp; Click &quot;Use ocation&quot;
                  </span>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Click the <strong>Refresh Page</strong> button below (or press{' '}
                    <kbd className="rounded bg-slate-200 px-1 py-0.5 text-[10px] font-mono dark:bg-slate-700">
                      Ctrl+R
                    </kbd>
                    ) to activate your updated permission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Note for Other Browsers */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-850/60 dark:text-slate-400">
            <strong>Using Firefox, Safari, or Mobile?</strong>
            <p className="mt-0.5">
              Click the permissions or shield icon beside the URL, clear any blocked location
              setting, and ensure your system location / GPS is switched ON in Windows or macOS
              settings.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3.5 py-2 text-xs font-bold text-sky-700 shadow-sm hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-750 transition"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Refresh Page
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRetry) onRetry();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:bg-sky-500 transition"
            >
              <Compass className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
