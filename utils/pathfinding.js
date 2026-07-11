const { calculateHaversineDistance } = require('./haversine');

class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift().element;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Nearest Neighbor heuristic for TSP. Fast, but less optimal.
 */
function nearestNeighborOptimize(locations, distMatrix) {
  let bestGlobalPath = null;
  let bestGlobalCost = Infinity;
  
  for (let startIdx = 0; startIdx < locations.length; startIdx++) {
    const unvisited = new Set(locations.map((_, idx) => idx));
    unvisited.delete(startIdx);
    
    let currentIdx = startIdx;
    let path = [startIdx];
    let cost = 0;
    
    while (unvisited.size > 0) {
      let nearestIdx = -1;
      let minD = Infinity;
      for (let next of unvisited) {
        if (distMatrix[currentIdx][next] < minD) {
          minD = distMatrix[currentIdx][next];
          nearestIdx = next;
        }
      }
      unvisited.delete(nearestIdx);
      path.push(nearestIdx);
      cost += minD;
      currentIdx = nearestIdx;
    }
    
    if (cost < bestGlobalCost) {
      bestGlobalCost = cost;
      bestGlobalPath = path;
    }
  }
  return bestGlobalPath.map(idx => locations[idx]);
}

/**
 * Custom A* Search to find the shortest route visiting all given locations.
 * Solves the Shortest Hamiltonian Path problem over multiple unordered destinations.
 * Falls back to Nearest Neighbor for N > 9 to prevent event loop blocking.
 * 
 * @param {Array} locations Array of location objects with {lat, lng}
 * @returns {Array} Ordered array of locations minimizing travel distance
 */
function optimizeMultiDestinationRoute(locations) {
  if (!locations || locations.length <= 2) return locations;

  // Filter out invalid coords just in case
  const validLocs = locations.filter(l => l && typeof l.lat === 'number' && typeof l.lng === 'number');
  if (validLocs.length <= 2) return validLocs;

  // Precompute distances between all pairs
  const distMatrix = {};
  for (let i = 0; i < validLocs.length; i++) {
    distMatrix[i] = {};
    for (let j = 0; j < validLocs.length; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
      } else {
        distMatrix[i][j] = calculateHaversineDistance(
          validLocs[i].lat, validLocs[i].lng,
          validLocs[j].lat, validLocs[j].lng
        );
      }
    }
  }

  // Fallback for large N to avoid exponential explosion
  if (validLocs.length > 9) {
    return nearestNeighborOptimize(validLocs, distMatrix);
  }

  // Heuristic: nearest unvisited neighbor distance (admissible)
  function heuristic(currentNodeIdx, unvisitedSet) {
    if (unvisitedSet.size === 0) return 0;
    let minD = Infinity;
    for (let next of unvisitedSet) {
      if (distMatrix[currentNodeIdx][next] < minD) {
        minD = distMatrix[currentNodeIdx][next];
      }
    }
    return minD;
  }

  let bestGlobalPath = null;
  let bestGlobalCost = Infinity;

  // Find the shortest path starting at ANY node
  for (let startIdx = 0; startIdx < validLocs.length; startIdx++) {
    const pq = new PriorityQueue();
    
    const initialUnvisited = new Set(validLocs.map((_, idx) => idx));
    initialUnvisited.delete(startIdx);
    
    pq.enqueue({
      currentIdx: startIdx,
      unvisited: initialUnvisited,
      path: [startIdx],
      g: 0
    }, 0);

    let bestCostForStart = Infinity;
    let bestPathForStart = null;

    while (!pq.isEmpty()) {
      const current = pq.dequeue();

      // Goal check
      if (current.unvisited.size === 0) {
        if (current.g < bestCostForStart) {
          bestCostForStart = current.g;
          bestPathForStart = current.path;
        }
        break; // A* guarantees first found is shortest for this start node
      }

      // Expand neighbors
      for (let nextIdx of current.unvisited) {
        const costToNext = distMatrix[current.currentIdx][nextIdx];
        const nextG = current.g + costToNext;
        
        const nextUnvisited = new Set(current.unvisited);
        nextUnvisited.delete(nextIdx);
        
        const nextPath = [...current.path, nextIdx];
        
        const h = heuristic(nextIdx, nextUnvisited);
        const f = nextG + h;
        
        pq.enqueue({
          currentIdx: nextIdx,
          unvisited: nextUnvisited,
          path: nextPath,
          g: nextG
        }, f);
      }
    }

    if (bestCostForStart < bestGlobalCost) {
      bestGlobalCost = bestCostForStart;
      bestGlobalPath = bestPathForStart;
    }
  }

  // Map indices back to original objects
  return bestGlobalPath.map(idx => validLocs[idx]);
}

module.exports = { optimizeMultiDestinationRoute };
