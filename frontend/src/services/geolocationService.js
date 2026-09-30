/**
 * Browser Geolocation API service
 * Real-time continuous device location tracking via navigator.geolocation.watchPosition()
 * Includes single-shot fallback, distance delta calculation, and lifecycle cleanup.
 */

let activeWatchId = null;

/**
 * Calculate Haversine distance in meters between two lat/lng coordinates
 * Used to filter insignificant GPS drift before triggering route recalculation.
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371e3; // Earth's mean radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Format GeolocationPositionError to user-friendly error message
 */
const formatGeolocationError = (error, context = 'location') => {
  switch (error?.code) {
    case 1: // PERMISSION_DENIED
      return 'Location access was denied. Please enable location permissions in your browser.';
    case 2: // POSITION_UNAVAILABLE
      return 'Location information is currently unavailable. Please verify your device GPS/network.';
    case 3: // TIMEOUT
      return 'The request to obtain your GPS location timed out. Please try again.';
    default:
      return error?.message || `An error occurred while tracking device ${context}.`;
  }
};

/**
 * Single-shot location retrieval (Promise-based)
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your web browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(new Error(formatGeolocationError(error, 'current position')));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * Start continuous live GPS tracking using navigator.geolocation.watchPosition()
 * @param {Function} onPositionUpdate - Callback invoked with new position {lat, lng, accuracy, heading, speed}
 * @param {Function} onError - Callback invoked with Error object on GPS error
 * @param {object} [options] - Custom Geolocation options
 * @returns {number|null} The watch identifier or null if unsupported
 */
export const startLiveLocationWatch = (onPositionUpdate, onError, options = {}) => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    if (onError) onError(new Error('Geolocation is not supported by your web browser.'));
    return null;
  }

  // Clear existing watch if already running to prevent duplicate/leaked watchers
  if (activeWatchId !== null) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }

  const watchOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 3000,
    ...options,
  };

  try {
    activeWatchId = navigator.geolocation.watchPosition(
      (position) => {
        if (typeof onPositionUpdate === 'function') {
          onPositionUpdate({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        }
      },
      (error) => {
        if (typeof onError === 'function') {
          onError(new Error(formatGeolocationError(error, 'live tracking')));
        }
      },
      watchOptions
    );
    return activeWatchId;
  } catch (err) {
    if (typeof onError === 'function') {
      onError(err);
    }
    return null;
  }
};

/**
 * Stop continuous live GPS tracking
 * @returns {boolean} True if a watch was stopped, false otherwise
 */
export const stopLiveLocationWatch = () => {
  if (activeWatchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
    return true;
  }
  return false;
};

/**
 * Check if live tracking is currently active
 * @returns {boolean}
 */
export const isLiveLocationTracking = () => {
  return activeWatchId !== null;
};

