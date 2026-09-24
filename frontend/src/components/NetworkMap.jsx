import React, { useRef, useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Navigation2,
  Building2,
  Hospital,
  UtensilsCrossed,
  Fuel,
  Hotel,
  GraduationCap,
  ShoppingBag,
  Landmark,
  ParkingSquare,
  Sparkles,
  Route,
} from 'lucide-react';
import { CITY_NODES, ROADS, MAP_TERRAIN } from '../data/graphData';

// Helper to render proper icon based on category
const CategoryIcon = ({ category, className = 'h-3.5 w-3.5' }) => {
  switch (category) {
    case 'Hospital':
      return <Hospital className={className} />;
    case 'Restaurant':
      return <UtensilsCrossed className={className} />;
    case 'Petrol Pump':
      return <Fuel className={className} />;
    case 'Hotel':
      return <Hotel className={className} />;
    case 'College':
      return <GraduationCap className={className} />;
    case 'Shopping':
      return <ShoppingBag className={className} />;
    case 'Tourist Place':
      return <Landmark className={className} />;
    case 'Parking':
      return <ParkingSquare className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

export default function NetworkMap({
  source,
  destination,
  activeRoute = null,
  activeTab = 'navigation',
  selectedCityForNearby = 'Jaipur',
  nearbyPlaces = [],
  selectedCategory = 'all',
  onSelectCity,
  onNavigateToPlace,
  darkMode = false,
  zoom = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  onResetView,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [selectedPlacePopup, setSelectedPlacePopup] = useState(null);

  const activePath = activeRoute ? activeRoute.path : [];
  const activeSegments = activeRoute ? activeRoute.segments : [];
  const activePathSet = new Set(activePath);

  // Check if a road is part of the active route
  const isRoadInActivePath = (from, to) => {
    if (!activeRoute || activePath.length < 2) return false;
    for (let i = 0; i < activePath.length - 1; i++) {
      if (
        (activePath[i] === from && activePath[i + 1] === to) ||
        (activePath[i] === to && activePath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  // Mouse pan handling
  const handleMouseDown = (e) => {
    // Only drag with left mouse button when clicking map canvas
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    onPanChange({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Close popup if clicking empty space
  const handleCanvasClick = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'map-canvas-bg') {
      setSelectedPlacePopup(null);
    }
  };

  // Active city for nearby places
  const currentNearbyCity =
    activeTab === 'nearby'
      ? selectedCityForNearby || source || 'Jaipur'
      : destination || source || 'Jaipur';

  const nearbyCityNode = CITY_NODES[currentNearbyCity];

  // Filter nearby places for map pins
  const visiblePlaces = nearbyPlaces.filter((place) => {
    if (selectedCategory === 'all') return true;
    return place.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div
      ref={containerRef}
      id="map-canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      className={`relative h-full w-full select-none overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-[#0b1120]' : 'bg-[#f4f7fb]'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Dynamic Animated Map Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(100, 116, 139, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          transform: `translate(${pan.x % 40}px, ${pan.y % 40}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      />

      {/* SVG Map Canvas with Pan & Zoom Transform */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 740"
          className="h-full w-full min-h-[640px] min-w-[850px] max-w-none overflow-visible"
        >
          <defs>
            {/* Shortest Route Gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Glowing filter for highlighted route */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Pulsing ring filter */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. TERRAIN LAYER: Districts & Regional Polygons */}
          <g className="terrain-layer">
            {MAP_TERRAIN.districts.map((district) => (
              <path
                key={district.id}
                d={district.path}
                fill={
                  darkMode
                    ? district.type === 'highlands'
                      ? 'rgba(30, 41, 59, 0.45)'
                      : district.type === 'plains'
                      ? 'rgba(15, 23, 42, 0.35)'
                      : 'rgba(30, 27, 75, 0.25)'
                    : district.type === 'highlands'
                    ? 'rgba(241, 245, 249, 0.85)'
                    : district.type === 'plains'
                    ? 'rgba(238, 242, 246, 0.8)'
                    : 'rgba(254, 249, 195, 0.3)'
                }
                stroke={darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.5)'}
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            ))}
          </g>

          {/* 2. NATURE PARKS & RESERVES */}
          <g className="parks-layer">
            {MAP_TERRAIN.parks.map((park) => (
              <g key={park.id} transform={`rotate(${park.rotation} ${park.cx} ${park.cy})`}>
                <ellipse
                  cx={park.cx}
                  cy={park.cy}
                  rx={park.rx}
                  ry={park.ry}
                  fill={darkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(34, 197, 94, 0.12)'}
                  stroke={darkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(34, 197, 94, 0.35)'}
                  strokeWidth="1.2"
                />
                <text
                  x={park.cx}
                  y={park.cy + 3}
                  textAnchor="middle"
                  className={`text-[9px] font-medium tracking-wide ${
                    darkMode ? 'fill-emerald-400/60' : 'fill-emerald-800/60'
                  }`}
                >
                  {park.name}
                </text>
              </g>
            ))}
          </g>

          {/* 3. RIVER CHANNELS */}
          <g className="rivers-layer">
            {MAP_TERRAIN.rivers.map((river) => (
              <path
                key={river.id}
                d={river.path}
                fill="none"
                stroke={darkMode ? 'rgba(56, 189, 248, 0.25)' : 'rgba(14, 165, 233, 0.35)'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* 4. DISTRICT & REGIONAL LABELS */}
          <g className="labels-layer pointer-events-none">
            {MAP_TERRAIN.neighborhoods.map((n, idx) => (
              <text
                key={idx}
                x={n.x}
                y={n.y}
                textAnchor="middle"
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  darkMode ? 'fill-slate-600/60' : 'fill-slate-400/70'
                }`}
              >
                {n.name}
              </text>
            ))}
          </g>

          {/* 5. BASE ROADS & HIGHWAYS */}
          <g className="roads-layer">
            {ROADS.map((road) => {
              const start = CITY_NODES[road.from];
              const end = CITY_NODES[road.to];
              if (!start || !end) return null;

              const isHighlighted = isRoadInActivePath(road.from, road.to);
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              return (
                <g key={`${road.from}-${road.to}`} className="road-segment">
                  {/* Road Casing Outer Track */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={
                      darkMode
                        ? isHighlighted
                          ? 'rgba(6, 182, 212, 0.3)'
                          : 'rgba(30, 41, 59, 0.8)'
                        : isHighlighted
                        ? 'rgba(14, 165, 233, 0.3)'
                        : 'rgba(226, 232, 240, 0.9)'
                    }
                    strokeWidth={isHighlighted ? 9 : 5}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Road Center Stripe */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={
                      darkMode
                        ? isHighlighted
                          ? '#06b6d4'
                          : activeRoute
                          ? 'rgba(51, 65, 85, 0.4)'
                          : 'rgba(71, 85, 105, 0.65)'
                        : isHighlighted
                        ? '#0284c7'
                        : activeRoute
                        ? 'rgba(203, 213, 225, 0.6)'
                        : 'rgba(148, 163, 184, 0.75)'
                    }
                    strokeWidth={isHighlighted ? 4 : 2}
                    strokeLinecap="round"
                    strokeDasharray={isHighlighted ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />

                  {/* Glowing Animated Shortest Route Stroke */}
                  {isHighlighted && (
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="url(#routeGradient)"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeDasharray="8 6"
                      filter="url(#routeGlow)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Distance Badge at Midpoint */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-default pointer-events-auto"
                  >
                    <rect
                      x="-24"
                      y="-11"
                      width="48"
                      height="22"
                      rx="11"
                      fill={
                        isHighlighted
                          ? darkMode
                            ? '#0369a1'
                            : '#0284c7'
                          : darkMode
                          ? 'rgba(15, 23, 42, 0.85)'
                          : 'rgba(255, 255, 255, 0.95)'
                      }
                      stroke={
                        isHighlighted
                          ? '#38bdf8'
                          : darkMode
                          ? 'rgba(71, 85, 105, 0.5)'
                          : 'rgba(203, 213, 225, 0.9)'
                      }
                      strokeWidth={isHighlighted ? '1.5' : '1'}
                      className="transition-all duration-300 shadow-sm"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      className={`text-[9.5px] font-bold ${
                        isHighlighted
                          ? 'fill-white'
                          : darkMode
                          ? 'fill-slate-300'
                          : 'fill-slate-700'
                      }`}
                    >
                      {road.distance} km
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 6. NEARBY PLACES RADIUS CIRCLE (When nearby mode active) */}
          {activeTab === 'nearby' && nearbyCityNode && (
            <g className="nearby-aura">
              <circle
                cx={nearbyCityNode.x}
                cy={nearbyCityNode.y}
                r="68"
                fill={darkMode ? 'rgba(56, 189, 248, 0.04)' : 'rgba(14, 165, 233, 0.05)'}
                stroke={darkMode ? 'rgba(56, 189, 248, 0.3)' : 'rgba(14, 165, 233, 0.3)'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <circle
                cx={nearbyCityNode.x}
                cy={nearbyCityNode.y}
                r="45"
                fill="none"
                stroke={darkMode ? 'rgba(125, 211, 252, 0.2)' : 'rgba(56, 189, 248, 0.2)'}
                strokeWidth="1"
              />
            </g>
          )}

          {/* 7. NEARBY PLACES MARKERS ON MAP */}
          {activeTab === 'nearby' && nearbyCityNode && (
            <g className="nearby-markers">
              {visiblePlaces.map((place) => {
                const posX = nearbyCityNode.x + place.dx * 1.5;
                const posY = nearbyCityNode.y + place.dy * 1.5;
                const isSelected = selectedPlacePopup?.id === place.id;
                const isHovered = hoveredPlace?.id === place.id;

                // Color accent based on category
                let pinColor = '#3b82f6';
                if (place.category === 'Hospital') pinColor = '#ef4444';
                else if (place.category === 'Restaurant') pinColor = '#f59e0b';
                else if (place.category === 'Petrol Pump') pinColor = '#f97316';
                else if (place.category === 'Hotel') pinColor = '#6366f1';
                else if (place.category === 'College') pinColor = '#2563eb';
                else if (place.category === 'Shopping') pinColor = '#a855f7';
                else if (place.category === 'Tourist Place') pinColor = '#10b981';
                else if (place.category === 'Parking') pinColor = '#14b8a6';

                return (
                  <g
                    key={place.id}
                    transform={`translate(${posX}, ${posY})`}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlacePopup(place);
                    }}
                    onMouseEnter={() => setHoveredPlace(place)}
                    onMouseLeave={() => setHoveredPlace(null)}
                  >
                    {/* Pulsing halo on select or hover */}
                    {(isSelected || isHovered) && (
                      <circle
                        r="18"
                        fill="none"
                        stroke={pinColor}
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Pin Background Circle */}
                    <circle
                      r={isSelected || isHovered ? 14 : 11}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-md transition-all duration-200"
                    />

                    {/* Category Initial / Marker */}
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      className="text-[9px] font-black pointer-events-none"
                    >
                      {place.category === 'Hospital'
                        ? 'H'
                        : place.category === 'Restaurant'
                        ? 'R'
                        : place.category === 'Petrol Pump'
                        ? 'P'
                        : place.category === 'Hotel'
                        ? 'H'
                        : place.category === 'College'
                        ? 'C'
                        : place.category === 'Shopping'
                        ? 'S'
                        : place.category === 'Tourist Place'
                        ? 'T'
                        : 'P'}
                    </text>

                    {/* Small distance badge */}
                    <rect
                      x="-20"
                      y="14"
                      width="40"
                      height="14"
                      rx="7"
                      fill={darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'}
                      stroke={pinColor}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      className={`text-[8px] font-bold ${
                        darkMode ? 'fill-slate-200' : 'fill-slate-800'
                      }`}
                    >
                      {place.formattedDistance.replace(' away', '')}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 8. MAIN GRAPH LOCATION NODES (10 Cities) */}
          <g className="city-nodes-layer">
            {Object.entries(CITY_NODES).map(([cityName, node]) => {
              const isSource = source === cityName;
              const isDestination = destination === cityName;
              const isOnRoute = activePathSet.has(cityName);
              const isHovered = hoveredNode === cityName;

              // Visual styling hierarchy
              let nodeBg = darkMode ? '#1e293b' : '#ffffff';
              let strokeColor = darkMode ? '#475569' : '#cbd5e1';
              let badgeColor = 'bg-slate-700';
              let pulseColor = 'rgba(148, 163, 184, 0.2)';
              let radius = 22;

              if (isSource) {
                nodeBg = '#10b981'; // Emerald Start
                strokeColor = '#34d399';
                badgeColor = 'bg-emerald-600';
                pulseColor = 'rgba(16, 185, 129, 0.4)';
                radius = 26;
              } else if (isDestination) {
                nodeBg = '#8b5cf6'; // Violet Destination
                strokeColor = '#a78bfa';
                badgeColor = 'bg-violet-600';
                pulseColor = 'rgba(139, 92, 246, 0.4)';
                radius = 26;
              } else if (isOnRoute) {
                nodeBg = '#0ea5e9'; // Cyan intermediate
                strokeColor = '#38bdf8';
                badgeColor = 'bg-sky-600';
                pulseColor = 'rgba(14, 165, 233, 0.3)';
                radius = 23;
              } else if (isHovered) {
                strokeColor = '#38bdf8';
                radius = 24;
              }

              return (
                <g
                  key={cityName}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCity(cityName);
                  }}
                  onMouseEnter={() => setHoveredNode(cityName)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer Radar Pulse Ring for Start & Destination */}
                  {(isSource || isDestination) && (
                    <circle
                      r={radius + 14}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity="0.7"
                      className="animate-ping"
                    />
                  )}

                  {/* Soft Aura Shadow */}
                  <circle
                    r={radius + 4}
                    fill={pulseColor}
                    className="transition-all duration-300"
                  />

                  {/* Main Node Disc */}
                  <circle
                    r={radius}
                    fill={nodeBg}
                    stroke={strokeColor}
                    strokeWidth={isSource || isDestination || isOnRoute ? 3 : 2}
                    className="shadow-xl transition-all duration-300"
                  />

                  {/* Icon or Monogram */}
                  {isSource ? (
                    <g transform="translate(-8, -8)">
                      <Navigation2 className="h-4 w-4 fill-white text-white rotate-45" />
                    </g>
                  ) : isDestination ? (
                    <g transform="translate(-8, -8)">
                      <MapPin className="h-4 w-4 fill-white text-white" />
                    </g>
                  ) : (
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      className={`text-[10px] font-black tracking-wider ${
                        isOnRoute
                          ? 'fill-white'
                          : darkMode
                          ? 'fill-slate-200'
                          : 'fill-slate-800'
                      }`}
                    >
                      {node.code}
                    </text>
                  )}

                  {/* Role Tag: "A - Start" or "B - Destination" */}
                  {isSource && (
                    <g transform="translate(0, -38)">
                      <rect
                        x="-30"
                        y="-10"
                        width="60"
                        height="20"
                        rx="10"
                        fill="#059669"
                        stroke="#a7f3d0"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="text-[9.5px] font-extrabold uppercase tracking-wide"
                      >
                        A • Start
                      </text>
                    </g>
                  )}

                  {isDestination && (
                    <g transform="translate(0, -38)">
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="20"
                        rx="10"
                        fill="#7c3aed"
                        stroke="#ddd6fe"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="text-[9.5px] font-extrabold uppercase tracking-wide"
                      >
                        B • Destination
                      </text>
                    </g>
                  )}

                  {/* City Label Below Node */}
                  <g transform={`translate(0, ${radius + 14})`}>
                    <rect
                      x={-(cityName.length * 4.5 + 14)}
                      y="-9"
                      width={cityName.length * 9 + 28}
                      height="18"
                      rx="9"
                      fill={
                        isSource || isDestination || isOnRoute
                          ? darkMode
                            ? '#0f172a'
                            : '#ffffff'
                          : darkMode
                          ? 'rgba(15, 23, 42, 0.85)'
                          : 'rgba(255, 255, 255, 0.9)'
                      }
                      stroke={
                        isSource
                          ? '#10b981'
                          : isDestination
                          ? '#8b5cf6'
                          : isOnRoute
                          ? '#0ea5e9'
                          : darkMode
                          ? 'rgba(51, 65, 85, 0.7)'
                          : 'rgba(203, 213, 225, 0.8)'
                      }
                      strokeWidth={isSource || isDestination || isOnRoute ? 1.5 : 1}
                      className="shadow-sm transition-all duration-300"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      className={`text-[11px] font-bold tracking-tight ${
                        isSource
                          ? 'fill-emerald-500'
                          : isDestination
                          ? 'fill-violet-500'
                          : isOnRoute
                          ? 'fill-sky-500'
                          : darkMode
                          ? 'fill-slate-200'
                          : 'fill-slate-800'
                      }`}
                    >
                      {cityName}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Interactive Popup for Selected Nearby Place on Map */}
      {selectedPlacePopup && (
        <div
          className="absolute z-20 w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{
            left: '50%',
            top: '25%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <CategoryIcon category={selectedPlacePopup.category} className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedPlacePopup.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedPlacePopup.category} • {selectedPlacePopup.city}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlacePopup(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-3.5 w-3.5" />
              {selectedPlacePopup.formattedDistance}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              ★ {selectedPlacePopup.rating} rating
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onNavigateToPlace(selectedPlacePopup);
              setSelectedPlacePopup(null);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-600 hover:to-indigo-700"
          >
            <Navigation className="h-3.5 w-3.5" />
            Navigate to this place
          </button>
        </div>
      )}

      {/* Map Compass Indicator (Bottom Right) */}
      <div className="pointer-events-none absolute bottom-6 right-20 hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-sm sm:flex dark:border-slate-800 dark:bg-slate-900/70">
        <Compass className="h-4 w-4 text-sky-500 animate-spin-slow" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          N 35° Regional Grid
        </span>
      </div>
    </div>
  );
}
