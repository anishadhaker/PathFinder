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
 * Query current permission status via navigator.permissions API
 * @returns {Promise<'granted' | 'prompt' | 'denied' | 'unsupported'>}
 */
export const checkLocationPermissionStatus = async () => {
  if (typeof window === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state; // 'granted' | 'prompt' | 'denied'
  } catch (err) {
    return 'unsupported';
  }
};

/**
 * Listen for browser permission state changes
 * @param {Function} callback - Invoked with new state ('granted' | 'prompt' | 'denied')
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPermissionChanges = (callback) => {
  if (typeof window === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return () => {};
  }
  let activeStatus = null;
  const handler = () => {
    if (activeStatus && callback) callback(activeStatus.state);
  };

  navigator.permissions
    .query({ name: 'geolocation' })
    .then((status) => {
      activeStatus = status;
      status.addEventListener('change', handler);
    })
    .catch(() => {});

  return () => {
    if (activeStatus) {
      activeStatus.removeEventListener('change', handler);
    }
  };
};

/**
 * Format GeolocationPositionError to a structured error object
 */
export const createGeolocationError = async (rawError, context = 'location') => {
  const code = rawError?.code || 0;
  let type = 'UNKNOWN';
  let isPermissionDenied = false;
  let isBlocked = false;
  let headline = 'Location Error';
  let message = 'An unexpected error occurred while accessing location.';
  let actionText = 'Try Again';

  if (code === 1) {
    // PERMISSION_DENIED (User rejected or browser blocked)
    isPermissionDenied = true;
    type = 'PERMISSION_DENIED';

    const permState = await checkLocationPermissionStatus();
    if (permState === 'denied') {
      isBlocked = true;
      headline = 'Location access is blocked.';
      message = 'Please allow Location permission for this site in your browser settings, then refresh the page.';
      actionText = 'Click here to allow location access in your browser settings, then refresh the page.';
    } else {
      headline = 'Location permission denied.';
      message = 'Please allow Location permission for this site in your browser settings, then try again.';
      actionText = 'Click here to allow location access';
    }
  } else if (code === 2) {
    // POSITION_UNAVAILABLE
    type = 'POSITION_UNAVAILABLE';
    headline = 'Location Unavailable';
    message = 'Unable to determine your location. Please check your device location/GPS.';
    actionText = 'Retry Location';
  } else if (code === 3) {
    // TIMEOUT
    type = 'TIMEOUT';
    headline = 'Request Timed Out';
    message = 'Location request timed out. Please try again.';
    actionText = 'Try Again';
  } else if (rawError?.message && rawError.message.includes('not supported')) {
    type = 'UNSUPPORTED';
    headline = 'Not Supported';
    message = 'Geolocation is not supported by your web browser.';
    actionText = 'Dismiss';
  } else {
    headline = 'Unable to Retrieve Location';
    message = rawError?.message || `Unable to retrieve device ${context}.`;
    actionText = 'Try Again';
  }

  const err = new Error(message);
  err.code = code;
  err.type = type;
  err.isPermissionDenied = isPermissionDenied;
  err.isBlocked = isBlocked;
  err.headline = headline;
  err.friendlyMessage = message;
  err.actionText = actionText;
  err.rawError = rawError;
  return err;
};

/**
 * Single-shot location retrieval (Promise-based)
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      createGeolocationError(new Error('Geolocation is not supported by your web browser.')).then(
        reject
      );
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
      async (error) => {
        const enhancedError = await createGeolocationError(error, 'current position');
        reject(enhancedError);
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
 * @param {Function} onError - Callback invoked with structured Error object on GPS error
 * @param {object} [options] - Custom Geolocation options
 * @returns {number|null} The watch identifier or null if unsupported
 */
export const startLiveLocationWatch = (onPositionUpdate, onError, options = {}) => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    if (onError) {
      createGeolocationError(new Error('Geolocation is not supported by your web browser.')).then(
        onError
      );
    }
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
      async (error) => {
        if (typeof onError === 'function') {
          const enhancedError = await createGeolocationError(error, 'live tracking');
          onError(enhancedError);
        }
      },
      watchOptions
    );
    return activeWatchId;
  } catch (err) {
    if (typeof onError === 'function') {
      createGeolocationError(err, 'live tracking').then(onError);
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

