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
  if (distanceKm === 0) return '0 min';
  const avgSpeedKmH = 70;
  const totalMinutes = Math.max(15, Math.round((distanceKm / avgSpeedKmH) * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hrs`;
  return `${hours}h ${minutes}m`;
};

// Standard Dijkstra Pseudocode with Line Numbers for UI Highlighting
export const DIJKSTRA_PSEUDOCODE = [
  { line: 1, text: 'dist[source] = 0; dist[all other v] = ∞' },
  { line: 2, text: 'while unvisited nodes exist in Q:' },
  { line: 3, text: '  u = extract_min_unvisited_node(Q)' },
  { line: 4, text: '  if u == destination: break (target reached)' },
  { line: 5, text: '  mark u as visited' },
  { line: 6, text: '  for each unvisited neighbor v of u:' },
  { line: 7, text: '    if dist[u] + weight(u, v) < dist[v]:' },
  { line: 8, text: '      dist[v] = dist[u] + weight(u, v); prev[v] = u' },
];

/**
 * Find all valid simple paths between source and destination using DFS
 * Used to provide authentic alternative routes and comparison proof
 */
export const findAllPaths = (source, destination, maxPaths = 4) => {
  if (!source || !destination) return [];
  if (source === destination) return [{ path: [source], distance: 0 }];

  const graph = buildGraph();
  if (!graph.has(source) || !graph.has(destination)) return [];

  const allPaths = [];

  const dfs = (current, currentPath, totalDist, visited) => {
    if (current === destination) {
      allPaths.push({
        path: [...currentPath],
        distance: totalDist,
      });
      return;
    }

    if (allPaths.length >= 25) return; // Prevent excessive path exploration

    const neighbors = graph.get(current) || [];
    for (const { node: next, distance } of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        dfs(next, [...currentPath, next], totalDist + distance, visited);
        visited.delete(next);
      }
    }
  };

  const visited = new Set([source]);
  dfs(source, [source], 0, visited);

  allPaths.sort((a, b) => a.distance - b.distance);
  return allPaths.slice(0, maxPaths);
};

/**
 * Generate a dynamic, mathematically rigorous explanation of why the calculated path is optimal
 */
export const explainShortestPath = (path, distance, segments, alternativePaths = []) => {
  if (!path || path.length <= 1) {
    return 'Source and destination are identical. The path distance is 0 km with zero road traversals.';
  }

  const segmentEquations = segments
    .map((s) => `${s.from} → ${s.to} (${s.distance} km)`)
    .join(' + ');

  const sumValues = segments.map((s) => s.distance).join(' + ');

  let altComparison = '';
  const realAlternatives = alternativePaths.filter(
    (alt) => alt.path.join(' → ') !== path.join(' → ')
  );

  if (realAlternatives.length > 0) {
    const nextBest = realAlternatives[0];
    const diff = nextBest.distance - distance;
    altComparison = ` Compared to the closest valid alternative route (${nextBest.path.join(
      ' → '
    )} = ${nextBest.distance} km), this route saves ${diff} km.`;
  }

  return `Dijkstra's Algorithm verified that the path [${path.join(
    ' → '
  )}] has the absolute minimum cumulative weight: ${sumValues} = ${distance} km.${altComparison} By systematically relaxing edges via a min-priority queue, no alternative simple path offers a smaller total distance.`;
};

/**
 * Comprehensive Step-by-Step Dijkstra Generator
 * Records full snapshots of distances, predecessors, active edges, and algorithm state at every discrete step.
 */
export const generateDijkstraSteps = (source, destination) => {
  if (!source || !destination) {
    throw new Error('Please select both a starting location and destination.');
  }

  const graph = buildGraph();

  if (!graph.has(source) || !graph.has(destination)) {
    throw new Error('Selected location is not part of the active road network.');
  }

  const steps = [];
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();

  let edgesCheckedCount = 0;
  let relaxationsCount = 0;

  const snapshotDistances = () => {
    const obj = {};
    CITIES.forEach((c) => {
      obj[c] = distances.get(c);
    });
    return obj;
  };

  const snapshotPrevious = () => {
    const obj = {};
    CITIES.forEach((c) => {
      obj[c] = previous.get(c) || null;
    });
    return obj;
  };

  // Case 1: Same source and destination (Requirement 20)
  if (source === destination) {
    CITIES.forEach((city) => distances.set(city, Infinity));
    distances.set(source, 0);

    const initialStep = {
      stepNumber: 1,
      type: 'SAME_SOURCE_DEST',
      currentNode: source,
      currentDist: 0,
      neighborNode: null,
      edgeWeight: null,
      activeEdge: null,
      distances: snapshotDistances(),
      previous: snapshotPrevious(),
      visited: [source],
      priorityQueue: [],
      stepTitle: 'Identical Source and Destination',
      message: `Source and destination are both "${source}". Shortest distance is 0 km.`,
      formula: 'dist[source] = 0 km',
      pseudocodeLine: 1,
      stats: {
        nodesVisited: 1,
        edgesChecked: 0,
        relaxations: 0,
        stepCount: 1,
      },
    };

    steps.push(initialStep);

    const finalResult = {
      source,
      destination,
      path: [source],
      distance: 0,
      segments: [],
      stopsCount: 1,
      travelTime: '0 min',
      algorithm: "Dijkstra's Algorithm",
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V + E)',
      explanation: 'Source and destination are the same. Shortest distance is 0 km.',
      alternativePaths: [{ path: [source], distance: 0 }],
      stats: {
        nodesCount: CITIES.length,
        edgesCount: ROADS.length,
        nodesVisited: 1,
        edgesChecked: 0,
        executionSteps: 1,
        shortestDistance: 0,
      },
    };

    return { steps, finalResult };
  }

  // Step 1: Initialize distances
  CITIES.forEach((city) => distances.set(city, Infinity));
  distances.set(source, 0);

  let stepCounter = 1;

  steps.push({
    stepNumber: stepCounter++,
    type: 'INIT',
    currentNode: source,
    currentDist: 0,
    neighborNode: null,
    edgeWeight: null,
    activeEdge: null,
    distances: snapshotDistances(),
    previous: snapshotPrevious(),
    visited: [],
    priorityQueue: [{ node: source, distance: 0 }],
    stepTitle: `Initialize: Set dist[${source}] = 0`,
    message: `Initialized source node "${source}" to distance 0 km. Set all other ${
      CITIES.length - 1
    } network nodes to ∞.`,
    formula: `dist[${source}] = 0 km, dist[others] = ∞`,
    pseudocodeLine: 1,
    stats: {
      nodesVisited: 0,
      edgesChecked: 0,
      relaxations: 0,
      stepCount: 1,
    },
  });

  const pq = [{ node: source, distance: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.distance - b.distance);
    const { node: current, distance: currentDist } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      stepNumber: stepCounter++,
      type: 'EXTRACT_MIN',
      currentNode: current,
      currentDist,
      neighborNode: null,
      edgeWeight: null,
      activeEdge: null,
      distances: snapshotDistances(),
      previous: snapshotPrevious(),
      visited: Array.from(visited),
      priorityQueue: [...pq],
      stepTitle: `Select Minimum Node: ${current}`,
      message: `Extracted node "${current}" with smallest tentative distance (${currentDist} km) from priority queue. Marked as visited.`,
      formula: `min_node = ${current}, dist = ${currentDist} km`,
      pseudocodeLine: 3,
      stats: {
        nodesVisited: visited.size,
        edgesChecked: edgesCheckedCount,
        relaxations: relaxationsCount,
        stepCount: stepCounter - 1,
      },
    });

    if (current === destination) {
      steps.push({
        stepNumber: stepCounter++,
        type: 'REACHED_DEST',
        currentNode: destination,
        currentDist,
        neighborNode: null,
        edgeWeight: null,
        activeEdge: null,
        distances: snapshotDistances(),
        previous: snapshotPrevious(),
        visited: Array.from(visited),
        priorityQueue: [...pq],
        stepTitle: `Destination ${destination} Reached!`,
        message: `Target destination "${destination}" extracted from priority queue. Optimal shortest distance of ${currentDist} km verified.`,
        formula: `dist[${destination}] = ${currentDist} km (Optimal)`,
        pseudocodeLine: 4,
        stats: {
          nodesVisited: visited.size,
          edgesChecked: edgesCheckedCount,
          relaxations: relaxationsCount,
          stepCount: stepCounter - 1,
        },
      });
      break;
    }

    const neighbors = graph.get(current) || [];

    for (const { node: neighbor, distance: weight } of neighbors) {
      edgesCheckedCount++;

      if (visited.has(neighbor)) {
        continue;
      }

      const tentativeDist = currentDist + weight;
      const currentKnownDist = distances.get(neighbor);

      if (tentativeDist < currentKnownDist) {
        distances.set(neighbor, tentativeDist);
        previous.set(neighbor, current);
        pq.push({ node: neighbor, distance: tentativeDist });
        relaxationsCount++;

        steps.push({
          stepNumber: stepCounter++,
          type: 'RELAX',
          currentNode: current,
          currentDist,
          neighborNode: neighbor,
          edgeWeight: weight,
          activeEdge: { from: current, to: neighbor },
          distances: snapshotDistances(),
          previous: snapshotPrevious(),
          visited: Array.from(visited),
          priorityQueue: [...pq],
          stepTitle: `Relax Edge: ${current} → ${neighbor}`,
          message: `Found shorter path to "${neighbor}": ${currentDist} + ${weight} km = ${tentativeDist} km (was ${
            currentKnownDist === Infinity ? '∞' : currentKnownDist + ' km'
          }). Updated dist and predecessor.`,
          formula: `${currentDist} + ${weight} = ${tentativeDist} km < ${
            currentKnownDist === Infinity ? '∞' : currentKnownDist + ' km'
          }`,
          pseudocodeLine: 8,
          stats: {
            nodesVisited: visited.size,
            edgesChecked: edgesCheckedCount,
            relaxations: relaxationsCount,
            stepCount: stepCounter - 1,
          },
        });
      } else {
        steps.push({
          stepNumber: stepCounter++,
          type: 'NO_RELAX',
          currentNode: current,
          currentDist,
          neighborNode: neighbor,
          edgeWeight: weight,
          activeEdge: { from: current, to: neighbor },
          distances: snapshotDistances(),
          previous: snapshotPrevious(),
          visited: Array.from(visited),
          priorityQueue: [...pq],
          stepTitle: `Check Edge: ${current} → ${neighbor}`,
          message: `Checked edge to "${neighbor}": ${currentDist} + ${weight} km = ${tentativeDist} km is not shorter than existing ${currentKnownDist} km. No update needed.`,
          formula: `${currentDist} + ${weight} = ${tentativeDist} km ≥ ${currentKnownDist} km`,
          pseudocodeLine: 7,
          stats: {
            nodesVisited: visited.size,
            edgesChecked: edgesCheckedCount,
            relaxations: relaxationsCount,
            stepCount: stepCounter - 1,
          },
        });
      }
    }
  }

  const finalDist = distances.get(destination);
  if (finalDist === Infinity) {
    steps.push({
      stepNumber: stepCounter++,
      type: 'NO_PATH',
      currentNode: destination,
      currentDist: Infinity,
      neighborNode: null,
      edgeWeight: null,
      activeEdge: null,
      distances: snapshotDistances(),
      previous: snapshotPrevious(),
      visited: Array.from(visited),
      priorityQueue: [],
      stepTitle: 'No Path Exists',
      message: `No connected route exists between "${source}" and "${destination}".`,
      formula: `dist[${destination}] = ∞`,
      pseudocodeLine: 4,
      stats: {
        nodesVisited: visited.size,
        edgesChecked: edgesCheckedCount,
        relaxations: relaxationsCount,
        stepCount: stepCounter - 1,
      },
    });

    throw new Error(`No path exists between the selected locations.`);
  }

  // Backtrack path reconstruction
  const path = [];
  const segments = [];
  let curr = destination;

  while (curr) {
    path.unshift(curr);
    const prevNode = previous.get(curr);
    if (prevNode) {
      const roadDef = ROADS.find(
        (r) =>
          (r.from === prevNode && r.to === curr) || (r.to === prevNode && r.from === curr)
      );

      const segmentDist = roadDef ? roadDef.distance : distances.get(curr) - distances.get(prevNode);

      segments.unshift({
        from: prevNode,
        to: curr,
        distance: segmentDist,
        routeName: roadDef ? roadDef.routeName : 'National Highway Corridor',
      });
      curr = prevNode;
    } else {
      curr = null;
    }
  }

  steps.push({
    stepNumber: stepCounter++,
    type: 'COMPLETE',
    currentNode: destination,
    currentDist: finalDist,
    neighborNode: null,
    edgeWeight: null,
    activeEdge: null,
    distances: snapshotDistances(),
    previous: snapshotPrevious(),
    visited: Array.from(visited),
    priorityQueue: [],
    stepTitle: 'Shortest Path Reconstructed!',
    message: `Reconstructed optimal path from predecessor pointers: ${path.join(' → ')}. Total: ${finalDist} km.`,
    formula: `Optimal Shortest Distance = ${finalDist} km`,
    pseudocodeLine: 4,
    stats: {
      nodesVisited: visited.size,
      edgesChecked: edgesCheckedCount,
      relaxations: relaxationsCount,
      stepCount: stepCounter - 1,
    },
  });

  const alternativePaths = findAllPaths(source, destination, 5);
  const explanation = explainShortestPath(path, finalDist, segments, alternativePaths);

  const finalResult = {
    source,
    destination,
    path,
    distance: finalDist,
    segments,
    stopsCount: path.length,
    travelTime: calculateTravelTime(finalDist),
    algorithm: "Dijkstra's Algorithm",
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    explanation,
    alternativePaths,
    executionLog: steps.map((s) => ({
      stage: s.type.toLowerCase(),
      title: s.stepTitle,
      description: s.message,
      activeNode: s.currentNode,
      stepNumber: s.stepNumber,
    })),
    stats: {
      nodesCount: CITIES.length,
      edgesCount: ROADS.length,
      nodesVisited: visited.size,
      edgesChecked: edgesCheckedCount,
      executionSteps: steps.length,
      shortestDistance: finalDist,
    },
  };

  return { steps, finalResult };
};

// Pure Dijkstra execution (wrapper using generator)
export const runDijkstra = (source, destination) => {
  const { finalResult } = generateDijkstraSteps(source, destination);
  return finalResult;
};

// Asynchronous wrapper with optional delay for demonstration
export const calculateShortestPath = async ({ source, destination, delayMs = 300 }) => {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return runDijkstra(source, destination);
};
