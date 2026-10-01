import React, { useState, useRef } from 'react';
import { CITY_NODES, ROADS } from '../data/graphData';
import { ZoomIn, ZoomOut, RotateCcw, Check, Sparkles, Navigation } from 'lucide-react';

export default function DijkstraGraphView({
  source,
  destination,
  currentStep = null,
  finalPath = [],
  onSelectNode,
  darkMode = false,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Extract step states
  const visitedSet = new Set(currentStep?.visited || []);
  const currentNode = currentStep?.currentNode || null;
  const activeEdge = currentStep?.activeEdge || null;
  const distances = currentStep?.distances || {};
  const finalPathSet = new Set(finalPath);

  // Check if an edge is in the final shortest path
  const isEdgeInFinalPath = (u, v) => {
    if (!finalPath || finalPath.length < 2) return false;
    for (let i = 0; i < finalPath.length - 1; i++) {
      if (
        (finalPath[i] === u && finalPath[i + 1] === v) ||
        (finalPath[i] === v && finalPath[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  // Check if an edge is currently being checked/relaxed
  const isEdgeActive = (u, v) => {
    if (!activeEdge) return false;
    return (
      (activeEdge.from === u && activeEdge.to === v) ||
      (activeEdge.from === v && activeEdge.to === u)
    );
  };

  // Pan handling
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative h-full w-full select-none overflow-hidden ${
        darkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Background Subtle Coordinate Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(100, 116, 139, 0.15) 1px, transparent 0)',
          backgroundSize: '36px 36px',
          transform: `translate(${pan.x % 36}px, ${pan.y % 36}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      />

      {/* SVG Canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 850 740"
          className="h-full w-full min-h-[600px] min-w-[700px] max-w-none overflow-visible"
        >
          <defs>
            {/* Glowing filter for active road */}
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Glowing filter for final shortest path */}
            <filter id="finalPathGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradient for final shortest route */}
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* 1. EDGES / ROADS */}
          <g id="roads-layer">
            {ROADS.map((road) => {
              const u = CITY_NODES[road.from];
              const v = CITY_NODES[road.to];
              if (!u || !v) return null;

              const inFinalPath = isEdgeInFinalPath(road.from, road.to);
              const isActive = isEdgeActive(road.from, road.to);

              // Calculate midpoint for distance badge
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={`${road.from}-${road.to}`} className="transition-all duration-300">
                  {/* Outer casing line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={
                      inFinalPath
                        ? '#059669'
                        : isActive
                        ? '#f59e0b'
                        : darkMode
                        ? '#334155'
                        : '#cbd5e1'
                    }
                    strokeWidth={inFinalPath ? 8 : isActive ? 6 : 3}
                    strokeLinecap="round"
                    filter={inFinalPath ? 'url(#finalPathGlow)' : isActive ? 'url(#activeGlow)' : undefined}
                    opacity={inFinalPath ? 0.9 : isActive ? 0.95 : 0.7}
                  />

                  {/* Inner road beam */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={
                      inFinalPath
                        ? '#34d399'
                        : isActive
                        ? '#fbbf24'
                        : darkMode
                        ? '#475569'
                        : '#94a3b8'
                    }
                    strokeWidth={inFinalPath ? 4 : isActive ? 3 : 1.5}
                    strokeLinecap="round"
                    strokeDasharray={inFinalPath ? '8,4' : isActive ? '6,3' : 'none'}
                    className={inFinalPath ? 'animate-pulse' : undefined}
                  />

                  {/* Distance pill badge at midpoint */}
                  <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                    <rect
                      x="-28"
                      y="-11"
                      width="56"
                      height="22"
                      rx="11"
                      fill={
                        inFinalPath
                          ? '#059669'
                          : isActive
                          ? '#d97706'
                          : darkMode
                          ? '#1e293b'
                          : '#ffffff'
                      }
                      stroke={
                        inFinalPath
                          ? '#34d399'
                          : isActive
                          ? '#fbbf24'
                          : darkMode
                          ? '#475569'
                          : '#cbd5e1'
                      }
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="800"
                      fill={inFinalPath || isActive ? '#ffffff' : darkMode ? '#e2e8f0' : '#334155'}
                      fontFamily="system-ui, sans-serif"
                    >
                      {road.distance} km
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. NODES / CITIES */}
          <g id="nodes-layer">
            {Object.keys(CITY_NODES).map((cityName) => {
              const node = CITY_NODES[cityName];
              const isSource = cityName === source;
              const isDestination = cityName === destination;
              const isCurrent = cityName === currentNode;
              const isVisited = visitedSet.has(cityName);
              const inFinalPath = finalPathSet.has(cityName);
              const isHovered = hoveredNode === cityName;

              // Tentative distance formatted
              const nodeDist = distances[cityName];
              const distText =
                nodeDist === 0
                  ? '0 km'
                  : nodeDist === Infinity || nodeDist === undefined
                  ? '∞'
                  : `${nodeDist} km`;

              // Colors based on state hierarchy
              let nodeFill = darkMode ? '#1e293b' : '#ffffff';
              let nodeStroke = darkMode ? '#475569' : '#cbd5e1';
              let badgeBg = '#64748b';
              let badgeText = 'UNVISITED';

              if (isSource) {
                nodeFill = '#059669';
                nodeStroke = '#34d399';
                badgeBg = '#10b981';
                badgeText = 'SOURCE';
              } else if (isDestination) {
                nodeFill = '#7c3aed';
                nodeStroke = '#a78bfa';
                badgeBg = '#8b5cf6';
                badgeText = 'DESTINATION';
              } else if (isCurrent) {
                nodeFill = '#d97706';
                nodeStroke = '#fef08a';
                badgeBg = '#f59e0b';
                badgeText = 'CURRENT';
              } else if (inFinalPath) {
                nodeFill = '#0284c7';
                nodeStroke = '#38bdf8';
                badgeBg = '#0ea5e9';
                badgeText = 'PATH';
              } else if (isVisited) {
                nodeFill = darkMode ? '#334155' : '#e2e8f0';
                nodeStroke = darkMode ? '#64748b' : '#94a3b8';
                badgeBg = '#64748b';
                badgeText = 'VISITED';
              }

              return (
                <g
                  key={cityName}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectNode) onSelectNode(cityName);
                  }}
                  onMouseEnter={() => setHoveredNode(cityName)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  {/* Halo ring for Current Node or Final Path */}
                  {(isCurrent || inFinalPath || isSource || isDestination) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCurrent ? 36 : 30}
                      fill={isCurrent ? 'rgba(245, 158, 11, 0.25)' : isSource ? 'rgba(16, 185, 129, 0.25)' : isDestination ? 'rgba(139, 92, 246, 0.25)' : 'rgba(14, 165, 233, 0.2)'}
                      className={isCurrent ? 'animate-ping' : undefined}
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? 26 : 22}
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={isCurrent || isSource || isDestination ? 3.5 : 2}
                    filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                    className="transition-all duration-200"
                  />

                  {/* Center Node Icon / State Emblem */}
                  {isSource ? (
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="900"
                    >
                      A
                    </text>
                  ) : isDestination ? (
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="900"
                    >
                      B
                    </text>
                  ) : isVisited ? (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={darkMode ? '#94a3b8' : '#475569'}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      ✓
                    </text>
                  ) : (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      fill={darkMode ? '#94a3b8' : '#64748b'}
                    />
                  )}

                  {/* Top Badge: Role / Status */}
                  <g transform={`translate(${node.x}, ${node.y - 32})`}>
                    <rect
                      x="-38"
                      y="-9"
                      width="76"
                      height="18"
                      rx="9"
                      fill={badgeBg}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="800"
                      fill="#ffffff"
                      letterSpacing="0.5px"
                    >
                      {badgeText}
                    </text>
                  </g>

                  {/* Bottom Text: City Name & Tentative Distance */}
                  <g transform={`translate(${node.x}, ${node.y + 36})`}>
                    {/* City Name */}
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="800"
                      fill={darkMode ? '#f8fafc' : '#0f172a'}
                      stroke={darkMode ? '#0f172a' : '#f8fafc'}
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {node.name}
                    </text>
                    {/* Tentative Distance */}
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="700"
                      fill={
                        nodeDist === 0
                          ? '#10b981'
                          : nodeDist < Infinity
                          ? '#0284c7'
                          : darkMode
                          ? '#64748b'
                          : '#94a3b8'
                      }
                      stroke={darkMode ? '#0f172a' : '#f8fafc'}
                      strokeWidth="2.5"
                      paintOrder="stroke"
                    >
                      {distText}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Canvas Controls (Bottom Right) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.6))}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Reset View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Visual State Legend (Bottom Left) */}
      <div className="hidden sm:flex absolute bottom-5 left-5 z-20 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 text-[11px] font-bold text-slate-700 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>Source</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-violet-500" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500 animate-ping" style={{ animationDuration: '2s' }} />
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          <span>Shortest Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-400" />
          <span>Visited</span>
        </div>
      </div>
    </div>
  );
}
