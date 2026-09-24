import { Loader } from '@googlemaps/js-api-loader';

let googleMapsPromise = null;

/**
 * Checks whether a valid-looking Google Maps API key has been configured in .env
 */
export const getGoogleMapsApiKey = () => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === '' || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return null;
  }
  return key.trim();
};

export const isGoogleMapsKeyConfigured = () => {
  return getGoogleMapsApiKey() !== null;
};

/**
 * Dynamically loads the Google Maps JavaScript API with places and geometry libraries.
 * Reuses the same promise across components to prevent duplicate script tags.
 */
export const loadGoogleMapsApi = () => {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.reject(
      new Error('MISSING_API_KEY: Google Maps API key is not configured in frontend/.env')
    );
  }

  if (!googleMapsPromise) {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    googleMapsPromise = loader.load().catch((err) => {
      googleMapsPromise = null; // Reset on failure so subsequent attempts can retry
      throw err;
    });
  }

  return googleMapsPromise;
};
