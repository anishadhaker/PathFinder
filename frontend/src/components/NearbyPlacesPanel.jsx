import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Crosshair,
  Compass,
  Hospital,
  UtensilsCrossed,
  Fuel,
  Hotel,
  GraduationCap,
  ShoppingBag,
  Landmark,
  ParkingSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CITIES } from '../data/graphData';
import { NEARBY_CATEGORIES } from '../data/nearbyPlacesData';

const CategoryIcon = ({ category, className = 'h-4 w-4' }) => {
  switch (category) {
    case 'Hospital':
      return <Hospital className={className} />;
    case 'Restaurant':
      return <UtensilsCrossed className={className} />;
    case 'Petrol Pump':
      return <Fuel className={className} />;
    case 'Hotel':
      return <Hotel className={className} />;
    case 'College':
      return <GraduationCap className={className} />;
    case 'Shopping':
      return <ShoppingBag className={className} />;
    case 'Tourist Place':
      return <Landmark className={className} />;
    case 'Parking':
      return <ParkingSquare className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

export default function NearbyPlacesPanel({
  selectedCity,
  onCityChange,
  onUseCurrentLocation,
  isDetectingLocation,
  currentLocationName,
  selectedCategory,
  onCategoryChange,
  nearbyPlaces = [],
  onNavigateToPlace,
  darkMode = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlaces = nearbyPlaces.filter((place) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      place.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Nearby
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <Sparkles className="h-3 w-3" />
            {filteredPlaces.length} Places Found
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Discover useful places around your selected location.
        </p>
      </div>

      {/* Location Picker & Quick "Use Current Location" */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current / Selected Location
          </label>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isDetectingLocation}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition"
          >
            <Crosshair className={`h-3 w-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            {isDetectingLocation ? 'Locating...' : 'Use Current Location'}
          </button>
        </div>

        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-sky-400"
          >
            <option value="">Select Location</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            ▼
          </div>
        </div>

        {currentLocationName && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active Hub: {currentLocationName}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, facility or address..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Chips Horizontal Filter */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>Categories</span>
          <span className="text-[10px] text-slate-400">Swipe to filter</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {NEARBY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-500 dark:text-white ring-2 ring-sky-400/40'
                    : 'border border-slate-200/80 bg-slate-50/90 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80'
                }`}
              >
                {cat.emoji ? <span>{cat.emoji}</span> : <Sparkles className="h-3 w-3" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearby Places Cards List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 max-h-[380px] sm:max-h-[460px]">
        {filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
            <Compass className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              No places found
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {selectedCity
                ? 'Try selecting a different category or clearing your search.'
                : 'Select a location to discover useful places nearby.'}
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/90 dark:hover:border-sky-500/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-600 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-sky-950/50 dark:group-hover:text-sky-400 transition-colors">
                    <CategoryIcon category={place.category} className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                      {place.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{place.category}</span>
                      <span>•</span>
                      <span className="text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                        {place.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <MapPin className="h-3 w-3" />
                    {place.formattedDistance}
                  </div>
                  {place.rating && (
                    <div className="mt-1 text-[10px] font-semibold text-amber-500">
                      ★ {place.rating}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {place.openStatus || 'Verified Location'}
                </span>

                <button
                  type="button"
                  onClick={() => onNavigateToPlace(place)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 dark:bg-slate-700 dark:hover:bg-sky-500"
                >
                  <Navigation className="h-3 w-3" />
                  Navigate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
