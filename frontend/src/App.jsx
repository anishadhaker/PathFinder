import React, { useState, useEffect, useMemo } from 'react';
import LeafletMapView from './components/LeafletMapView';
import NetworkMap from './components/NetworkMap';
import NavigationPanel from './components/NavigationPanel';
import RouteResultCard from './components/RouteResultCard';
import RouteDetailsDrawer from './components/RouteDetailsDrawer';
import AlgorithmProgress from './components/AlgorithmProgress';
import MapControls from './components/MapControls';
import NetworkStatus from './components/NetworkStatus';

// Services
import { calculateShortestPath } from './services/shortestPathService';
import { calculateOsrmRoute } from './services/osrmRoutingService';
import { fetchNearbyPlacesOsm } from './services/overpassPlacesService';
import { getCurrentPosition } from './services/geolocationService';
import { reverseGeocode } from './services/nominatimService';
import { CITIES } from './data/graphData';

export default function App() {
  // Mode: 'real_world' (OpenStreetMap & OSRM) | 'dijkstra_demo' (Academic Dijkstra)
  const [appMode, setAppMode] = useState('real_world');

  // Navigation Mode Tab: 'navigation' | 'nearby'
  const [activeTab, setActiveTab] = useState('navigation');

  // Real-World Navigation State (OSRM & Nominatim)
  const [startPlace, setStartPlace] = useState({
    name: 'Jaipur, Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
  });
  const [destinationPlace, setDestinationPlace] = useState({
    name: 'Udaipur, Rajasthan',
    lat: 24.5854,
    lng: 73.7125,
  });
  const [travelMode, setTravelMode] = useState('driving');
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [realRouteResult, setRealRouteResult] = useState(null);

  // Dijkstra Demo State (10 Cities Graph)
  const [source, setSource] = useState('Jaipur');
  const [destination, setDestination] = useState('Udaipur');
  const [dijkstraRoute, setDijkstraRoute] = useState(null);

  // Shared Calculation & Error State
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    { source: 'Jaipur', destination: 'Udaipur', distance: 395 },
    { source: 'Delhi', destination: 'Agra', distance: 230 },
  ]);

  // Nearby Places State
  const [selectedCityForNearby, setSelectedCityForNearby] = useState('Jaipur');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentLocationName, setCurrentLocationName] = useState('Jaipur (OpenStreetMap)');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);

  // Modals & Panels
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(false);
  const [showAlgorithmPanel, setShowAlgorithmPanel] = useState(false);

  // Theme & Map View State
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch Nearby Places when category or center changes
  useEffect(() => {
    let isCancelled = false;
    const centerLat = userGpsCoords?.lat || startPlace?.lat || 26.9124;
    const centerLng = userGpsCoords?.lng || startPlace?.lng || 75.7873;

    setIsFetchingNearby(true);
    fetchNearbyPlacesOsm({
      lat: centerLat,
      lng: centerLng,
      category: selectedCategory,
    })
      .then((places) => {
        if (!isCancelled) {
          setNearbyPlaces(places);
        }
      })
      .catch(() => {
        if (!isCancelled) setNearbyPlaces([]);
      })
      .finally(() => {
        if (!isCancelled) setIsFetchingNearby(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, startPlace, userGpsCoords]);

  // Handle Route Calculation for either Real-World OSRM or Dijkstra Demo
  const handleCalculateRoute = async () => {
    setErrorMessage('');
    setIsCalculating(true);

    if (appMode === 'real_world') {
      // Real-World Mode: OSRM Routing
      if (!startPlace || !destinationPlace) {
        setErrorMessage('Please enter and select both a starting location and destination.');
        setIsCalculating(false);
        return;
      }

      try {
        const result = await calculateOsrmRoute({
          startLat: startPlace.lat,
          startLng: startPlace.lng,
          endLat: destinationPlace.lat,
          endLng: destinationPlace.lng,
          mode: travelMode,
        });

        setRouteCoordinates(result.coordinates);
        setRealRouteResult({
          source: startPlace.name,
          destination: destinationPlace.name,
          path: [startPlace.name, destinationPlace.name],
          distance: result.distanceKm,
          stopsCount: 2,
          travelTime: result.formattedDuration,
          segments: result.steps.map((st) => ({
            from: st.instruction,
            to: '',
            distance: st.distance,
            routeName: st.instruction,
          })),
          algorithm: 'Open Source Routing Machine (OSRM)',
          steps: result.steps,
        });

        // Add to recent searches
        setRecentSearches((prev) => [
          {
            source: startPlace.name,
            destination: destinationPlace.name,
            distance: result.distanceKm,
          },
          ...prev.slice(0, 5),
        ]);
      } catch (err) {
        setRouteCoordinates([]);
        setRealRouteResult(null);
        setErrorMessage(err.message || 'Routing failed. Please try a different location.');
      } finally {
        setIsCalculating(false);
      }
    } else {
      // Dijkstra Demo Mode
      if (!source || !destination) {
        setErrorMessage('Please select both a starting city and destination.');
        setIsCalculating(false);
        return;
      }
      if (source === destination) {
        setErrorMessage('Starting city and destination cannot be identical.');
        setIsCalculating(false);
        return;
      }

      setShowAlgorithmPanel(true);
      try {
        const result = await calculateShortestPath({ source, destination });
        setDijkstraRoute(result);
        setRecentSearches((prev) => [
          { source, destination, distance: result.distance },
          ...prev.slice(0, 5),
        ]);
      } catch (err) {
        setDijkstraRoute(null);
        setErrorMessage(err.message || 'Dijkstra route calculation failed.');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  // Swap locations
  const handleSwap = () => {
    if (appMode === 'real_world') {
      const temp = startPlace;
      setStartPlace(destinationPlace);
      setDestinationPlace(temp);
      setRouteCoordinates([]);
      setRealRouteResult(null);
    } else {
      setSource(destination);
      setDestination(source);
      setDijkstraRoute(null);
    }
    setErrorMessage('');
  };

  // Use Browser Geolocation (GPS)
  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setErrorMessage('');
    try {
      const pos = await getCurrentPosition();
      setUserGpsCoords(pos);

      // Reverse geocode to get street name
      const geo = await reverseGeocode(pos.lat, pos.lng);
      setStartPlace({
        name: geo.name || 'My Current GPS Location',
        displayName: geo.displayName,
        lat: pos.lat,
        lng: pos.lng,
      });
      setCurrentLocationName(geo.name || 'Live GPS Location');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLocating(false);
    }
  };

  // Navigate to a Nearby Place
  const handleNavigateToNearbyPlace = (place) => {
    if (appMode === 'real_world') {
      setDestinationPlace({
        name: place.name,
        lat: place.lat,
        lng: place.lng,
      });
      setActiveTab('navigation');
      // If we already have a starting place, trigger route
      if (startPlace) {
        calculateOsrmRoute({
          startLat: startPlace.lat,
          startLng: startPlace.lng,
          endLat: place.lat,
          endLng: place.lng,
          mode: travelMode,
        })
          .then((res) => {
            setRouteCoordinates(res.coordinates);
            setRealRouteResult({
              source: startPlace.name,
              destination: place.name,
              path: [startPlace.name, place.name],
              distance: res.distanceKm,
              stopsCount: 2,
              travelTime: res.formattedDuration,
              segments: res.steps.map((st) => ({
                from: st.instruction,
                to: '',
                distance: st.distance,
                routeName: st.instruction,
              })),
              algorithm: 'Open Source Routing Machine (OSRM)',
              steps: res.steps,
            });
          })
          .catch((err) => setErrorMessage(err.message));
      }
    } else {
      // In Dijkstra demo mode: map to parent node
      const target = place.graphNode || 'Jaipur';
      setDestination(target);
      setActiveTab('navigation');
      calculateShortestPath({ source, destination: target }).then((res) => setDijkstraRoute(res));
    }
  };

  // Reset active route
  const handleResetRoute = () => {
    if (appMode === 'real_world') {
      setRouteCoordinates([]);
      setRealRouteResult(null);
    } else {
      setDijkstraRoute(null);
    }
    setErrorMessage('');
  };

  // Active route result based on mode
  const currentActiveRoute = appMode === 'real_world' ? realRouteResult : dijkstraRoute;

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-[#0b1120]' : 'bg-[#f4f7fb]'}`}>
      {/* 1. FULL-SCREEN MAP CANVAS: Leaflet (Real-World) or NetworkMap (Dijkstra) */}
      {appMode === 'real_world' ? (
        <LeafletMapView
          startCoords={startPlace}
          destinationCoords={destinationPlace}
          routeCoordinates={routeCoordinates}
          userGpsCoords={userGpsCoords}
          nearbyPlaces={nearbyPlaces}
          onNavigateToNearbyPlace={handleNavigateToNearbyPlace}
          darkMode={darkMode}
          mapCenter={
            startPlace ? [startPlace.lat, startPlace.lng] : [26.9124, 75.7873]
          }
          zoom={12}
        />
      ) : (
        <NetworkMap
          source={source}
          destination={destination}
          activeRoute={dijkstraRoute}
          activeTab={activeTab}
          selectedCityForNearby={selectedCityForNearby}
          nearbyPlaces={nearbyPlaces}
          selectedCategory={selectedCategory}
          onSelectCity={(cityName) => {
            if (!source || (source && destination)) {
              setSource(cityName);
              setDestination('');
            } else {
              setDestination(cityName);
            }
          }}
          onNavigateToPlace={handleNavigateToNearbyPlace}
          darkMode={darkMode}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          onResetView={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        />
      )}

      {/* 2. TOP DUAL-MODE SWITCHER & STATUS BADGE */}
      <div className="fixed top-4 left-4 sm:left-[435px] z-20 hidden md:flex items-center gap-3">
        <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <button
            type="button"
            onClick={() => setAppMode('real_world')}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              appMode === 'real_world'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-500 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>🌐 Real-World Navigation (OSM & OSRM)</span>
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
            <span>📐 Dijkstra Demonstration (10 Cities)</span>
          </button>
        </div>

        {appMode === 'dijkstra_demo' && <NetworkStatus darkMode={darkMode} />}
      </div>

      {/* 3. LEFT FLOATING NAVIGATION & NEARBY PANEL */}
      <NavigationPanel
        appMode={appMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // Real-world props
        startPlace={startPlace}
        destinationPlace={destinationPlace}
        onSelectStartPlace={setStartPlace}
        onSelectDestinationPlace={setDestinationPlace}
        onClearStartPlace={() => setStartPlace(null)}
        onClearDestinationPlace={() => setDestinationPlace(null)}
        travelMode={travelMode}
        onTravelModeChange={setTravelMode}
        onUseMyLocation={handleUseMyLocation}
        isLocating={isLocating}
        // Dijkstra demo props
        source={source}
        destination={destination}
        onSourceChange={setSource}
        onDestinationChange={setDestination}
        // Shared actions
        onSwap={handleSwap}
        onCalculateRoute={handleCalculateRoute}
        isCalculating={isCalculating}
        errorMessage={errorMessage}
        onClearError={() => setErrorMessage('')}
        activeRoute={currentActiveRoute}
        onResetRoute={handleResetRoute}
        recentSearches={recentSearches}
        onSelectRecentSearch={(item) => {
          if (appMode === 'real_world') {
            setStartPlace({ name: item.source, lat: 26.9124, lng: 75.7873 });
            setDestinationPlace({ name: item.destination, lat: 24.5854, lng: 73.7125 });
          } else {
            setSource(item.source);
            setDestination(item.destination);
          }
        }}
        // Nearby places
        selectedCityForNearby={selectedCityForNearby}
        onCityChangeForNearby={setSelectedCityForNearby}
        onUseCurrentLocation={handleUseMyLocation}
        isDetectingLocation={isLocating || isFetchingNearby}
        currentLocationName={currentLocationName}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        nearbyPlaces={nearbyPlaces}
        onNavigateToPlace={handleNavigateToNearbyPlace}
        darkMode={darkMode}
      />

      {/* 4. FLOATING BOTTOM ROUTE RESULT CARD */}
      <RouteResultCard
        routeResult={currentActiveRoute}
        onOpenDetails={() => setIsRouteDetailsOpen(true)}
        onExploreNearby={() => setActiveTab('nearby')}
        onResetRoute={handleResetRoute}
        darkMode={darkMode}
      />

      {/* 5. RIGHT-SIDE FLOATING MAP CONTROLS */}
      <MapControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 1, 18))}
        onZoomOut={() => setZoom((z) => Math.max(z - 1, 4))}
        onCenter={() => {
          if (startPlace) {
            setUserGpsCoords({ lat: startPlace.lat, lng: startPlace.lng });
          }
        }}
        onResetView={() => {
          setRouteCoordinates([]);
          setRealRouteResult(null);
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        showAlgorithmPanel={showAlgorithmPanel}
        onToggleAlgorithmPanel={() => setShowAlgorithmPanel(!showAlgorithmPanel)}
      />

      {/* 6. LIVE ALGORITHM VISUALIZATION PANEL (VIVA / CALCULATION PROGRESS) */}
      <AlgorithmProgress
        isCalculating={isCalculating}
        executionLog={dijkstraRoute?.executionLog || []}
        isOpen={showAlgorithmPanel && appMode === 'dijkstra_demo'}
        onClose={() => setShowAlgorithmPanel(false)}
        darkMode={darkMode}
      />

      {/* 7. TURN-BY-TURN ROUTE DETAILS DRAWER / MODAL */}
      <RouteDetailsDrawer
        isOpen={isRouteDetailsOpen}
        onClose={() => setIsRouteDetailsOpen(false)}
        routeResult={currentActiveRoute}
        darkMode={darkMode}
      />
    </div>
  );
}
