import { NEARBY_PLACES_BY_CITY, NEARBY_CATEGORIES } from '../data/nearbyPlacesData.js';
import { CITIES } from '../data/graphData.js';

// Fetch nearby places with optional category and search term filters
export const getNearbyPlaces = ({ city, category = 'all', search = '' }) => {
  if (!city) return [];

  const places = NEARBY_PLACES_BY_CITY[city] || [];

  return places.filter((place) => {
    const matchesCategory =
      category === 'all' || place.category.toLowerCase() === category.toLowerCase();

    const matchesSearch =
      !search ||
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.category.toLowerCase().includes(search.toLowerCase()) ||
      place.address.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });
};

// Format distance: < 1000m -> '850 m away', >= 1000m -> '1.2 km away'
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters} m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
};

// Get default or simulated current location
export const getMockCurrentLocation = () => {
  return {
    city: 'Jaipur',
    coords: { lat: 26.9124, lng: 75.7873 },
    name: 'Jaipur Central (Current Location)',
    isSimulated: true,
  };
};

// Try to use geolocation if available, or fallback gracefully
export const requestUserLocation = async () => {
  if (!navigator.geolocation) {
    return getMockCurrentLocation();
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        // Since this is a regional simulation without full GPS geocoding API,
        // resolve to nearest project hub (e.g. Jaipur or Delhi)
        resolve({
          city: 'Jaipur',
          isSimulated: false,
          name: 'Device Location (Near Jaipur)',
        });
      },
      () => {
        // Fallback to mock location on user denial or error
        resolve(getMockCurrentLocation());
      },
      { timeout: 4000 }
    );
  });
};

export { NEARBY_CATEGORIES, CITIES };
