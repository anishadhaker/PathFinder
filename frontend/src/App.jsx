import React, { useState, useEffect, useMemo, useRef } from 'react';
import LeafletMapView from './components/LeafletMapView';
import DijkstraGraphView from './components/DijkstraGraphView';
import DijkstraProgressPanel from './components/DijkstraProgressPanel';
import NavigationPanel from './components/NavigationPanel';
import RouteResultCard from './components/RouteResultCard';
import RouteDetailsDrawer from './components/RouteDetailsDrawer';
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
  startLiveLocationWatch,
  stopLiveLocationWatch,
  calculateDistanceMeters,
  subscribeToPermissionChanges,
} from './services/geolocationService';
import { reverseGeocode } from './services/nominatimService';
import { CITIES } from './data/graphData';

export default function App() {
  // App Mode: PRIMARY Academic Dijkstra Mode vs Supporting Real-World Mode
  const [appMode, setAppMode] = useState('dijkstra_demo');

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
    try {
      const { steps, finalResult } = generateDijkstraSteps(source, destination);
      setDijkstraSteps(steps);
      setDijkstraRoute(finalResult);
      setCurrentStepIndex(0);
    } catch (e) {
      setDijkstraSteps([]);
      setCurrentStepIndex(-1);
      setDijkstraRoute(null);
    }
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

  const handleSwapDijkstra = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setIsDijkstraPlaying(false);
    setIsDijkstraPaused(false);
    try {
      const { steps, finalResult } = generateDijkstraSteps(destination, temp);
      setDijkstraSteps(steps);
      setDijkstraRoute(finalResult);
      setCurrentStepIndex(0);
    } catch (e) {}
  };

  const handleSelectGraphNode = (cityName) => {
    if (!source || (source && destination && currentStepIndex === dijkstraSteps.length - 1)) {
      setSource(cityName);
      setDestination('');
      handleResetDijkstra();
    } else if (source && !destination) {
      setDestination(cityName);
      try {
        const { steps, finalResult } = generateDijkstraSteps(source, cityName);
        setDijkstraSteps(steps);
        setDijkstraRoute(finalResult);
        setCurrentStepIndex(0);
      } catch (e) {}
    } else {
      setDestination(cityName);
      try {
        const { steps, finalResult } = generateDijkstraSteps(source, cityName);
        setDijkstraSteps(steps);
        setDijkstraRoute(finalResult);
        setCurrentStepIndex(0);
      } catch (e) {}
    }
  };

  // ==========================================
  // 2. REAL-WORLD NAVIGATION & LIVE GPS STATE
  // ==========================================
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
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

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

  // Theme & View State
  const [darkMode, setDarkMode] = useState(false);

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
      radiusMeters: 5000,
    })
      .then((places) => {
        if (!isCancelled) {
          setNearbyPlaces(places);
          setIsFetchingNearby(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setIsFetchingNearby(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, userGpsCoords, startPlace]);

  // Real-world OSRM routing
  const handleCalculateRoute = async () => {
    setErrorMessage('');
    setIsCalculating(true);

    if (appMode === 'real_world') {
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
    }
  };

  // Swap locations for real-world mode
  const handleSwap = () => {
    if (appMode === 'real_world') {
      const temp = startPlace;
      setStartPlace(destinationPlace);
      setDestinationPlace(temp);
      setRouteCoordinates([]);
      setRealRouteResult(null);
    } else {
      handleSwapDijkstra();
    }
    setErrorMessage('');
  };

  // Stop continuous live GPS tracking
  const handleStopLiveLocation = () => {
    stopLiveLocationWatch();
    setIsLiveTracking(false);
    setIsLocating(false);
  };

  // Continuous Live GPS Location Tracking using watchPosition()
  const handleUseMyLocation = () => {
    if (isLiveTracking) {
      handleStopLiveLocation();
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setErrorMessage('');

    let isInitialFix = true;

    startLiveLocationWatch(
      async (pos) => {
        setUserGpsCoords(pos);
        setIsLocating(false);
        setIsLiveTracking(true);
        setLocationError(null);

        if (isInitialFix) {
          isInitialFix = false;
          lastRoutedGpsRef.current = { lat: pos.lat, lng: pos.lng };

          try {
            const geo = await reverseGeocode(pos.lat, pos.lng);
            setStartPlace({
              name: geo.name || 'My Current GPS Location',
              displayName: geo.displayName,
              lat: pos.lat,
              lng: pos.lng,
              isGps: true,
            });
            setCurrentLocationName(geo.name || 'Live GPS Location');
          } catch (e) {
            setStartPlace({
              name: 'My Current GPS Location',
              lat: pos.lat,
              lng: pos.lng,
              isGps: true,
            });
          }

          const dest = destinationPlaceRef.current;
          if (dest && dest.lat && dest.lng) {
            try {
              isReroutingRef.current = true;
              const result = await calculateOsrmRoute({
                startLat: pos.lat,
                startLng: pos.lng,
                endLat: dest.lat,
                endLng: dest.lng,
                mode: travelModeRef.current,
              });

              setRouteCoordinates(result.coordinates);
              setRealRouteResult({
                source: 'My Current Location',
                destination: dest.name,
                path: ['My Current Location', dest.name],
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
            } catch (initErr) {
              console.warn('Initial live route calculation skipped:', initErr);
            } finally {
              isReroutingRef.current = false;
            }
          }
          return;
        }

        setStartPlace((prev) =>
          prev?.isGps ? { ...prev, lat: pos.lat, lng: pos.lng } : prev
        );

        const dest = destinationPlaceRef.current;
        if (!dest || !dest.lat || !dest.lng) {
          return;
        }

        const lastRouted = lastRoutedGpsRef.current;
        const movementMeters = lastRouted
          ? calculateDistanceMeters(lastRouted.lat, lastRouted.lng, pos.lat, pos.lng)
          : 999;

        if (movementMeters < 40) {
          return;
        }

        if (isReroutingRef.current) {
          return;
        }

        lastRoutedGpsRef.current = { lat: pos.lat, lng: pos.lng };
        isReroutingRef.current = true;

        try {
          const result = await calculateOsrmRoute({
            startLat: pos.lat,
            startLng: pos.lng,
            endLat: dest.lat,
            endLng: dest.lng,
            mode: travelModeRef.current,
          });

          setRouteCoordinates(result.coordinates);
          setRealRouteResult({
            source: 'My Current Location',
            destination: dest.name,
            path: ['My Current Location', dest.name],
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
        } catch (rerouteErr) {
          console.warn('Live GPS auto-reroute skipped:', rerouteErr);
        } finally {
          isReroutingRef.current = false;
        }
      },
      (error) => {
        if (error.isPermissionDenied) {
          stopLiveLocationWatch();
          setIsLocating(false);
          setIsLiveTracking(false);
          setLocationError(error);
          setErrorMessage(error.friendlyMessage || error.message);
        } else if (error.isTransient) {
          if (!lastRoutedGpsRef.current) {
            stopLiveLocationWatch();
            setIsLocating(false);
            setIsLiveTracking(false);
            setLocationError(error);
            setErrorMessage(error.friendlyMessage || error.message);
          } else {
            console.warn('Temporary GPS signal loss, continuing watch:', error.message);
          }
        } else {
          stopLiveLocationWatch();
          setIsLocating(false);
          setIsLiveTracking(false);
          setLocationError(error);
          setErrorMessage(error.friendlyMessage || error.message);
        }
      }
    );
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
      {/* 1. MAIN WORKSPACE BASED ON APP MODE */}
      {appMode === 'dijkstra_demo' ? (
        <div className="relative h-full w-full flex overflow-hidden">
          {/* Left Dijkstra Progress & Control Panel */}
          <div className="w-full sm:w-[420px] lg:w-[460px] h-full z-20 shrink-0 shadow-2xl">
            <DijkstraProgressPanel
              source={source}
              destination={destination}
              onSourceChange={(city) => {
                setSource(city);
                handleResetDijkstra();
              }}
              onDestinationChange={(city) => {
                setDestination(city);
                handleResetDijkstra();
              }}
              onSwap={handleSwapDijkstra}
              currentStep={dijkstraSteps[currentStepIndex] || null}
              currentStepIndex={currentStepIndex}
              totalSteps={dijkstraSteps.length}
              isPlaying={isDijkstraPlaying}
              isPaused={isDijkstraPaused}
              isComplete={currentStepIndex === dijkstraSteps.length - 1 && dijkstraSteps.length > 0}
              speed={animationSpeed}
              onSpeedChange={setAnimationSpeed}
              onRun={handleRunDijkstra}
              onPause={handlePauseDijkstra}
              onResume={handleResumeDijkstra}
              onReset={handleResetDijkstra}
              onRunInstantly={handleRunInstantly}
              finalResult={dijkstraRoute}
              errorMessage={errorMessage}
              darkMode={darkMode}
            />
          </div>

          {/* Center / Right Dijkstra Graph Canvas */}
          <div className="hidden sm:block flex-1 h-full relative">
            <DijkstraGraphView
              source={source}
              destination={destination}
              currentStep={dijkstraSteps[currentStepIndex] || null}
              finalPath={
                currentStepIndex === dijkstraSteps.length - 1 && dijkstraRoute
                  ? dijkstraRoute.path
                  : []
              }
              onSelectNode={handleSelectGraphNode}
              darkMode={darkMode}
            />
          </div>
        </div>
      ) : (
        /* Real-World Navigation Mode */
        <div className="relative h-full w-full">
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
              startPlace ? [startPlace.lat, startPlace.lng] : [26.9124, 75.7873]
            }
            zoom={12}
          />

          <NavigationPanel
            appMode={appMode}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            startPlace={startPlace}
            destinationPlace={destinationPlace}
            onSelectStartPlace={setStartPlace}
            onSelectDestinationPlace={setDestinationPlace}
            onClearStartPlace={() => setStartPlace(null)}
            onClearDestinationPlace={() => setDestinationPlace(null)}
            travelMode={travelMode}
            onTravelModeChange={setTravelMode}
            onUseMyLocation={handleUseMyLocation}
            onStopLiveLocation={handleStopLiveLocation}
            isLocating={isLocating}
            isLiveTracking={isLiveTracking}
            locationError={locationError}
            onOpenPermissionHelp={() => setIsPermissionModalOpen(true)}
            onDismissLocationError={() => setLocationError(null)}
            source={source}
            destination={destination}
            onSourceChange={setSource}
            onDestinationChange={setDestination}
            onSwap={handleSwap}
            onCalculateRoute={handleCalculateRoute}
            isCalculating={isCalculating}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage('')}
            activeRoute={currentActiveRoute}
            onResetRoute={handleResetRoute}
            recentSearches={recentSearches}
            onSelectRecentSearch={(item) => {
              setStartPlace({ name: item.source, lat: 26.9124, lng: 75.7873 });
              setDestinationPlace({ name: item.destination, lat: 24.5854, lng: 73.7125 });
            }}
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
        </div>
      )}

      {/* 2. TOP PRIMARY / DUAL-MODE SWITCHER */}
      <div className="fixed top-4 left-4 sm:left-[475px] z-30 flex items-center gap-3">
        <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <button
            type="button"
            onClick={() => setAppMode('dijkstra_demo')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all ${
              appMode === 'dijkstra_demo'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <RouteIcon className="h-3.5 w-3.5" />
            <span>Dijkstra Shortest Path (Academic Core)</span>
          </button>
          <button
            type="button"
            onClick={() => setAppMode('real_world')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              appMode === 'real_world'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-sky-500 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>Real-World Navigation (OSM/OSRM)</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-lg backdrop-blur-md hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* 3. FLOATING BOTTOM ROUTE RESULT CARD */}
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

      {/* 4. TURN-BY-TURN / SEGMENT DETAILS DRAWER */}
      <RouteDetailsDrawer
        isOpen={isRouteDetailsOpen}
        onClose={() => setIsRouteDetailsOpen(false)}
        routeResult={currentActiveRoute}
        darkMode={darkMode}
      />

      {/* 5. BROWSER LOCATION PERMISSION INSTRUCTIONS & HELP MODAL */}
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
