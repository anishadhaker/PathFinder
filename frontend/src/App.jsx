import React, { useState, useEffect, useRef } from 'react';
import LeafletMapView from './components/LeafletMapView';
import NetworkMap from './components/NetworkMap';
import NavigationPanel from './components/NavigationPanel';
import RouteResultCard from './components/RouteResultCard';
import RouteDetailsDrawer from './components/RouteDetailsDrawer';
import MapControls from './components/MapControls';
import NetworkStatus from './components/NetworkStatus';
import LocationPermissionModal from './components/LocationPermissionModal';
import { Route as RouteIcon, Globe2, Compass } from 'lucide-react';

// Services
import {
  calculateShortestPath,
  generateDijkstraSteps,
} from './services/shortestPathService';
import { calculateOsrmRoute } from './services/osrmRoutingService';
import { fetchNearbyPlacesOsm } from './services/overpassPlacesService';
import {
  getCurrentPosition,
  startLiveLocationWatch,
  stopLiveLocationWatch,
  calculateDistanceMeters,
  checkLocationPermissionStatus,
  subscribeToPermissionChanges,
} from './services/geolocationService';
import { reverseGeocode } from './services/nominatimService';
import { CITIES } from './data/graphData';

export default function App() {
  // App Mode: Real-World Leaflet OpenStreetMap vs Academic Dijkstra Mode
  const [appMode, setAppMode] = useState('real_world');

  // Navigation Mode Tab for Real-World: 'navigation' | 'nearby'
  const [activeTab, setActiveTab] = useState('navigation');

  // ==========================================
  // 1. DIJKSTRA ALGORITHM STATE & PLAYBACK
  // ==========================================
  const [source, setSource] = useState('Jaipur');
  const [destination, setDestination] = useState('Udaipur');
  const [dijkstraRoute, setDijkstraRoute] = useState(null);
  const [dijkstraSteps, setDijkstraSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isDijkstraPlaying, setIsDijkstraPlaying] = useState(false);
  const [isDijkstraPaused, setIsDijkstraPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(600); // 1200ms, 600ms, 200ms
  const playbackTimerRef = useRef(null);

  // Initialize Jaipur -> Udaipur on mount so graph & distance table are instantly populated
  useEffect(() => {
    try {
      const { steps, finalResult } = generateDijkstraSteps('Jaipur', 'Udaipur');
      setDijkstraSteps(steps);
      setDijkstraRoute(finalResult);
      setCurrentStepIndex(steps.length - 1);
    } catch (e) {
      console.warn('Initial Dijkstra load failed:', e);
    }
  }, []);

  // Timer loop for step-by-step animation
  useEffect(() => {
    if (isDijkstraPlaying && !isDijkstraPaused) {
      if (currentStepIndex >= 0 && currentStepIndex < dijkstraSteps.length - 1) {
        playbackTimerRef.current = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, animationSpeed);
      } else if (currentStepIndex >= dijkstraSteps.length - 1) {
        setIsDijkstraPlaying(false);
        setIsDijkstraPaused(false);
      }
    }
    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isDijkstraPlaying, isDijkstraPaused, currentStepIndex, dijkstraSteps, animationSpeed]);

  const handleRunDijkstra = () => {
    setErrorMessage('');
    if (!source || !destination) {
      setErrorMessage('Please select both a source and destination location.');
      return;
    }
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    try {
      const { steps, finalResult } = generateDijkstraSteps(source, destination);
      setDijkstraSteps(steps);
      setDijkstraRoute(finalResult);
      setCurrentStepIndex(0);
      setIsDijkstraPlaying(true);
      setIsDijkstraPaused(false);
    } catch (err) {
      setErrorMessage(err.message || 'Dijkstra execution failed.');
    }
  };

  const handlePauseDijkstra = () => {
    setIsDijkstraPlaying(false);
    setIsDijkstraPaused(true);
  };

  const handleResumeDijkstra = () => {
    setIsDijkstraPlaying(true);
    setIsDijkstraPaused(false);
  };

  const handleResetDijkstra = () => {
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setIsDijkstraPlaying(false);
    setIsDijkstraPaused(false);
    setDijkstraSteps([]);
    setCurrentStepIndex(-1);
    setDijkstraRoute(null);
    setErrorMessage('');
  };

  const handleRunInstantly = () => {
    setErrorMessage('');
    if (!source || !destination) {
      setErrorMessage('Please select both a source and destination location.');
      return;
    }
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    try {
      const { steps, finalResult } = generateDijkstraSteps(source, destination);
      setDijkstraSteps(steps);
      setDijkstraRoute(finalResult);
      setCurrentStepIndex(steps.length - 1);
      setIsDijkstraPlaying(false);
      setIsDijkstraPaused(false);
    } catch (err) {
      setErrorMessage(err.message || 'Dijkstra execution failed.');
    }
  };

  const handleSourceChange = (city) => {
    setSource(city);
    if (city && destination) {
      try {
        const { steps, finalResult } = generateDijkstraSteps(city, destination);
        setDijkstraSteps(steps);
        setDijkstraRoute(finalResult);
        setCurrentStepIndex(steps.length - 1);
      } catch (e) {
        setDijkstraRoute(null);
      }
    } else {
      setDijkstraRoute(null);
    }
  };

  const handleDestinationChange = (city) => {
    setDestination(city);
    if (source && city) {
      try {
        const { steps, finalResult } = generateDijkstraSteps(source, city);
        setDijkstraSteps(steps);
        setDijkstraRoute(finalResult);
        setCurrentStepIndex(steps.length - 1);
      } catch (e) {
        setDijkstraRoute(null);
      }
    } else {
      setDijkstraRoute(null);
    }
  };

  const handleSwap = () => {
    if (appMode === 'real_world') {
      const temp = startPlace;
      const newStart = destinationPlace;
      const newDest = temp;

      const newStartIsCurrentLocation = Boolean(newStart?.isCurrentLocation);
      setIsSourceCurrentLocation(newStartIsCurrentLocation);
      isSourceCurrentLocationRef.current = newStartIsCurrentLocation;
      lastRoutedGpsRef.current = null;

      setStartPlace(newStart);
      setDestinationPlace(newDest);
      destinationPlaceRef.current = newDest;

      if (newStart?.lat && newStart?.lng && newDest?.lat && newDest?.lng) {
        calculateAndSetRoute(newStart, newDest, travelModeRef.current);
      } else {
        setRouteCoordinates([]);
        setRealRouteResult(null);
      }
    } else {
      const tempSource = source;
      const tempDest = destination;
      setSource(tempDest);
      setDestination(tempSource);
      if (tempDest && tempSource) {
        try {
          const { steps, finalResult } = generateDijkstraSteps(tempDest, tempSource);
          setDijkstraSteps(steps);
          setDijkstraRoute(finalResult);
          setCurrentStepIndex(steps.length - 1);
        } catch (e) {
          setDijkstraRoute(null);
        }
      }
    }
  };

  const handleSelectGraphNode = (cityName) => {
    if (!source || (source && destination)) {
      setSource(cityName);
      setDestination('');
      setDijkstraRoute(null);
      setDijkstraSteps([]);
      setCurrentStepIndex(-1);
    } else {
      setDestination(cityName);
      try {
        const { steps, finalResult } = generateDijkstraSteps(source, cityName);
        setDijkstraSteps(steps);
        setDijkstraRoute(finalResult);
        setCurrentStepIndex(steps.length - 1);
      } catch (e) {
        console.warn('Failed to calculate path:', e);
      }
    }
  };

  // ==========================================
  // 2. REAL-WORLD NAVIGATION & LIVE GPS STATE
  // ==========================================
  const [startPlace, setStartPlace] = useState({
    name: 'My Current Location',
    lat: null,
    lng: null,
    isCurrentLocation: true,
  });
  const [isSourceCurrentLocation, setIsSourceCurrentLocation] = useState(true);
  const isSourceCurrentLocationRef = useRef(true);

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
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // References to preserve latest values in continuous watch callbacks without stale closures
  const lastRoutedGpsRef = useRef(null);
  const isReroutingRef = useRef(false);
  const destinationPlaceRef = useRef(destinationPlace);
  const travelModeRef = useRef(travelMode);
  const realRouteResultRef = useRef(realRouteResult);

  useEffect(() => {
    destinationPlaceRef.current = destinationPlace;
  }, [destinationPlace]);

  useEffect(() => {
    travelModeRef.current = travelMode;
  }, [travelMode]);

  useEffect(() => {
    realRouteResultRef.current = realRouteResult;
  }, [realRouteResult]);

  // Unified helper to calculate and apply OSRM route
  const calculateAndSetRoute = async (src, dest, mode = travelModeRef.current) => {
    if (!src?.lat || !src?.lng || !dest?.lat || !dest?.lng) {
      return null;
    }
    setIsCalculating(true);
    setErrorMessage('');
    try {
      const result = await calculateOsrmRoute({
        startLat: src.lat,
        startLng: src.lng,
        endLat: dest.lat,
        endLng: dest.lng,
        mode,
      });

      setRouteCoordinates(result.coordinates);
      const newRoute = {
        source: src.name || 'My Current Location',
        destination: dest.name,
        path: [src.name || 'My Current Location', dest.name],
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
      };
      setRealRouteResult(newRoute);

      if (src.name && dest.name) {
        setRecentSearches((prev) => [
          {
            source: src.name,
            destination: dest.name,
            distance: result.distanceKm,
            startLat: src.lat,
            startLng: src.lng,
            destLat: dest.lat,
            destLng: dest.lng,
          },
          ...prev.filter((item) => !(item.source === src.name && item.destination === dest.name)).slice(0, 4),
        ]);
      }
      return newRoute;
    } catch (err) {
      setRouteCoordinates([]);
      setRealRouteResult(null);
      setErrorMessage(err.message || 'Routing failed. Please try a different location.');
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  // Requirement 1: On application open, request browser location and set current location as default source
  useEffect(() => {
    handleUseMyLocation();
  }, []);

  // Clean up active geolocation watch on component unmount
  useEffect(() => {
    return () => {
      stopLiveLocationWatch();
    };
  }, []);

  // Subscribe to browser permission state changes
  useEffect(() => {
    const unsubscribe = subscribeToPermissionChanges((newState) => {
      if (newState === 'granted') {
        setLocationError(null);
        setErrorMessage('');
      } else if (newState === 'denied') {
        setLocationError((prev) =>
          prev
            ? {
                ...prev,
                isBlocked: true,
                headline: 'Location access is blocked.',
                friendlyMessage:
                  'Please allow Location permission for this site in your browser settings, then refresh the page.',
                actionText:
                  'Click here to allow location access in your browser settings, then refresh the page.',
              }
            : null
        );
      }
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 3. SHARED CALCULATION & NEARBY PLACES STATE
  // ==========================================
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

  // Modals
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(false);

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

  const nearbyCenterLat = Number((userGpsCoords?.lat ?? startPlace?.lat ?? 26.9124).toFixed(2));
  const nearbyCenterLng = Number((userGpsCoords?.lng ?? startPlace?.lng ?? 75.7873).toFixed(2));

  // Fetch Nearby Places when category or center changes
  useEffect(() => {
    let isCancelled = false;

    setIsFetchingNearby(true);
    fetchNearbyPlacesOsm({
      lat: nearbyCenterLat,
      lng: nearbyCenterLng,
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
  }, [selectedCategory, nearbyCenterLat, nearbyCenterLng]);

  // Handle Route Calculation
  const handleCalculateRoute = async () => {
    setErrorMessage('');
    if (appMode === 'real_world') {
      if (!startPlace?.lat || !startPlace?.lng) {
        if (isLocating) {
          setErrorMessage('Acquiring current location. Please wait a moment...');
        } else {
          setErrorMessage('Please specify a starting location or enable location access.');
        }
        return;
      }
      if (!destinationPlace?.lat || !destinationPlace?.lng) {
        setErrorMessage('Please select a destination location.');
        return;
      }
      calculateAndSetRoute(startPlace, destinationPlace, travelMode);
    } else {
      // Dijkstra Demo Mode
      handleRunInstantly();
    }
  };

  // Stop Live GPS Location Tracking
  const handleStopLiveLocation = () => {
    stopLiveLocationWatch();
    setIsLiveTracking(false);
    setIsLocating(false);
    lastRoutedGpsRef.current = null;
  };

  // Continuous Live GPS Location Tracking (Requirements 1, 3, 4, 6)
  const handleUseMyLocation = () => {
    setLocationError(null);
    setErrorMessage('');
    setIsLocating(true);
    setIsSourceCurrentLocation(true);
    isSourceCurrentLocationRef.current = true;
    lastRoutedGpsRef.current = null;

    // Immediately set "My Current Location" as the displayed source
    setStartPlace((prev) => ({
      name: 'My Current Location',
      lat: userGpsCoords?.lat ?? (prev?.isCurrentLocation ? prev?.lat : null),
      lng: userGpsCoords?.lng ?? (prev?.isCurrentLocation ? prev?.lng : null),
      accuracy: userGpsCoords?.accuracy ?? null,
      isCurrentLocation: true,
    }));
    setCurrentLocationName('My Current Location');

    // If coordinates are already cached and destination exists, calculate route immediately
    if (userGpsCoords?.lat && userGpsCoords?.lng && destinationPlace?.lat && destinationPlace?.lng) {
      calculateAndSetRoute(
        { name: 'My Current Location', lat: userGpsCoords.lat, lng: userGpsCoords.lng, isCurrentLocation: true },
        destinationPlace,
        travelModeRef.current
      );
    }

    startLiveLocationWatch(
      async (pos) => {
        setIsLocating(false);
        setIsLiveTracking(true);
        setUserGpsCoords({
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          timestamp: pos.timestamp,
        });

        // Requirement 3 & 4: Only update source and reroute if source is "My Current Location"
        if (isSourceCurrentLocationRef.current) {
          const currentPlace = {
            name: 'My Current Location',
            lat: pos.lat,
            lng: pos.lng,
            accuracy: pos.accuracy,
            isCurrentLocation: true,
          };
          setStartPlace(currentPlace);
          setCurrentLocationName('My Current Location');

          const dest = destinationPlaceRef.current;
          if (!dest || !dest.lat || !dest.lng) return;

          let shouldReroute = false;
          if (!lastRoutedGpsRef.current) {
            shouldReroute = true;
          } else {
            const movedMeters = calculateDistanceMeters(
              lastRoutedGpsRef.current.lat,
              lastRoutedGpsRef.current.lng,
              pos.lat,
              pos.lng
            );
            // Requirement 4: Movement threshold to prevent excessive requests
            if (movedMeters >= 40) {
              shouldReroute = true;
            }
          }

          if (!shouldReroute || isReroutingRef.current) return;

          isReroutingRef.current = true;
          lastRoutedGpsRef.current = { lat: pos.lat, lng: pos.lng };

          try {
            await calculateAndSetRoute(currentPlace, dest, travelModeRef.current);
          } catch (rerouteErr) {
            console.warn('Live GPS auto-reroute skipped:', rerouteErr);
          } finally {
            isReroutingRef.current = false;
          }
        }
      },
      (error) => {
        stopLiveLocationWatch();
        setIsLocating(false);
        setIsLiveTracking(false);
        setLocationError(error);
        setErrorMessage(error.friendlyMessage || error.message);
        // Requirement 6: Do not silently substitute a fixed location! Keep null so user can type manually.
        if (isSourceCurrentLocationRef.current) {
          setStartPlace(null);
        }
      }
    );
  };

  // Requirement 3: Manual selection of starting point (stops automatic GPS overwrite)
  const handleSelectStartPlace = (place) => {
    setIsSourceCurrentLocation(false);
    isSourceCurrentLocationRef.current = false;
    lastRoutedGpsRef.current = null;
    const newPlace = place ? { ...place, isCurrentLocation: false } : null;
    setStartPlace(newPlace);
    if (newPlace?.lat && newPlace?.lng && destinationPlace?.lat && destinationPlace?.lng) {
      calculateAndSetRoute(newPlace, destinationPlace, travelMode);
    } else {
      setRouteCoordinates([]);
      setRealRouteResult(null);
    }
  };

  // Clear starting point
  const handleClearStartPlace = () => {
    setIsSourceCurrentLocation(false);
    isSourceCurrentLocationRef.current = false;
    lastRoutedGpsRef.current = null;
    setStartPlace(null);
    setRouteCoordinates([]);
    setRealRouteResult(null);
  };

  // Requirement 2: Changing destination MUST NOT reset or replace source, does not request location again
  const handleSelectDestinationPlace = (dest) => {
    setDestinationPlace(dest);
    destinationPlaceRef.current = dest;
    lastRoutedGpsRef.current = null;
    if (startPlace?.lat && startPlace?.lng && dest?.lat && dest?.lng) {
      calculateAndSetRoute(startPlace, dest, travelMode);
    } else {
      setRouteCoordinates([]);
      setRealRouteResult(null);
    }
  };

  // Clear destination (source stays untouched)
  const handleClearDestinationPlace = () => {
    setDestinationPlace(null);
    destinationPlaceRef.current = null;
    lastRoutedGpsRef.current = null;
    setRouteCoordinates([]);
    setRealRouteResult(null);
  };

  // Travel Mode Change
  const handleTravelModeChange = (newMode) => {
    setTravelMode(newMode);
    travelModeRef.current = newMode;
    if (appMode === 'real_world' && startPlace?.lat && destinationPlace?.lat) {
      calculateAndSetRoute(startPlace, destinationPlace, newMode);
    }
  };

  // Navigate to a Nearby Place (Preserves source as "My Current Location")
  const handleNavigateToNearbyPlace = (place) => {
    if (appMode === 'real_world') {
      const newDest = {
        name: place.name,
        lat: place.lat,
        lng: place.lng,
      };
      setDestinationPlace(newDest);
      destinationPlaceRef.current = newDest;
      setActiveTab('navigation');
      lastRoutedGpsRef.current = null;
      if (startPlace?.lat && startPlace?.lng) {
        calculateAndSetRoute(startPlace, newDest, travelMode);
      }
    } else {
      const target = place.graphNode || 'Jaipur';
      setDestination(target);
      handleRunInstantly();
    }
  };

  // Reset active route
  const handleResetRoute = () => {
    if (appMode === 'real_world') {
      setRouteCoordinates([]);
      setRealRouteResult(null);
    } else {
      handleResetDijkstra();
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
          isLiveTracking={isLiveTracking}
          nearbyPlaces={nearbyPlaces}
          onNavigateToNearbyPlace={handleNavigateToNearbyPlace}
          darkMode={darkMode}
          mapCenter={
            startPlace?.lat != null && startPlace?.lng != null
              ? [startPlace.lat, startPlace.lng]
              : userGpsCoords?.lat != null && userGpsCoords?.lng != null
                ? [userGpsCoords.lat, userGpsCoords.lng]
                : destinationPlace?.lat != null && destinationPlace?.lng != null
                  ? [destinationPlace.lat, destinationPlace.lng]
                  : [26.9124, 75.7873]
          }
          zoom={12}
        />
      ) : (
        <NetworkMap
          source={source}
          destination={destination}
          activeRoute={dijkstraRoute}
          currentStep={dijkstraSteps[currentStepIndex] || null}
          activeTab={activeTab}
          selectedCityForNearby={selectedCityForNearby}
          nearbyPlaces={nearbyPlaces}
          selectedCategory={selectedCategory}
          onSelectCity={handleSelectGraphNode}
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

      {/* 2. TOP PRIMARY / DUAL-MODE SWITCHER */}
      <div className="fixed top-4 left-4 sm:left-[435px] z-20 flex flex-wrap items-center gap-2 max-w-[calc(100vw-32px)]">
        <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <button
            type="button"
            onClick={() => setAppMode('real_world')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              appMode === 'real_world'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>Real-World Map (Leaflet & OSM)</span>
          </button>
          <button
            type="button"
            onClick={() => setAppMode('dijkstra_demo')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              appMode === 'dijkstra_demo'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <RouteIcon className="h-3.5 w-3.5" />
            <span>Dijkstra Shortest Path</span>
          </button>
        </div>

        {appMode === 'dijkstra_demo' && <NetworkStatus darkMode={darkMode} />}
      </div>

      {/* 3. LEFT FLOATING NAVIGATION & NEARBY PANEL */}
      <NavigationPanel
        appMode={appMode}
        onModeChange={setAppMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // Real-world props
        startPlace={startPlace}
        destinationPlace={destinationPlace}
        onSelectStartPlace={handleSelectStartPlace}
        onSelectDestinationPlace={handleSelectDestinationPlace}
        onClearStartPlace={handleClearStartPlace}
        onClearDestinationPlace={handleClearDestinationPlace}
        travelMode={travelMode}
        onTravelModeChange={handleTravelModeChange}
        onUseMyLocation={handleUseMyLocation}
        onStopLiveLocation={handleStopLiveLocation}
        isLocating={isLocating}
        isLiveTracking={isLiveTracking}
        isSourceCurrentLocation={isSourceCurrentLocation}
        locationError={locationError}
        onOpenPermissionHelp={() => setIsPermissionModalOpen(true)}
        onDismissLocationError={() => setLocationError(null)}
        // Dijkstra demo props
        source={source}
        destination={destination}
        onSourceChange={handleSourceChange}
        onDestinationChange={handleDestinationChange}
        // Dijkstra playback controls
        onRun={handleRunDijkstra}
        onPause={handlePauseDijkstra}
        onResume={handleResumeDijkstra}
        onReset={handleResetDijkstra}
        onRunInstantly={handleRunInstantly}
        isPlaying={isDijkstraPlaying}
        isPaused={isDijkstraPaused}
        speed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
        currentStep={dijkstraSteps[currentStepIndex] || null}
        currentStepIndex={currentStepIndex}
        totalSteps={dijkstraSteps.length}
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
            const src = {
              name: item.source,
              lat: item.startLat || (item.source === 'Jaipur' ? 26.9124 : 28.6139),
              lng: item.startLng || (item.source === 'Jaipur' ? 75.7873 : 77.2090),
              isCurrentLocation: false,
            };
            const dest = {
              name: item.destination,
              lat: item.destLat || (item.destination === 'Udaipur' ? 24.5854 : 27.1767),
              lng: item.destLng || (item.destination === 'Udaipur' ? 73.7125 : 78.0081),
            };
            setIsSourceCurrentLocation(false);
            isSourceCurrentLocationRef.current = false;
            lastRoutedGpsRef.current = null;
            setStartPlace(src);
            setDestinationPlace(dest);
            destinationPlaceRef.current = dest;
            if (src.lat && dest.lat) {
              calculateAndSetRoute(src, dest, travelModeRef.current);
            }
          } else {
            setSource(item.source);
            setDestination(item.destination);
            try {
              const { steps, finalResult } = generateDijkstraSteps(item.source, item.destination);
              setDijkstraSteps(steps);
              setDijkstraRoute(finalResult);
              setCurrentStepIndex(steps.length - 1);
            } catch (e) {}
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
        onExploreNearby={() => {
          setAppMode('real_world');
          setActiveTab('nearby');
        }}
        onResetRoute={handleResetRoute}
        darkMode={darkMode}
      />

      {/* 5. RIGHT-SIDE FLOATING MAP CONTROLS */}
      <MapControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 1, 18))}
        onZoomOut={() => setZoom((z) => Math.max(z - 1, 4))}
        onCenter={() => {
          if (appMode === 'real_world' && startPlace) {
            setUserGpsCoords({ lat: startPlace.lat, lng: startPlace.lng });
          } else {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }
        }}
        onResetView={() => {
          if (appMode === 'real_world') {
            setRouteCoordinates([]);
            setRealRouteResult(null);
          } else {
            handleResetDijkstra();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* 6. TURN-BY-TURN / SEGMENT DETAILS DRAWER */}
      <RouteDetailsDrawer
        isOpen={isRouteDetailsOpen}
        onClose={() => setIsRouteDetailsOpen(false)}
        routeResult={currentActiveRoute}
        darkMode={darkMode}
      />

      {/* 7. BROWSER LOCATION PERMISSION INSTRUCTIONS & HELP MODAL */}
      <LocationPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onRetry={() => {
          setIsPermissionModalOpen(false);
          handleUseMyLocation();
        }}
        isBlocked={locationError?.isBlocked || false}
        darkMode={darkMode}
      />
    </div>
  );
}
