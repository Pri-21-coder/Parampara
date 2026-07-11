const { calculateHaversineDistance } = require('./haversine');

class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

class GraphEngine {
  constructor(culturalItems, heritagePaths) {
    this.adjacencyList = {};
    this.nodes = {};
    this.buildGraph(culturalItems, heritagePaths);
  }

  buildGraph(culturalItems = [], heritagePaths = []) {
    // 1. Initialize nodes
    culturalItems.forEach(item => {
      this.nodes[item.id] = item;
      this.adjacencyList[item.id] = [];
    });

    // 2. Build edges based on heritagePaths
    heritagePaths.forEach(path => {
      if (!Array.isArray(path.items)) return;

      const items = path.items
        .map(item => typeof item === 'string' ? item.trim() : item)
        .filter(item => typeof item === 'string' ? item.length > 0 : Boolean(item));

      if (items.length < 2) return;

      for (let i = 0; i < items.length - 1; i++) {
        const u = items[i];
        const v = items[i + 1];

        if (this.nodes[u] && this.nodes[v]) {
          const uNode = this.nodes[u];
          const vNode = this.nodes[v];

          // Ensure valid coordinates exist before calculating distance
          if (
            Array.isArray(uNode.coordinates) && uNode.coordinates.length >= 2 &&
            Array.isArray(vNode.coordinates) && vNode.coordinates.length >= 2
          ) {
            const dist = calculateHaversineDistance(
              uNode.coordinates[0], uNode.coordinates[1],
              vNode.coordinates[0], vNode.coordinates[1]
            );

            // Undirected edge
            this.adjacencyList[u].push({ node: v, weight: dist, pathId: path.id, theme: path.theme });
            this.adjacencyList[v].push({ node: u, weight: dist, pathId: path.id, theme: path.theme });
          }
        }
      }
    });
  }

  findShortestPath(startId, endId, options = {}) {
    if (!this.nodes[startId] || !this.nodes[endId]) {
      throw new Error(`Invalid start or end location. startId: ${startId} (${!!this.nodes[startId]}), endId: ${endId} (${!!this.nodes[endId]})`);
    }

    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    const filterTheme = options.theme ? options.theme.toLowerCase() : null;

    Object.keys(this.nodes).forEach(id => {
      distances[id] = Infinity;
      previous[id] = null;
    });

    distances[startId] = 0;
    pq.enqueue(startId, 0);

    while (!pq.isEmpty()) {
      const current = pq.dequeue();

      if (current === endId) {
        break; // Reached destination
      }

      const neighbors = this.adjacencyList[current];
      for (const neighbor of neighbors) {
        if (filterTheme && neighbor.theme && !neighbor.theme.toLowerCase().includes(filterTheme)) {
          continue; // Skip edges that don't match the theme filter
        }

        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = {
            id: current,
            pathId: neighbor.pathId,
            theme: neighbor.theme,
            distance: neighbor.weight
          };
          pq.enqueue(neighbor.node, alt);
        }
      }
    }

    // Reconstruct path
    if (distances[endId] === Infinity) {
      return null; // No path found
    }

    const route = [];
    let curr = endId;
    while (curr !== null) {
      const prevData = previous[curr];
      route.unshift({
        item: this.nodes[curr],
        legDistance: prevData ? prevData.distance : 0,
        viaPath: prevData ? prevData.pathId : null,
        theme: prevData ? prevData.theme : null
      });
      curr = prevData ? prevData.id : null;
    }

    return {
      totalDistanceKm: distances[endId],
      route
    };
  }
}

module.exports = GraphEngine;