// Simple in-memory inventory and shelves with search utilities

export class Inventory {
  constructor({ items = [], shelves = [] } = {}) {
    this.items = items;
    this.shelves = shelves;
  }

  // Return an array of unique item names matching a query
  // Optimized via simple caching; case-insensitive includes; ranked by startsWith
  getSuggestionsFactory() {
    const cache = new Map();
    let computeCalls = 0;
    const compute = (query) => {
      computeCalls += 1;
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const names = Array.from(new Set(this.items.map((i) => i.name)));
      const matches = names.filter((name) => name.toLowerCase().includes(q));
      matches.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.localeCompare(b);
      });
      return matches.slice(0, 10);
    };
    const getSuggestions = (query) => {
      const key = query.toLowerCase();
      if (cache.has(key)) return cache.get(key);
      const res = compute(query);
      cache.set(key, res);
      return res;
    };
    // expose for tests
    getSuggestions._cache = cache;
    getSuggestions._getComputeCallCount = () => computeCalls;
    return getSuggestions;
  }

  // Return unique shelf IDs that have items whose name matches the query (case-insensitive includes)
  findShelvesByItemQuery(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const ids = new Set();
    for (const item of this.items) {
      if (item.name.toLowerCase().includes(q)) ids.add(item.shelfId);
    }
    return Array.from(ids);
  }

  // Return unique shelf IDs that have items whose name equals the name exactly (case-insensitive)
  findShelvesByExactItemName(name) {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    const ids = new Set();
    for (const item of this.items) {
      if (item.name.toLowerCase() === q) ids.add(item.shelfId);
    }
    return Array.from(ids);
  }
}
