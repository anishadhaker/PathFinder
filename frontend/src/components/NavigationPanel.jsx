import React, { useState } from 'react';
import {
  Compass,
  ArrowRightLeft,
  Navigation,
  MapPin,
  Sparkles,
  History,
  AlertCircle,
  Cpu,
  ChevronLeft,
  Route as RouteIcon,
  Car,
  Footprints,
  Bike,
  RotateCcw,
} from 'lucide-react';
import { CITIES } from '../data/graphData';
import PlaceSearchInput from './PlaceSearchInput';
import NearbyPlacesPanel from './NearbyPlacesPanel';

export default function NavigationPanel({
  appMode = 'real_world', // 'real_world' | 'dijkstra_demo'
  activeTab,
  onTabChange,
  // Real-world search props
  startPlace,
  destinationPlace,
  onSelectStartPlace,
  onSelectDestinationPlace,
  onClearStartPlace,
  onClearDestinationPlace,
  travelMode = 'driving',
  onTravelModeChange,
  onUseMyLocation,
  isLocating = false,
  // Dijkstra demo props
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  // Shared actions
  onSwap,
  onCalculateRoute,
  isCalculating,
  errorMessage,
  onClearError,
  activeRoute,
  onResetRoute,
  recentSearches = [],
  onSelectRecentSearch,
  // Nearby places props
  selectedCityForNearby,
  onCityChangeForNearby,
  onUseCurrentLocation,
  isDetectingLocation,
  currentLocationName,
  selectedCategory,
  onCategoryChange,
  nearbyPlaces,
  onNavigateToPlace,
  darkMode,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Floating Toggle button when collapsed on mobile/desktop */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 text-slate-800 shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-white dark:border-slate-800 dark:bg-slate-900/95 dark:text-white"
          title="Open Navigation Panel"
        >
          <Compass className="h-6 w-6 text-sky-500" />
        </button>
      )}

      {/* Main Floating Navigation Panel */}
      <aside
        className={`fixed left-4 top-4 bottom-4 z-30 flex w-[calc(100vw-32px)] sm:w-[410px] flex-col rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 ${
          isCollapsed ? '-translate-x-[450px] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
      >
        {/* TOP BRANDING BAR */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 pb-3.5 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25">
              <Compass className="h-5 w-5 animate-spin-slow" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  PathFinder
                </h1>
                <span className="rounded-full border border-sky-200/60 bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/60 dark:text-sky-300">
                  {appMode === 'real_world' ? 'OpenStreetMap' : 'Dijkstra Demo'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {appMode === 'real_world'
                  ? 'Real-World Navigation & Places'
                  : 'Smart Shortest Path System'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Collapse Panel"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION MODE TABS */}
        <div className="p-3 pb-2">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={() => onTabChange('navigation')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === 'navigation'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Navigation className="h-3.5 w-3.5 text-sky-500" />
              <span>Navigation</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('nearby')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === 'nearby'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span>Nearby Places</span>
            </button>
          </div>
        </div>

        {/* PANEL CONTENT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-4 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {activeTab === 'navigation' ? (
            <div className="space-y-4">
              {/* MODE NOTICE BANNER */}
              {appMode === 'real_world' ? (
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>OpenStreetMap & OSRM Active</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    Search any real address or landmark worldwide. Real road routing is computed with OpenStreetMap data.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-3 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    <span>Dijkstra Algorithm Demonstration</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    Runs Dijkstra's Algorithm on your 10-city weighted road network (Jaipur → Udaipur = 395 km).
                  </p>
                </div>
              )}

              {/* ROUTE INPUT CONTROLS */}
              <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-850/50 space-y-3">
                {/* Visual Connector Line between points */}
                <div className="absolute left-6 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 pointer-events-none" />

                {/* Starting Location */}
                {appMode === 'real_world' ? (
                  <PlaceSearchInput
                    label="Starting Point"
                    placeholder="Search address, landmark, college..."
                    selectedPlace={startPlace}
                    onSelectPlace={onSelectStartPlace}
                    onClear={onClearStartPlace}
                    badgeText="A"
                    badgeColor="bg-emerald-500"
                    showGpsButton={true}
                    onUseGps={onUseMyLocation}
                    isLocating={isLocating}
                  />
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                        A
                      </span>
                      Starting Point
                    </label>
                    <select
                      value={source}
                      onChange={(e) => onSourceChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Starting Location</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Swap Button */}
                <div className="flex justify-end pr-2 pt-1">
                  <button
                    type="button"
                    onClick={onSwap}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:scale-110 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title="Swap Start and Destination"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Destination */}
                {appMode === 'real_world' ? (
                  <PlaceSearchInput
                    label="Destination"
                    placeholder="Search city, hospital, restaurant..."
                    selectedPlace={destinationPlace}
                    onSelectPlace={onSelectDestinationPlace}
                    onClear={onClearDestinationPlace}
                    badgeText="B"
                    badgeColor="bg-violet-500"
                  />
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                        B
                      </span>
                      Destination
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Destination</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Travel Mode Selector (Real-World Mode) */}
              {appMode === 'real_world' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Travel Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onTravelModeChange('driving')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                        travelMode === 'driving'
                          ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Car className="h-3.5 w-3.5" />
                      <span>Driving</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTravelModeChange('walking')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                        travelMode === 'walking'
                          ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Footprints className="h-3.5 w-3.5" />
                      <span>Walking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTravelModeChange('cycling')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                        travelMode === 'cycling'
                          ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Bike className="h-3.5 w-3.5" />
                      <span>Cycling</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert Message */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button
                    onClick={onClearError}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Primary Action Button: "Find Best Route" */}
              <button
                type="button"
                onClick={onCalculateRoute}
                disabled={isCalculating}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 p-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:opacity-95 hover:shadow-sky-500/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isCalculating ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin text-white" />
                    <span>
                      {appMode === 'real_world'
                        ? 'Calculating OSRM Route...'
                        : "Running Dijkstra's Algorithm..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    <span>Find Best Route</span>
                  </>
                )}
              </button>

              {/* Quick Network Popular Routes (In Demo Mode) */}
              {appMode === 'dijkstra_demo' && (
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Sample Dijkstra Benchmarks
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectRecentSearch({ source: 'Jaipur', destination: 'Udaipur' })}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-sky-500/40"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Jaipur → Udaipur
                        </div>
                        <div className="text-[10px] text-slate-400">Ajmer corridor</div>
                      </div>
                      <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                        395 km
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRecentSearch({ source: 'Delhi', destination: 'Agra' })}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-sky-500/40"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Delhi → Agra
                        </div>
                        <div className="text-[10px] text-slate-400">Expressway</div>
                      </div>
                      <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                        230 km
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state hint */}
              {!activeRoute && !isCalculating && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                  <RouteIcon className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Where do you want to go?
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {appMode === 'real_world'
                      ? 'Type any starting location and destination above to discover the real road route.'
                      : 'Select a starting location and destination to see Dijkstra on the graph.'}
                  </p>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Recent Searches
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {recentSearches.slice(0, 4).map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectRecentSearch(item)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left text-xs transition hover:border-slate-200 hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {item.source} → {item.destination}
                        </span>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          {item.distance} km
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Nearby Places Explorer */
            <NearbyPlacesPanel
              selectedCity={selectedCityForNearby}
              onCityChange={onCityChangeForNearby}
              onUseCurrentLocation={onUseCurrentLocation}
              isDetectingLocation={isDetectingLocation}
              currentLocationName={currentLocationName}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              nearbyPlaces={nearbyPlaces}
              onNavigateToPlace={onNavigateToPlace}
              darkMode={darkMode}
            />
          )}
        </div>

        {/* FOOTER BAR OF PANEL */}
        <div className="border-t border-slate-100 p-3 text-center text-[10px] text-slate-400 dark:border-slate-800/80">
          PathFinder • OpenStreetMap & OSRM • C++ Dijkstra Project
        </div>
      </aside>
    </>
  );
}
