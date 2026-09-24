import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Crosshair,
  Compass,
  Hospital,
  UtensilsCrossed,
  Fuel,
  Hotel,
  GraduationCap,
  ShoppingBag,
  Landmark,
  ParkingSquare,
  Sparkles,
} from 'lucide-react';

// Custom Map Controller to smoothly re-center or fit route bounds
function MapController({ center, zoom, routeBounds }) {
  const map = useMap();

  useEffect(() => {
    if (routeBounds && routeBounds.length > 1) {
      map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, routeBounds, map]);

  return null;
}

// Custom HTML DivIcon creator for modern map pins
const createCustomIcon = (type, label = '') => {
  if (type === 'start') {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 999px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); display: flex; align-items: center; gap: 3px; border: 1.5px solid white;">
            <span>A</span> • Start
          </div>
          <div style="width: 14px; height: 14px; background: #10b981; border: 2px solid white; border-radius: 50%; margin-top: -2px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });
  }

  if (type === 'destination') {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #8b5cf6; color: white; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 999px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); display: flex; align-items: center; gap: 3px; border: 1.5px solid white;">
            <span>B</span> • Destination
          </div>
          <div style="width: 14px; height: 14px; background: #8b5cf6; border: 2px solid white; border-radius: 50%; margin-top: -2px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });
  }

  if (type === 'gps') {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(14, 165, 233, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.5);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  // Nearby place pin
  const pinBg =
    label === 'Hospital'
      ? '#ef4444'
      : label === 'Restaurant'
      ? '#f59e0b'
      : label === 'Petrol Pump'
      ? '#f97316'
      : label === 'Hotel'
      ? '#6366f1'
      : label === 'College'
      ? '#2563eb'
      : label === 'Shopping'
      ? '#a855f7'
      : label === 'Parking'
      ? '#14b8a6'
      : '#10b981';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
        <div style="width: 22px; height: 22px; border-radius: 50%; background: ${pinBg}; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 800;">
          ${label.charAt(0)}
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export default function LeafletMapView({
  startCoords,
  destinationCoords,
  routeCoordinates = [],
  userGpsCoords,
  nearbyPlaces = [],
  onNavigateToNearbyPlace,
  darkMode = false,
  mapCenter = [26.9124, 75.7873], // Default Jaipur
  zoom = 12,
}) {
  // Tile URLs
  const dayTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const nightTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  // Compute route bounds for auto-fit
  const routeBounds =
    routeCoordinates.length > 0
      ? L.latLngBounds(routeCoordinates.map(([lat, lng]) => [lat, lng]))
      : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full z-10"
      >
        <MapController
          center={mapCenter}
          zoom={zoom}
          routeBounds={routeBounds}
        />

        {/* Tile Layer (OSM Light or CartoDB Dark Matter) */}
        <TileLayer
          key={darkMode ? 'dark-tiles' : 'light-tiles'}
          url={darkMode ? nightTiles : dayTiles}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* User Live GPS Marker */}
        {userGpsCoords && (
          <Marker
            position={[userGpsCoords.lat, userGpsCoords.lng]}
            icon={createCustomIcon('gps')}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-sky-600">Your Current Position</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Live Device GPS</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Start Point Marker */}
        {startCoords && (
          <Marker
            position={[startCoords.lat, startCoords.lng]}
            icon={createCustomIcon('start')}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-emerald-600">Starting Location</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                  {startCoords.name || `${startCoords.lat.toFixed(4)}, ${startCoords.lng.toFixed(4)}`}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Point Marker */}
        {destinationCoords && (
          <Marker
            position={[destinationCoords.lat, destinationCoords.lng]}
            icon={createCustomIcon('destination')}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-violet-600">Destination</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                  {destinationCoords.name || `${destinationCoords.lat.toFixed(4)}, ${destinationCoords.lng.toFixed(4)}`}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Calculated OSRM Road Route Polyline */}
        {routeCoordinates.length > 0 && (
          <>
            {/* Outer casing shadow line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: darkMode ? '#0369a1' : '#0284c7',
                weight: 8,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Inner illuminated route line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#38bdf8',
                weight: 4.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Nearby Places Markers */}
        {nearbyPlaces.map((place) => {
          if (!place.lat || !place.lng) return null;

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createCustomIcon('nearby', place.category)}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span>{place.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {place.category} • <span className="text-emerald-600 font-semibold">{place.formattedDistance}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {place.address}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateToNearbyPlace && onNavigateToNearbyPlace(place)}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-sky-500"
                  >
                    <Navigation className="h-3 w-3" />
                    Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Status Indicator on Map */}
      <div className="pointer-events-none absolute top-4 right-4 z-20 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
          OpenStreetMap & OSRM Live
        </span>
      </div>
    </div>
  );
}
