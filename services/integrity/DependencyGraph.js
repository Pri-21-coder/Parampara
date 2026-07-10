class DependencyGraph {
  constructor() {
    this.nodes = new Map(); // id -> { type, data }
    this.edges = new Map(); // fromId -> Set<toId>
    this.reverseEdges = new Map(); // toId -> Set<fromId>
  }

  addNode(id, type, data) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { type, data });
    }
  }

  addEdge(fromId, toId) {
    if (!this.edges.has(fromId)) this.edges.set(fromId, new Set());
    if (!this.reverseEdges.has(toId)) this.reverseEdges.set(toId, new Set());

    this.edges.get(fromId).add(toId);
    this.reverseEdges.get(toId).add(fromId);
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getIncomingEdges(id) {
    return this.reverseEdges.get(id) || new Set();
  }

  getOutgoingEdges(id) {
    return this.edges.get(id) || new Set();
  }

  // Identify true orphans (nodes with 0 incoming edges and 0 outgoing edges, or only specific types)
  getOrphans(typeFilter) {
    const orphans = [];
    for (const [id, node] of this.nodes.entries()) {
      if (typeFilter && node.type !== typeFilter) continue;
      
      const incomingCount = this.getIncomingEdges(id).size;
      // Some nodes are inherently roots (like heritagePaths), but culturalItems shouldn't be orphans
      if (incomingCount === 0) {
        orphans.push(id);
      }
    }
    return orphans;
  }

  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.reverseEdges.clear();
  }
}

module.exports = DependencyGraph;
