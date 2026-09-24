import React, { useEffect, useRef, useState } from 'react';
import {
  Key,
  ExternalLink,
  ShieldAlert,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Layers,
} from 'lucide-react';
import {
  isGoogleMapsKeyConfigured,
  loadGoogleMapsApi,
} from '../services/googleMapsLoader';

// Dark mode map styling for Google Maps
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

export default function GoogleMapView({
  onMapReady,
  onSwitchToDijkstraDemo,
  darkMode = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loadState, setLoadState] = useState('checking'); // 'checking' | 'missing_key' | 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isGoogleMapsKeyConfigured()) {
      setLoadState('missing_key');
      return;
    }

    setLoadState('loading');
    let isMounted = true;

    // Catch Google Maps authentication or billing failures
    window.gm_authFailure = () => {
      if (!isMounted) return;
      setLoadState('error');
      setErrorMessage(
        'Google Maps Authentication Error: The API key provided in .env.local was rejected by Google. Please verify that the key is valid and has Maps JavaScript API enabled in Google Cloud Console.'
      );
    };

    loadGoogleMapsApi()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Initialize Google Map instance
        const initialCenter = { lat: 26.9124, lng: 75.7873 }; // Jaipur / Regional hub
        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 7,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: true,
          fullscreenControl: false,
          styles: darkMode ? DARK_MAP_STYLE : [],
        });

        mapInstanceRef.current = map;
        setLoadState('ready');

        if (onMapReady) {
          onMapReady(map, google);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadState('error');
        setErrorMessage(
          err.message || 'Failed to load Google Maps JavaScript API.'
        );
      });

    return () => {
      isMounted = false;
      delete window.gm_authFailure;
    };
  }, []);

  // Update map styles when dark mode toggles
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.setOptions({
        styles: darkMode ? DARK_MAP_STYLE : [],
      });
    }
  }, [darkMode]);

  // If Key is Missing: Show friendly instructions setup card
  if (loadState === 'missing_key') {
    return (
      <div className="relative flex h-full w-full items-center justify-center p-6 bg-slate-900 text-white">
        <div className="relative z-10 max-w-xl rounded-3xl border border-slate-700/80 bg-slate-800/95 p-7 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-700/70 pb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <Key className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Google Maps API Key Required
                </h3>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  Step 1 Setup
                </span>
              </div>
              <p className="text-xs text-slate-400">
                To enable live real-world addresses, autocomplete, and road routes
              </p>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="mt-5 space-y-3.5 text-xs text-slate-300">
            <p className="leading-relaxed">
              Google Maps Platform requires an API key to display real street maps and calculate driving directions. Follow these 4 simple steps:
            </p>

            <ol className="space-y-2.5 pl-4 list-decimal marker:text-sky-400 marker:font-bold">
              <li className="pl-1">
                Open{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a>{' '}
                and create or select a project.
              </li>
              <li className="pl-1">
                Enable these APIs in <strong>APIs & Services</strong>:
                <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[10.5px]">
                  <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-sky-300">
                    Maps JavaScript API
                  </span>
                  <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-emerald-300">
                    Places API
                  </span>
                  <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-violet-300">
                    Routes API
                  </span>
                </div>
              </li>
              <li className="pl-1">
                Generate an API key under <strong>Credentials</strong>.
              </li>
              <li className="pl-1">
                Inside your project folder, create a file named{' '}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-amber-300">
                  frontend/.env.local
                </code>{' '}
                and add:
                <pre className="mt-1.5 rounded-xl border border-slate-700 bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 select-all">
                  VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
                </pre>
              </li>
            </ol>
          </div>

          {/* Fallback button to Dijkstra Demo */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-700/70 pt-5">
            <button
              type="button"
              onClick={onSwitchToDijkstraDemo}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-indigo-700"
            >
              <Compass className="h-4 w-4" />
              Use Interactive Dijkstra Demo Mode
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-600 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Loading:
  if (loadState === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <div className="text-sm font-semibold text-slate-300">
            Connecting to Google Maps Platform...
          </div>
        </div>
      </div>
    );
  }

  // If Load Error:
  if (loadState === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 bg-slate-900 text-white">
        <div className="max-w-md rounded-3xl border border-rose-800 bg-rose-950/40 p-6 text-center shadow-2xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <h3 className="mt-3 text-base font-bold text-white">
            Google Maps Load Error
          </h3>
          <p className="mt-2 text-xs text-rose-300 leading-relaxed">
            {errorMessage}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2">
            <button
              type="button"
              onClick={onSwitchToDijkstraDemo}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Switch to Dijkstra Mode
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Map Canvas
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Status Indicator on Map */}
      <div className="pointer-events-none absolute top-4 right-4 z-20 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
          Google Maps Live
        </span>
      </div>
    </div>
  );
}
