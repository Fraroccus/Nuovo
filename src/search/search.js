// SearchController wires inventory, suggestions, and highlight store
export class SearchController {
  constructor(inventory, highlightStore, { debounceMs = 150 } = {}) {
    this.inventory = inventory;
    this.highlightStore = highlightStore;
    this.debounceMs = debounceMs;

    this.getSuggestions = this.inventory.getSuggestionsFactory();

    this._debounceHandle = null;
    this._lastQuery = '';
    this._pendingResolve = null;

    this.noResultsFor = null;
  }

  // Debounced suggestions generator for typing
  // Returns a promise that resolves to suggestions for the latest query
  async onQueryChange(query) {
    this._lastQuery = query;
    if (this._pendingResolve) {
      this._pendingResolve();
      this._pendingResolve = null;
    }
    if (this._debounceHandle) {
      clearTimeout(this._debounceHandle);
      this._debounceHandle = null;
    }

    return new Promise((resolve) => {
      let active = true;
      this._pendingResolve = () => {
        active = false;
        resolve([]);
      };
      this._debounceHandle = setTimeout(() => {
        if (!active) return;
        const suggestions = this.getSuggestions(query);
        this._pendingResolve = null;
        this._debounceHandle = null;
        resolve(suggestions);
      }, this.debounceMs);
    });
  }

  // Execute a search by query, updating highlights and camera focus via store subscribers
  executeSearch(query) {
    const shelfIds = this.inventory.findShelvesByItemQuery(query);
    if (shelfIds.length > 0) {
      this.highlightStore.setHighlightedShelves(shelfIds);
      this.noResultsFor = null;
      return { shelfIds, found: true };
    }
    this.highlightStore.clearHighlights();
    this.noResultsFor = query;
    return { shelfIds: [], found: false };
  }

  selectSuggestion(itemName) {
    const shelfIds = this.inventory.findShelvesByExactItemName(itemName);
    if (shelfIds.length > 0) {
      this.highlightStore.setHighlightedShelves(shelfIds);
      this.noResultsFor = null;
      return { shelfIds, found: true };
    }
    // Fallback to includes
    return this.executeSearch(itemName);
  }
}
