import React, { useState, useEffect, useMemo } from 'react';
import NetworkMap from './components/NetworkMap';
import GoogleMapView from './components/GoogleMapView';
import NavigationPanel from './components/NavigationPanel';
import RouteResultCard from './components/RouteResultCard';
import RouteDetailsDrawer from './components/RouteDetailsDrawer';
import AlgorithmProgress from './components/AlgorithmProgress';
import MapControls from './components/MapControls';
import NetworkStatus from './components/NetworkStatus';
import { calculateShortestPath } from './services/shortestPathService';
import {
  getNearbyPlaces,
  requestUserLocation,
  getMockCurrentLocation,
} from './services/nearbyPlacesService';
import { isGoogleMapsKeyConfigured } from './services/googleMapsLoader';
import { CITIES } from './data/graphData';

export default function App() {
  // App Mode: 'google_maps' (Real-World) | 'dijkstra_demo' (Academic Demonstration)
  const [appMode, setAppMode] = useState('google_maps');

  // Navigation Mode Tab: 'navigation' | 'nearby'
  const [activeTab, setActiveTab] = useState('navigation');

  // Route Planning State
  const [source, setSource] = useState('Jaipur');
  const [destination, setDestination] = useState('Udaipur');
  const [activeRoute, setActiveRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    { source: 'Jaipur', destination: 'Udaipur', distance: 395 },
    { source: 'Delhi', destination: 'Agra', distance: 230 },
    { source: 'Delhi', destination: 'Jaipur', distance: 280 },
    { source: 'Kota', destination: 'Udaipur', distance: 290 },
  ]);

  // Nearby Places State
  const [selectedCityForNearby, setSelectedCityForNearby] = useState('Jaipur');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentLocationName, setCurrentLocationName] = useState('Jaipur (Simulated GPS)');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Modals & Panels State
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(false);
  const [showAlgorithmPanel, setShowAlgorithmPanel] = useState(false);

  // Map View State (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Theme State (Dark / Light)
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Route Calculation via Dijkstra's Algorithm
  const handleCalculateRoute = async (customSource = source, customDest = destination) => {
    const src = customSource || source;
    const dst = customDest || destination;

    if (!src || !dst) {
      setErrorMessage('Please select both a starting location and destination.');
      return;
    }

    if (src === dst) {
      setErrorMessage('Starting location and destination cannot be identical.');
      return;
    }

    setIsCalculating(true);
    setErrorMessage('');
    setShowAlgorithmPanel(true); // Auto-display calculation progress

    try {
      const result = await calculateShortestPath({ source: src, destination: dst });
      setActiveRoute(result);

      // Add to recent searches if not duplicate of first
      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => !(item.source === src && item.destination === dst)
        );
        return [{ source: src, destination: dst, distance: result.distance }, ...filtered].slice(
          0,
          6
        );
      });
    } catch (err) {
      setActiveRoute(null);
      setErrorMessage(err.message || 'Route calculation failed.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Swap Source and Destination
  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
    setErrorMessage('');
    if (activeRoute) {
      handleCalculateRoute(destination, source);
    }
  };

  // Reset Active Route
  const handleResetRoute = () => {
    setActiveRoute(null);
    setErrorMessage('');
  };

  // Select Quick Search
  const handleSelectRecentSearch = ({ source: src, destination: dst }) => {
    setSource(src);
    setDestination(dst);
    setErrorMessage('');
    handleCalculateRoute(src, dst);
  };

  // Nearby Places List (reactive to selected city and category)
  const nearbyPlaces = useMemo(() => {
    return getNearbyPlaces({
      city: selectedCityForNearby,
      category: selectedCategory,
    });
  }, [selectedCityForNearby, selectedCategory]);

  // Handle "Use Current Location" in Nearby Places
  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await requestUserLocation();
      setSelectedCityForNearby(loc.city);
      setCurrentLocationName(loc.name);
    } catch (err) {
      const fallback = getMockCurrentLocation();
      setSelectedCityForNearby(fallback.city);
      setCurrentLocationName(fallback.name);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Handle "Navigate" button click on a nearby place card or map pin
  const handleNavigateToPlace = (place) => {
    // 1. Set source as currently selected city / current location
    const origin = selectedCityForNearby || source || 'Jaipur';
    // 2. Set destination as the place's connected graph city node
    const target = place.graphNode || selectedCityForNearby;

    if (origin === target) {
      // If user is already in that city and wants navigation, find nearest city hub or set route
      setSource(origin);
      // Pick another connected hub to showcase navigation route to city
      const alternative = origin === 'Jaipur' ? 'Delhi' : 'Jaipur';
      setSource(alternative);
      setDestination(origin);
      setActiveTab('navigation');
      handleCalculateRoute(alternative, origin);
    } else {
      setSource(origin);
      setDestination(target);
      setActiveTab('navigation');
      handleCalculateRoute(origin, target);
    }
  };

  // Map City Node Click Handler
  const handleSelectCityFromMap = (cityName) => {
    if (activeTab === 'nearby') {
      setSelectedCityForNearby(cityName);
      setCurrentLocationName(`${cityName} (Selected Node)`);
      return;
    }

    // In navigation mode:
    if (!source || (source && destination)) {
      setSource(cityName);
      setDestination('');
      setActiveRoute(null);
      setErrorMessage('');
    } else if (source && !destination) {
      if (source === cityName) {
        setErrorMessage('Destination cannot be identical to starting location.');
        return;
      }
      setDestination(cityName);
      setErrorMessage('');
      handleCalculateRoute(source, cityName);
    }
  };

  // Map Controls: Zoom & Pan Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
  const handleCenter = () => setPan({ x: 0, y: 0 });
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Switch to Nearby Places from Route Result Card
  const handleExploreNearbyFromRoute = () => {
    const targetCity = destination || source || 'Jaipur';
    setSelectedCityForNearby(targetCity);
    setCurrentLocationName(`${targetCity} (Destination City)`);
    setActiveTab('nearby');
  };

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-[#0b1120]' : 'bg-[#f4f7fb]'}`}>
      {/* 1. FULL-SCREEN MAP CANVAS: Google Maps or Dijkstra Network Map */}
      {appMode === 'google_maps' ? (
        <GoogleMapView
          onSwitchToDijkstraDemo={() => setAppMode('dijkstra_demo')}
          darkMode={darkMode}
        />
      ) : (
        <NetworkMap
          source={source}
          destination={destination}
          activeRoute={activeRoute}
          activeTab={activeTab}
          selectedCityForNearby={selectedCityForNearby}
          nearbyPlaces={nearbyPlaces}
          selectedCategory={selectedCategory}
          onSelectCity={handleSelectCityFromMap}
          onNavigateToPlace={handleNavigateToPlace}
          darkMode={darkMode}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          onResetView={handleResetView}
        />
      )}

      {/* 2. TOP DUAL-MODE SWITCHER & STATUS BADGE */}
      <div className="fixed top-4 left-4 sm:left-[435px] z-20 hidden md:flex items-center gap-3">
        <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <button
            type="button"
            onClick={() => setAppMode('google_maps')}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              appMode === 'google_maps'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-500 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>🌐 Real-World Navigation</span>
          </button>
          <button
            type="button"
            onClick={() => setAppMode('dijkstra_demo')}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              appMode === 'dijkstra_demo'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-500 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>📐 Dijkstra Demonstration</span>
          </button>
        </div>

        {appMode === 'dijkstra_demo' && <NetworkStatus darkMode={darkMode} />}
      </div>

      {/* 3. LEFT FLOATING NAVIGATION & NEARBY PANEL */}
      <NavigationPanel
        appMode={appMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        source={source}
        destination={destination}
        onSourceChange={(val) => {
          setSource(val);
          setErrorMessage('');
        }}
        onDestinationChange={(val) => {
          setDestination(val);
          setErrorMessage('');
        }}
        onSwap={handleSwap}
        onCalculateRoute={() => handleCalculateRoute()}
        isCalculating={isCalculating}
        errorMessage={errorMessage}
        onClearError={() => setErrorMessage('')}
        activeRoute={activeRoute}
        onResetRoute={handleResetRoute}
        recentSearches={recentSearches}
        onSelectRecentSearch={handleSelectRecentSearch}
        // Nearby places
        selectedCityForNearby={selectedCityForNearby}
        onCityChangeForNearby={setSelectedCityForNearby}
        onUseCurrentLocation={handleUseCurrentLocation}
        isDetectingLocation={isDetectingLocation}
        currentLocationName={currentLocationName}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        nearbyPlaces={nearbyPlaces}
        onNavigateToPlace={handleNavigateToPlace}
        darkMode={darkMode}
      />

      {/* 4. FLOATING BOTTOM ROUTE RESULT CARD */}
      <RouteResultCard
        routeResult={activeRoute}
        onOpenDetails={() => setIsRouteDetailsOpen(true)}
        onExploreNearby={handleExploreNearbyFromRoute}
        onResetRoute={handleResetRoute}
        darkMode={darkMode}
      />

      {/* 5. RIGHT-SIDE FLOATING MAP CONTROLS */}
      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onResetView={handleResetView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        showAlgorithmPanel={showAlgorithmPanel}
        onToggleAlgorithmPanel={() => setShowAlgorithmPanel(!showAlgorithmPanel)}
      />

      {/* 6. LIVE ALGORITHM VISUALIZATION PANEL (VIVA / CALCULATION PROGRESS) */}
      <AlgorithmProgress
        isCalculating={isCalculating}
        executionLog={activeRoute?.executionLog || []}
        isOpen={showAlgorithmPanel}
        onClose={() => setShowAlgorithmPanel(false)}
        darkMode={darkMode}
      />

      {/* 7. TURN-BY-TURN ROUTE DETAILS DRAWER / MODAL */}
      <RouteDetailsDrawer
        isOpen={isRouteDetailsOpen}
        onClose={() => setIsRouteDetailsOpen(false)}
        routeResult={activeRoute}
        darkMode={darkMode}
      />
    </div>
  );
}
