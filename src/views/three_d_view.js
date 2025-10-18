export class ThreeDView {
  constructor(highlightStore) {
    this.store = highlightStore;
    this.highlightedShelves = new Set();
    this.lastCameraFocusShelfId = null;
    this._unsubscribe = this.store.subscribe((set) => {
      this.highlightedShelves = new Set(set);
      this._onHighlightChange();
    });
  }

  _onHighlightChange() {
    if (this.highlightedShelves.size > 0) {
      const [first] = Array.from(this.highlightedShelves);
      this.focusCameraOnShelf(first);
    } else {
      this.lastCameraFocusShelfId = null;
    }
  }

  focusCameraOnShelf(shelfId) {
    // Simulate camera focusing by storing target shelf
    this.lastCameraFocusShelfId = shelfId;
  }

  getHighlightedShelves() {
    return new Set(this.highlightedShelves);
  }

  getCameraTargetShelf() {
    return this.lastCameraFocusShelfId;
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
