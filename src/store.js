import { EventEmitter } from 'events';

export class HighlightStore {
  constructor() {
    this._emitter = new EventEmitter();
    this._highlightedShelves = new Set();
  }

  getHighlightedShelves() {
    return new Set(this._highlightedShelves);
  }

  setHighlightedShelves(shelfIds) {
    const newSet = new Set(shelfIds);
    const changed = !this._setsEqual(this._highlightedShelves, newSet);
    if (changed) {
      this._highlightedShelves = newSet;
      this._emitter.emit('change', this.getHighlightedShelves());
    }
  }

  clearHighlights() {
    if (this._highlightedShelves.size > 0) {
      this._highlightedShelves.clear();
      this._emitter.emit('change', this.getHighlightedShelves());
    }
  }

  subscribe(callback) {
    this._emitter.on('change', callback);
    // Immediately notify with current state
    callback(this.getHighlightedShelves());
    return () => {
      this._emitter.off('change', callback);
    };
  }

  _setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const v of a) {
      if (!b.has(v)) return false;
    }
    return true;
  }
}
