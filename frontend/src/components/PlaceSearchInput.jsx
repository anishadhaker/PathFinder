import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Crosshair, X, Loader2 } from 'lucide-react';
import { searchPlaces } from '../services/nominatimService';

export default function PlaceSearchInput({
  label,
  placeholder,
  selectedPlace,
  onSelectPlace,
  onClear,
  badgeText = 'A',
  badgeColor = 'bg-emerald-500',
  showGpsButton = false,
  onUseGps,
  isLocating = false,
}) {
  const [query, setQuery] = useState(selectedPlace ? selectedPlace.name : '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync internal text when selectedPlace changes from outside (e.g. GPS or Swap)
  useEffect(() => {
    if (selectedPlace) {
      setQuery(selectedPlace.name || selectedPlace.displayName || '');
    } else {
      setQuery('');
    }
  }, [selectedPlace]);

  // Debounced search on query changes
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // If query matches current selection, don't trigger search
    if (selectedPlace && query === (selectedPlace.name || selectedPlace.displayName)) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedPlace]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    onClear();
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${badgeColor}`}
          >
            {badgeText}
          </span>
          {label}
        </label>

        {showGpsButton && (
          <button
            type="button"
            onClick={onUseGps}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition"
          >
            <Crosshair className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Use My GPS'}
          </button>
        )}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-800 scrollbar-thin scrollbar-thumb-slate-300">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition hover:bg-sky-50 dark:hover:bg-slate-700/80"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </div>
                <div className="text-[10.5px] text-slate-400 dark:text-slate-400 line-clamp-1">
                  {item.subtitle || item.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
