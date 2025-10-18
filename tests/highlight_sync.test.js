import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from '../src/inventory.js';
import { HighlightStore } from '../src/store.js';
import { SearchController } from '../src/search/search.js';
import { TwoDView } from '../src/views/two_d_view.js';
import { ThreeDView } from '../src/views/three_d_view.js';

const sampleInventory = new Inventory({
  shelves: [
    { id: 'S1', name: 'Shelf 1' },
    { id: 'S2', name: 'Shelf 2' },
    { id: 'S3', name: 'Shelf 3' },
  ],
  items: [
    { id: 'I1', name: 'Apple', shelfId: 'S1' },
    { id: 'I2', name: 'Banana', shelfId: 'S1' },
    { id: 'I3', name: 'Chair', shelfId: 'S2' },
    { id: 'I4', name: 'Apple Pie', shelfId: 'S3' },
    { id: 'I5', name: 'Grape', shelfId: 'S2' },
  ],
});

test('highlight synchronization across 2D and 3D views with camera focus', () => {
  const store = new HighlightStore();
  const twoD = new TwoDView(store);
  const threeD = new ThreeDView(store);
  const search = new SearchController(sampleInventory, store);

  const res = search.executeSearch('Apple');
  assert.equal(res.found, true);

  const highlighted = store.getHighlightedShelves();
  assert.deepEqual(new Set(['S1', 'S3']), highlighted);

  assert.deepEqual(twoD.getHighlightedShelves(), highlighted);
  assert.deepEqual(threeD.getHighlightedShelves(), highlighted);

  // 3D view should focus camera on the first highlighted shelf deterministically
  const camTarget = threeD.getCameraTargetShelf();
  assert.equal(camTarget === 'S1' || camTarget === 'S3', true);

  // Now search for an item that only exists on S2
  const res2 = search.executeSearch('Grape');
  assert.equal(res2.found, true);
  assert.deepEqual(store.getHighlightedShelves(), new Set(['S2']));
  assert.equal(threeD.getCameraTargetShelf(), 'S2');

  // No-result should clear highlights and camera target
  const res3 = search.executeSearch('zzz');
  assert.equal(res3.found, false);
  assert.deepEqual(store.getHighlightedShelves(), new Set());
  assert.equal(threeD.getCameraTargetShelf(), null);

  twoD.destroy();
  threeD.destroy();
});
