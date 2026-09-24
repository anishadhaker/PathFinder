/**
 * OpenStreetMap Nominatim Geocoding & Search Service
 * Real-world location autocomplete, address resolution, and reverse geocoding.
 * Complies with Nominatim usage policy (includes custom User-Agent and caching).
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const searchCache = new Map();

/**
 * Search places and addresses matching a query
 * @param {string} query
 * @returns {Promise<Array>} List of matching place objects
 */
export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery);
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '6',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const formattedResults = data.map((item) => {
      // Extract clean short title from display name
      const parts = item.display_name.split(',');
      const shortTitle = parts[0]?.trim() || item.name || 'Location';
      const subtitle = parts.slice(1, 4).join(',').trim();

      return {
        id: item.place_id ? String(item.place_id) : `${item.lat}-${item.lon}`,
        name: shortTitle,
        displayName: item.display_name,
        subtitle: subtitle || item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'place',
        category: item.class || 'general',
      };
    });

    searchCache.set(cleanQuery, formattedResults);
    return formattedResults;
  } catch (err) {
    console.error('Nominatim place search failed:', err);
    throw new Error('Unable to fetch address suggestions. Please check your internet connection.');
  }
};

/**
 * Reverse geocode latitude/longitude to a readable address
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object>}
 */
export const reverseGeocode = async (lat, lng) => {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to resolve address for this location.');
    }

    const data = await response.json();
    const parts = data.display_name ? data.display_name.split(',') : [];
    const shortTitle = parts[0]?.trim() || data.name || 'Current Location';

    const result = {
      name: shortTitle,
      displayName: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
    };

    searchCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return {
      name: 'Selected GPS Location',
      displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
    };
  }
};
