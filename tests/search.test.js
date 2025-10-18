import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from '../src/inventory.js';
import { HighlightStore } from '../src/store.js';
import { SearchController } from '../src/search/search.js';

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

const create = () => {
  const store = new HighlightStore();
  const search = new SearchController(sampleInventory, store, { debounceMs: 50 });
  return { search, store };
};

test('suggestions derived from inventory with caching and ranking', async () => {
  const { search } = create();
  const suggestions1 = await search.onQueryChange('ap');
  assert.deepEqual(suggestions1, ['Apple', 'Apple Pie']);
  const beforeCalls = search.getSuggestions._getComputeCallCount();
  const suggestions2 = await search.onQueryChange('ap');
  const afterCalls = search.getSuggestions._getComputeCallCount();
  assert.deepEqual(suggestions2, ['Apple', 'Apple Pie']);
  assert.equal(afterCalls, beforeCalls, 'cached suggestions should not recompute');
});

test('debounced suggestions only return the latest query results', async () => {
  const { search } = create();
  const p1 = search.onQueryChange('a');
  const p2 = search.onQueryChange('ap');
  const p3 = search.onQueryChange('app');
  const latest = await p3;
  assert.deepEqual(latest, ['Apple', 'Apple Pie']);
  // Earlier promises may resolve to [] due to cancellation; check latest correctness only
});

test('no-result scenarios are handled gracefully', () => {
  const { search, store } = create();
  const res = search.executeSearch('zzz');
  assert.equal(res.found, false);
  assert.equal(search.noResultsFor, 'zzz');
  assert.equal(store.getHighlightedShelves().size, 0);
});
