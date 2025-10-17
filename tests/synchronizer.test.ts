import { describe, expect, it, vi } from "vitest";
import { createWarehouseStore } from "../src/store/warehouseStore";
import { createWarehouseSynchronizer } from "../src/sync/synchronizer";
import type { WarehouseSnapshot } from "../src/types/warehouse";

const createSnapshot = (): WarehouseSnapshot => ({
  layout: {
    id: "layout-sync",
    name: "Synchronized",
    updatedAt: new Date().toISOString(),
    zones: [
      {
        id: "zone-sync",
        name: "Zone Sync",
        shelfIds: ["shelf-sync"],
      },
    ],
  },
  shelves: {
    "shelf-sync": {
      id: "shelf-sync",
      zoneId: "zone-sync",
      label: "Shelf Sync",
      capacity: 120,
      occupiedCapacity: 40,
      updatedAt: new Date().toISOString(),
    },
  },
  inventory: {
    "item-sync": {
      id: "item-sync",
      sku: "SYNC-01",
      name: "Sprocket",
      quantity: 15,
      shelfId: "shelf-sync",
      updatedAt: new Date().toISOString(),
    },
  },
  isSyncing: false,
  lastSyncedAt: Date.now(),
  version: 5,
});

describe("createWarehouseSynchronizer", () => {
  it("notifies subscribers when the store changes", () => {
    const store = createWarehouseStore();
    const synchronizer = createWarehouseSynchronizer(store);

    const listener = vi.fn();
    synchronizer.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);

    store.getState().setSyncing(true);
    expect(listener).toHaveBeenCalledTimes(2);

    store.getState().upsertInventory([
      {
        id: "item-1",
        sku: "A-1",
        name: "Adapter",
        quantity: 10,
        shelfId: "shelf-1",
        updatedAt: new Date().toISOString(),
      },
    ]);

    expect(listener).toHaveBeenCalledTimes(3);

    synchronizer.destroy();
  });

  it("applies remote snapshots and updates the store", () => {
    const store = createWarehouseStore();
    const synchronizer = createWarehouseSynchronizer(store);
    const listener = vi.fn();
    synchronizer.subscribe(listener);

    const snapshot = createSnapshot();

    synchronizer.applyRemoteSnapshot(snapshot);

    const state = store.getState();
    expect(state.layout?.id).toBe("layout-sync");
    expect(state.shelves["shelf-sync"].label).toBe("Shelf Sync");
    expect(state.inventory["item-sync"].quantity).toBe(15);
    expect(state.version).toBe(snapshot.version);

    const lastCall = listener.mock.calls.at(-1);
    expect(lastCall?.[0].version).toBe(snapshot.version);

    synchronizer.destroy();
  });
});
