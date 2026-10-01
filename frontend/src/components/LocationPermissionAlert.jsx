import React from 'react';
import {
  MapPinOff,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  X,
  RotateCw,
} from 'lucide-react';

export default function LocationPermissionAlert({
  error,
  onOpenHelp,
  onRetry,
  onDismiss,
  darkMode = false,
}) {
  if (!error) return null;

  const isDenied = error.type === 'PERMISSION_DENIED' || error.code === 1 || error.isPermissionDenied;
  const isBlocked = error.isBlocked;
  const isUnavailable = error.type === 'POSITION_UNAVAILABLE' || error.code === 2;
  const isTimeout = error.type === 'TIMEOUT' || error.code === 3;

  // Determine headlines and guidance text strictly aligned with specifications
  let headline = 'Location Notice';
  let explanation = error.friendlyMessage || error.message || 'Unable to access your location.';
  let actionLabel = 'Click here to allow location access';

  if (isBlocked) {
    headline = 'Location access is blocked.';
    explanation = 'Please allow Location permission for this site in your browser settings, then refresh the page.';
    actionLabel = 'Click here to allow location access in your browser settings, then refresh the page.';
  } else if (isDenied) {
    headline = 'Location permission denied.';
    explanation = 'Please allow Location permission for this site in your browser settings, then try again.';
    actionLabel = 'Click here to allow location access';
  } else if (isUnavailable) {
    headline = 'Location Unavailable';
    explanation = 'Unable to determine your location. Please check your device location/GPS.';
    actionLabel = 'Click here to retry';
  } else if (isTimeout) {
    headline = 'Request Timed Out';
    explanation = 'Location request timed out. Please try again.';
    actionLabel = 'Click here to retry';
  }

  const handleActionClick = (e) => {
    e.preventDefault();
    if (isBlocked || isDenied) {
      if (onOpenHelp) onOpenHelp();
    } else {
      if (onRetry) onRetry();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActionClick(e);
    }
  };

  return (
    <div
      className={`relative mt-2.5 overflow-hidden rounded-2xl border p-3.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
        isDenied || isBlocked
          ? 'border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/70 text-amber-950 dark:border-amber-800/60 dark:from-amber-950/40 dark:to-orange-950/20 dark:text-amber-200'
          : 'border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">
          {isDenied || isBlocked ? (
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-5">
          <div className="text-xs font-extrabold tracking-tight">
            {headline}
          </div>

          <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
            {explanation}
          </p>

          {/* Clickable Help Action Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleActionClick}
              onKeyDown={handleKeyDown}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isDenied || isBlocked
                  ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400'
                  : 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus:ring-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400'
              }`}
            >
              <span>{actionLabel}</span>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss location alert"
            className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
