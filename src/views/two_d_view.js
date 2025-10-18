export class TwoDView {
  constructor(highlightStore) {
    this.store = highlightStore;
    this.highlightedShelves = new Set();
    this._unsubscribe = this.store.subscribe((set) => {
      this.highlightedShelves = new Set(set);
      this._onHighlightChange();
    });
  }

  _onHighlightChange() {}

  getHighlightedShelves() {
    return new Set(this.highlightedShelves);
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
