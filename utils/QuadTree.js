/**
 * In-memory QuadTree implementation for fast 2D spatial queries.
 * Optimized for map viewport bounding box searches.
 */

class BoundingBox {
    constructor(minLat, minLng, maxLat, maxLng) {
        this.minLat = minLat;
        this.minLng = minLng;
        this.maxLat = maxLat;
        this.maxLng = maxLng;
    }

    contains(lat, lng) {
        return lat >= this.minLat && lat <= this.maxLat &&
               lng >= this.minLng && lng <= this.maxLng;
    }

    intersects(other) {
        return !(other.minLng > this.maxLng || 
                 other.maxLng < this.minLng || 
                 other.minLat > this.maxLat || 
                 other.maxLat < this.minLat);
    }
}

class QuadTree {
    /**
     * @param {BoundingBox} boundary The spatial boundary of this node
     * @param {number} capacity Max items per node before subdividing
     */
    constructor(boundary, capacity = 10, maxDepth = 10, depth = 0) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.maxDepth = maxDepth;
        this.depth = depth;
        this.items = [];
        this.divided = false;
    }

    subdivide() {
        const midLat = (this.boundary.minLat + this.boundary.maxLat) / 2;
        const midLng = (this.boundary.minLng + this.boundary.maxLng) / 2;

        const nw = new BoundingBox(midLat, this.boundary.minLng, this.boundary.maxLat, midLng);
        const ne = new BoundingBox(midLat, midLng, this.boundary.maxLat, this.boundary.maxLng);
        const sw = new BoundingBox(this.boundary.minLat, this.boundary.minLng, midLat, midLng);
        const se = new BoundingBox(this.boundary.minLat, midLng, midLat, this.boundary.maxLng);

        this.northwest = new QuadTree(nw, this.capacity, this.maxDepth, this.depth + 1);
        this.northeast = new QuadTree(ne, this.capacity, this.maxDepth, this.depth + 1);
        this.southwest = new QuadTree(sw, this.capacity, this.maxDepth, this.depth + 1);
        this.southeast = new QuadTree(se, this.capacity, this.maxDepth, this.depth + 1);

        this.divided = true;
    }

    /**
     * Inserts an item into the QuadTree.
     * Expects item.coordinates to be [lat, lng].
     */
    insert(item) {
        if (!item || !item.coordinates || item.coordinates.length < 2) return false;
        
        const lat = item.coordinates[0];
        const lng = item.coordinates[1];

        if (!this.boundary.contains(lat, lng)) {
            return false; // Point doesn't fit in this node
        }

        if (this.items.length < this.capacity || this.depth >= this.maxDepth) {
            if (!this.divided) {
                this.items.push(item);
                return true;
            }
        }

        if (!this.divided) {
            this.subdivide();
            
            // Move existing items into children
            const existingItems = this.items;
            this.items = [];
            for (let existing of existingItems) {
                this.northwest.insert(existing) ||
                this.northeast.insert(existing) ||
                this.southwest.insert(existing) ||
                this.southeast.insert(existing);
            }
        }

        if (this.northwest.insert(item)) return true;
        if (this.northeast.insert(item)) return true;
        if (this.southwest.insert(item)) return true;
        if (this.southeast.insert(item)) return true;

        return false;
    }

    /**
     * Finds all items that fall within the given BoundingBox.
     * @param {BoundingBox} range 
     * @param {Array} found 
     * @returns {Array} List of matching items
     */
    search(range, found = []) {
        if (!this.boundary.intersects(range)) {
            return found; // Empty intersection, return early
        }

        // Check items at this node level
        for (let item of this.items) {
            const lat = item.coordinates[0];
            const lng = item.coordinates[1];
            if (range.contains(lat, lng)) {
                found.push(item);
            }
        }

        // Search children if divided
        if (this.divided) {
            this.northwest.search(range, found);
            this.northeast.search(range, found);
            this.southwest.search(range, found);
            this.southeast.search(range, found);
        }

        return found;
    }

    /**
     * Resets the QuadTree structure.
     */
    clear() {
        this.items = [];
        this.divided = false;
        this.northwest = null;
        this.northeast = null;
        this.southwest = null;
        this.southeast = null;
    }
}

module.exports = {
    QuadTree,
    BoundingBox
};
