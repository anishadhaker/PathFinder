/**
 * Browser Geolocation API service
 * Requests live device position with explicit user permission and returns coordinates + friendly errors.
 */

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your web browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. Please allow location access in your browser settings to use GPS.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable. Please check your network or device GPS.';
            break;
          case error.TIMEOUT:
            message = 'The request to obtain your location timed out. Please try again.';
            break;
          default:
            message = error.message || 'An unknown error occurred while requesting location.';
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
};
