import { cities, networkEdges } from '../data/cities';

const buildGraph = () => {
  const graph = new Map();

  cities.forEach((city) => graph.set(city, []));

  networkEdges.forEach(({ from, to, distance }) => {
    graph.get(from).push({ city: to, distance });
    graph.get(to).push({ city: from, distance });
  });

  return graph;
};

const formatTravelTime = (distance) => {
  const totalMinutes = Math.max(30, Math.round(distance / 1.3));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export const mockShortestPathApi = async ({ source, destination }) => {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!source || !destination) {
    throw new Error('Please select both a starting location and destination.');
  }

  if (source === destination) {
    throw new Error('Source and destination cannot be the same location.');
  }

  const graph = buildGraph();

  if (!graph.has(source) || !graph.has(destination)) {
    throw new Error('Please select valid city locations from the network.');
  }

  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const queue = [{ city: source, distance: 0 }];

  cities.forEach((city) => distances.set(city, Infinity));
  distances.set(source, 0);

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();

    if (visited.has(current.city)) continue;
    visited.add(current.city);

    if (current.city === destination) break;

    const neighbors = graph.get(current.city) || [];

    neighbors.forEach((neighbor) => {
      const newDistance = current.distance + neighbor.distance;

      if (newDistance < distances.get(neighbor.city)) {
        distances.set(neighbor.city, newDistance);
        previous.set(neighbor.city, current.city);
        queue.push({ city: neighbor.city, distance: newDistance });
      }
    });
  }

  if (distances.get(destination) === Infinity) {
    throw new Error('No route available between the selected locations.');
  }

  const path = [];
  let current = destination;

  while (current) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  const totalDistance = distances.get(destination);

  return {
    path,
    distance: totalDistance,
    nodesVisited: path.length,
    travelTime: formatTravelTime(totalDistance),
  };
};
