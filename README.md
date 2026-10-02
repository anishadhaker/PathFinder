# PathFinder — Smart Shortest Path & Nearby Places Navigation System

[![C++11](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg)](https://leafletjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Open--Source-green.svg)](#)

A modern, full-stack map navigation and algorithm visualization platform designed for B.Tech Computer Science and Engineering curriculum. PathFinder demonstrates theoretical graph shortest-path computation alongside production-grade, real-world open-source mapping services.

---

## 1. Project Overview

PathFinder bridges theoretical Data Structures & Algorithms (DSA) with modern web engineering. It allows users to compute shortest routes across weighted graph networks while also providing a complete, real-world navigation experience without depending on proprietary paid APIs.

The system combines:
- **Shortest-Path Graph Algorithms**: Dijkstra's algorithm implemented in modern C++11 and interactive JavaScript.
- **Real-World Interactive Mapping**: Dynamic pan, zoom, custom map layers, and SVG pin markers via Leaflet & OpenStreetMap.
- **Continuous Live GPS Geolocation**: Device GPS tracking with movement-aware route updates.
- **Global Address & Place Search**: Full autocomplete powered by OpenStreetMap Nominatim.
- **Nearby Places Discovery**: Point-of-Interest (POI) detection across 8 vital amenities using the Overpass API.
- **Turn-by-Turn Road Routing**: Real road routing, distance calculation, speed-adjusted multi-modal ETAs, and turn maneuver itineraries via the Open Source Routing Machine (OSRM).

---

## 2. Main Features

- **Real-World Road Routing**: Street-accurate navigation across global road networks using OSRM.
- **Dual Mode Navigation**:
  1. *Real-World Mode*: OpenStreetMap, Nominatim search, OSRM routing, and live Overpass POIs.
  2. *Academic Dijkstra Mode*: Interactive SVG canvas visualizing 10 regional cities and 16 weighted highway corridors.
- **Continuous Live GPS Tracking**: Browser `navigator.geolocation.watchPosition()` with accuracy circles and automatic rerouting after significant device movement (30–50 meter threshold).
- **Address & Landmark Autocomplete**: Debounced, cached search for cities, universities, hospitals, restaurants, and addresses.
- **Multi-Modal Travel Support**: Driving, Walking (5 km/h speed adjustment), and Cycling (15 km/h speed adjustment) with realistic ETAs.
- **Nearby Places Discovery (8 POI Categories)**:
  - Hospitals & Clinics
  - Restaurants & Cafes
  - Petrol Pumps & Fuel Stations
  - Hotels & Lodging
  - Colleges & Universities
  - Shopping Malls & Supermarkets
  - Tourist Attractions & Heritage Sites
  - Parking Facilities
- **Turn-by-Turn Route Itinerary**: Step-by-step maneuver instructions (`turn left`, `rotary`, `arrive`) with exact segment distances.
- **Modern UI/UX**: Dark mode and light mode support, responsive layout, glassmorphic cards, and custom markers.

---

## 3. System Architecture

```
                       +---------------------------------------+
                       |          Web Browser Client           |
                       +---------------------------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |        React + Vite Frontend          |
                       |       (Tailwind CSS + Leaflet)        |
                       +---------------------------------------+
                               /           |           \
                              /            |            \
                             v             v             v
       +-----------------------+  +------------------+  +-------------------------+
       |   Nominatim Search    |  |   OSRM Engine    |  |      Overpass API       |
       |  (OSM Geocoding API)  |  |  (Road Routing)  |  |  (Nearby POI Discovery) |
       +-----------------------+  +------------------+  +-------------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |         Academic Demonstration        |
                       |  - C++11 Terminal Dijkstra (main.exe) |
                       |  - Client-side JS Dijkstra Visualizer |
                       +---------------------------------------+
```

### Clarification on Routing vs Academic Algorithm
> **Important Note:**  
> **C++ Dijkstra is an academic demonstration and is NOT the engine calculating real-world GPS routes.**  
> Real-world navigation uses **OSRM (Open Source Routing Machine)**, which preprocesses OpenStreetMap road networks using **Contraction Hierarchies (CH)** to compute real street routes across continental road graphs in sub-millisecond times. The C++ implementation demonstrates pure graph theory and Dijkstra's algorithm for academic examination and viva presentation.

---

## 4. Dijkstra's Algorithm Explanation

Dijkstra's Algorithm solves the **Single-Source Shortest Path (SSSP)** problem on a directed or undirected graph with non-negative edge weights $G = (V, E)$.

### Core Principles
1. **Distance Table**: Maintains the minimum known distance from the starting node to every other node in the graph. Initially, `dist[source] = 0` and all other vertices are set to $\infty$.
2. **Min-Priority Queue**: Extracts the unvisited vertex $u$ with the minimum tentative distance.
3. **Edge Relaxation**: For every adjacent neighbor $v$ connected by road $(u, v)$ with weight $w$:
   $$\text{if } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \text{dist}[v] = \text{dist}[u] + w(u, v), \quad \text{prev}[v] = u$$
4. **Path Reconstruction**: Once the destination node is reached, the optimal sequence of cities is backtracked using the predecessor map (`prev`).

### Complexity Analysis
- **Time Complexity**: $\mathcal{O}((V + E) \log V)$ using a binary min-heap / `std::priority_queue`.
- **Space Complexity**: $\mathcal{O}(V + E)$ to store the adjacency list and predecessor pointers.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Academic Backend** | C++11 (MinGW / GCC) | Standalone Dijkstra CLI implementation (`Graph.h`, `Graph.cpp`, `main.cpp`) |
| **Frontend Framework** | React 18 & Vite | Reactive component architecture and fast development build tooling |
| **Styling** | Tailwind CSS | Responsive, modern glassmorphic interface with dark/light themes |
| **Interactive Map** | Leaflet & React Leaflet | Open-source map rendering, SVG pin markers, and polyline route display |
| **Map Tiles** | OpenStreetMap Carto | Free community tile server |
| **Geocoding & Search** | OpenStreetMap Nominatim | Address autocomplete and reverse geocoding |
| **Road Routing** | OSRM Public Routing API | Real-world road routing and turn maneuvers |
| **Nearby Places** | Overpass API (OSM QL) | Live query of hospitals, fuel, colleges, food, etc. |
| **Device Location** | Browser Geolocation API | Continuous tracking with `watchPosition()` and `clearWatch()` |

---

## 6. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later) & npm
- [GCC / MinGW](https://www.mingw-w64.org/) (for compiling C++ code)

### Running the React Frontend (Windows PowerShell)

```powershell
# Navigate into the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm.cmd run dev
```

Open `http://localhost:5173` in your web browser.

To produce an optimized production build:
```powershell
npm.cmd run build
```

### Compiling and Running the C++ Implementation

```powershell
# In the project root directory
g++ -std=c++11 main.cpp Graph.cpp -o main.exe

# Execute the terminal program
.\main.exe
```

---

## 7. Step-by-Step Usage Guide

1. **Launch the Application**: Open PathFinder in your browser.
2. **Select Starting Location**:
   - Type an address, landmark, or university into the **Starting Point** input field.
   - Alternatively, click **Use My GPS** to activate continuous live device tracking.
3. **Select Destination**: Enter a destination city, college, hospital, or address.
4. **Choose Travel Mode**: Toggle between **Driving**, **Walking**, or **Cycling**.
5. **Compute Route**: Click **Find Shortest Route**.
6. **Analyze Route**: Inspect total distance in kilometers, estimated travel time, and route summary.
7. **View Turn-by-Turn Directions**: Click **View Route Itinerary** for detailed maneuvers and algorithm analytics.
8. **Explore Nearby Amenities**: Switch to the **Nearby Places** tab to view hospitals, restaurants, fuel pumps, and hotels around your location. Click **Navigate Here** on any place to plan a route.
9. **Academic Demonstration Mode**: Switch to **Dijkstra Demonstration** in the top navigation bar to explore the 10-city academic network and step through relaxation logs.

---

## 8. Academic Dijkstra Verification Example

The synchronized academic network contains 10 regional nodes and 16 bidirectional weighted highways, forming a realistic, sparse, and fully connected road network where neighboring cities have direct connections:

```
                     [Delhi] -------- 230 km -------- [Agra]
                    /   |   \                        /   |
             245 km/ 280 km  \450 km           240 km/   |
                  /     |     \                     /    |
        [Chandigarh] [Jaipur]  [Bikaner]           /     | 380 km
            |          / | \       |              /      | (configurable)
          225 km 135 km/ |  \330 km|250 km       /       |
            |        /   |   \     |            /        |
        [Amritsar] [Ajmer]    \ [Jodhpur]      /         |
                    | | \ \    \   |          /          |
              260 km| |  \ \210 km/|250 km   /           |
                    | |205 km \   /|        /            |
                    | |   |    \ / |       /             |
                    +-- [Kota] -+--+------+              |
                      \   |    /                         |
                       \ 290 km                          |
                        \ |  /                           |
                        [Udaipur] -----------------------+
```

### Complete Network Connections (16 Bidirectional Roads):
1. **Delhi ↔ Jaipur**: 280 km (NH-48 Golden Quadrilateral)
2. **Delhi ↔ Agra**: 230 km (Yamuna Expressway / NH-19)
3. **Delhi ↔ Chandigarh**: 245 km (NH-44 Grand Trunk Corridor)
4. **Delhi ↔ Bikaner**: 450 km (NH-11 Desert Arterial)
5. **Jaipur ↔ Ajmer**: 135 km (NH-48 Jaipur-Ajmer Expressway)
6. **Jaipur ↔ Kota**: 250 km (NH-52 Chambal Link)
7. **Jaipur ↔ Jodhpur**: 330 km (NH-25 Marwar Transit)
8. **Ajmer ↔ Udaipur**: 260 km (NH-58 Mewar Express)
9. **Ajmer ↔ Jodhpur**: 210 km (NH-25 Ajmer-Pali Spur)
10. **Kota ↔ Udaipur**: 290 km (NH-27 East-West Arterial)
11. **Jodhpur ↔ Udaipur**: 250 km (NH-62 Ranakpur Corridor)
12. **Jodhpur ↔ Bikaner**: 250 km (NH-62 Desert Highway)
13. **Chandigarh ↔ Amritsar**: 225 km (NH-3 GT North Spur)
14. **Agra ↔ Kota**: 380 km (NH-23 / NH-552 Chambal Link — *Configurable*)
15. **Agra ↔ Jaipur**: 240 km (NH-21 Golden Triangle Highway — *Configurable*)
16. **Ajmer ↔ Kota**: 205 km (NH-148D Hadoti-Aravalli Link — *Configurable*)

### Where to Configure Road Distances:

The highway edge weights are fully configurable across both C++ and frontend codebases:

- **C++ Backend**:
  - **In `Graph.h`**, edit the default constants:
    ```cpp
    const int DEFAULT_AGRA_KOTA_DISTANCE_KM = 380;
    const int DEFAULT_AGRA_JAIPUR_DISTANCE_KM = 240;
    const int DEFAULT_AJMER_KOTA_DISTANCE_KM = 205;
    ```
  - **At Network Load Time**: Pass custom distances:
    ```cpp
    graph.loadSampleCityNetwork(agraKotaKm, agraJaipurKm, ajmerKotaKm);
    ```
  - **At Runtime**: Modify any road dynamically:
    ```cpp
    graph.setRoadDistance("Agra", "Kota", customKm);
    graph.setRoadDistance("Agra", "Jaipur", customKm);
    graph.setRoadDistance("Ajmer", "Kota", customKm);
    ```
- **Frontend Web Visualizer**:
  - **In `frontend/src/data/graphData.js`**:
    ```javascript
    export const AGRA_KOTA_DISTANCE_KM = 380;
    export const AGRA_JAIPUR_DISTANCE_KM = 240;
    export const AJMER_KOTA_DISTANCE_KM = 205;
    ```
  - **In `frontend/src/data/cities.js`**:
    ```javascript
    export const AGRA_KOTA_DISTANCE_KM = 380;
    export const AGRA_JAIPUR_DISTANCE_KM = 240;
    export const AJMER_KOTA_DISTANCE_KM = 205;
    ```

### Verified Test Cases:

1. **Delhi → Kota**:
   - Shortest Path: `Delhi → Jaipur → Kota` = 280 + 250 = **530 km**
   - Alternative Path evaluated: `Delhi → Agra → Kota` = 230 + 380 = 610 km
   - Alternative Path evaluated: `Delhi → Jaipur → Ajmer → Kota` = 280 + 135 + 205 = 620 km

2. **Agra → Kota**:
   - Shortest Path: `Agra → Kota` = **380 km** (Direct bidirectional connection)
   - Alternative Path evaluated: `Agra → Jaipur → Kota` = 240 + 250 = 490 km

3. **Jaipur → Udaipur**:
   - Shortest Path: `Jaipur → Ajmer → Udaipur` = 135 + 260 = **395 km** (Preserved original shortest route)
   - Alternative Path evaluated: `Jaipur → Kota → Udaipur` = 250 + 290 = 540 km

4. **Chandigarh → Udaipur**:
   - Shortest Path: `Chandigarh → Delhi → Jaipur → Ajmer → Udaipur` = 245 + 280 + 135 + 260 = **920 km**
   - Alternative Path evaluated: `Chandigarh → Delhi → Jaipur → Kota → Udaipur` = 245 + 280 + 250 + 290 = 1065 km

5. **Mutual Reachability**:
   - Verified 100% connectivity ($90/90$ directed city pairs) in both C++ and JavaScript.


---

## 9. Google API Independence

This project is **100% free and open-source**. It does **NOT** require:
- ❌ Google Maps JavaScript API
- ❌ Google Cloud Console project
- ❌ Google Maps API keys
- ❌ Billing accounts or credit cards
- ❌ Any proprietary paid services

All mapping, geocoding, and routing functions operate entirely on open-source community infrastructure (OpenStreetMap, Leaflet, Nominatim, OSRM, Overpass).

---

## 10. Limitations

1. **Public API Rate Limits**: Public demo endpoints (OSRM, Nominatim, Overpass) enforce fair-use usage limits. In client-side production deployments, high-volume automated queries should be routed through dedicated self-hosted instances.
2. **OSRM Public Server Profiles**: The public `router.project-osrm.org` server runs the car routing profile backend. PathFinder applies realistic client-side speed adjustments (5 km/h for walking, 15 km/h for cycling) to compute practical ETAs.
3. **Browser GPS Hardware**: Location accuracy depends on the user's client hardware (GPS chip, Wi-Fi triangulation, or ISP IP geolocation) and browser permissions.

---

## 11. Future Scope

- **Real-Time Traffic Integration**: Integrate real-time traffic flow layers via open traffic feeds.
- **Voice Navigation**: Turn-by-turn spoken speech synthesis using the Web Speech API.
- **Offline Map Tile Caching**: Service Worker and IndexedDB tile caching for offline navigation.
- **Public Transit Multimodal Routing**: Integration with General Transit Feed Specification (GTFS) data for bus and metro routes.
- **Elevation Profiling**: Mountain and terrain grade calculation for cycling and hiking paths.
