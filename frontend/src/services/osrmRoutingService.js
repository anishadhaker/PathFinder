/**
 * Open Source Routing Machine (OSRM) Routing Service
 * Calculates real-world road networks, driving/walking distances, durations, and GeoJSON route coordinates.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

/**
 * Format duration in seconds to a human-readable string
 */
export const formatDuration = (totalSeconds) => {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min${minutes === 1 ? '' : 's'}`;
  if (minutes === 0) return `${hours} hr${hours === 1 ? '' : 's'}`;
  return `${hours}h ${minutes}m`;
};

/**
 * Calculate route between two coordinates
 * @param {object} params
 * @param {number} params.startLat
 * @param {number} params.startLng
 * @param {number} params.endLat
 * @param {number} params.endLng
 * @param {string} [params.mode='driving'] 'driving' | 'walking' | 'cycling'
 * @returns {Promise<object>} Route details and coordinates
 */
export const calculateOsrmRoute = async ({
  startLat,
  startLng,
  endLat,
  endLng,
  mode = 'driving',
}) => {
  // OSRM coordinates format: {longitude},{latitude};{longitude},{latitude}
  const osrmProfile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bicycle' : 'driving';
  const coordsString = `${startLng},${startLat};${endLng},${endLat}`;
  const url = `${OSRM_BASE_URL}/${osrmProfile}/${coordsString}?overview=full&geometries=geojson&steps=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Routing service returned status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No navigable road route found between the selected locations.');
    }

    const primaryRoute = data.routes[0];
    const distanceMeters = primaryRoute.distance;
    const distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
    const durationSeconds = primaryRoute.duration;

    // Convert GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
    const polylineCoordinates = primaryRoute.geometry.coordinates.map(([lng, lat]) => [
      lat,
      lng,
    ]);

    // Parse turn-by-turn steps
    const steps = (primaryRoute.legs[0]?.steps || []).map((step, index) => {
      const maneuver = step.maneuver || {};
      const type = maneuver.type || 'turn';
      const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
      const street = step.name ? ` onto ${step.name}` : '';

      return {
        id: index,
        instruction: `${type.charAt(0).toUpperCase() + type.slice(1)}${modifier}${street}`,
        distance: step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`,
        distanceMeters: step.distance,
        duration: formatDuration(step.duration),
      };
    });

    return {
      success: true,
      distanceKm,
      distanceMeters,
      durationSeconds,
      formattedDuration: formatDuration(durationSeconds),
      coordinates: polylineCoordinates,
      steps,
      provider: 'Open Source Routing Machine (OSRM)',
      mode,
    };
  } catch (err) {
    console.error('OSRM route calculation error:', err);
    throw new Error(err.message || 'Failed to calculate real-world route. Please verify locations.');
  }
};
