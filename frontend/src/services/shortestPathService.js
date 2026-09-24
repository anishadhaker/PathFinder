import { CITIES, ROADS } from '../data/graphData.js';

// Build Adjacency List from weighted roads
export const buildGraph = () => {
  const graph = new Map();

  CITIES.forEach((city) => graph.set(city, []));

  ROADS.forEach(({ from, to, distance, routeName }) => {
    if (graph.has(from) && graph.has(to)) {
      graph.get(from).push({ node: to, distance, routeName });
      graph.get(to).push({ node: from, distance, routeName });
    }
  });

  return graph;
};

// Calculate realistic travel time based on highway average speed (approx 65-75 km/h)
export const calculateTravelTime = (distanceKm) => {
  const avgSpeedKmH = 70;
  const totalMinutes = Math.max(20, Math.round((distanceKm / avgSpeedKmH) * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;
  return `${hours}h ${minutes}m`;
};

// Pure Dijkstra's Algorithm Implementation with Step Tracking
export const runDijkstra = (source, destination) => {
  if (!source || !destination) {
    throw new Error('Please select both a starting location and destination.');
  }

  if (source === destination) {
    throw new Error('Starting location and destination cannot be identical.');
  }

  const graph = buildGraph();

  if (!graph.has(source) || !graph.has(destination)) {
    throw new Error('Selected location is not part of the active road network.');
  }

  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const executionLog = [];

  // Step 1: Initialization
  CITIES.forEach((city) => distances.set(city, Infinity));
  distances.set(source, 0);

  executionLog.push({
    stage: 'init',
    title: 'Initialize Source Distance',
    description: `Set distance to source ${source} = 0 km, all other ${CITIES.length - 1} network nodes = ∞.`,
    activeNode: source,
  });

  // Priority queue simulated with array
  const pq = [{ node: source, distance: 0 }];

  while (pq.length > 0) {
    // Extract node with minimum tentative distance
    pq.sort((a, b) => a.distance - b.distance);
    const { node: current, distance: currentDist } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    executionLog.push({
      stage: 'select_min',
      title: `Select Minimum Node: ${current}`,
      description: `Popped node "${current}" with smallest tentative distance (${currentDist} km) from priority queue.`,
      activeNode: current,
    });

    if (current === destination) {
      executionLog.push({
        stage: 'reached_dest',
        title: `Destination ${destination} Reached`,
        description: `Optimal shortest path to destination found at distance ${currentDist} km.`,
        activeNode: destination,
      });
      break;
    }

    const neighbors = graph.get(current) || [];
    let relaxedAny = false;

    neighbors.forEach(({ node: neighbor, distance: weight }) => {
      if (!visited.has(neighbor)) {
        const tentativeDist = currentDist + weight;
        const currentKnownDist = distances.get(neighbor);

        if (tentativeDist < currentKnownDist) {
          distances.set(neighbor, tentativeDist);
          previous.set(neighbor, { prevNode: current, roadDist: weight });
          pq.push({ node: neighbor, distance: tentativeDist });
          relaxedAny = true;

          executionLog.push({
            stage: 'relax',
            title: `Relax Edge: ${current} → ${neighbor}`,
            description: `Updated shorter path: ${currentDist} + ${weight} km = ${tentativeDist} km (was ${
              currentKnownDist === Infinity ? '∞' : currentKnownDist + ' km'
            }).`,
            activeNode: neighbor,
          });
        }
      }
    });

    if (!relaxedAny && neighbors.length > 0) {
      executionLog.push({
        stage: 'explored',
        title: `Explored Connected Roads from ${current}`,
        description: `All adjacent edges checked; existing paths remain shorter or equal.`,
        activeNode: current,
      });
    }
  }

  const finalDist = distances.get(destination);
  if (finalDist === Infinity) {
    throw new Error(`No connected path found between ${source} and ${destination}.`);
  }

  // Backtrack path reconstruction
  const path = [];
  const segments = [];
  let curr = destination;

  while (curr) {
    path.unshift(curr);
    const prevInfo = previous.get(curr);
    if (prevInfo) {
      // Find road details
      const roadDef = ROADS.find(
        (r) =>
          (r.from === prevInfo.prevNode && r.to === curr) ||
          (r.to === prevInfo.prevNode && r.from === curr)
      );

      segments.unshift({
        from: prevInfo.prevNode,
        to: curr,
        distance: prevInfo.roadDist,
        routeName: roadDef ? roadDef.routeName : 'National Highway Corridor',
      });
      curr = prevInfo.prevNode;
    } else {
      curr = null;
    }
  }

  executionLog.push({
    stage: 'reconstruct',
    title: 'Reconstruct Shortest Path',
    description: `Backtracked through predecessor pointers: ${path.join(' → ')}. Total: ${finalDist} km.`,
    activeNode: destination,
  });

  return {
    source,
    destination,
    path,
    distance: finalDist,
    segments,
    stopsCount: path.length,
    travelTime: calculateTravelTime(finalDist),
    algorithm: "Dijkstra's Algorithm",
    complexity: 'O((V + E) log V)',
    executionLog,
  };
};

// Asynchronous wrapper with delay for smooth UI animation & viva demonstration
// Designed for seamless swap to POST /api/shortest-path when C++ backend is running
export const calculateShortestPath = async ({ source, destination }) => {
  // Simulate network round-trip & algorithm run
  await new Promise((resolve) => setTimeout(resolve, 650));
  return runDijkstra(source, destination);
};
