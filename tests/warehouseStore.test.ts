import { describe, expect, it } from "vitest";
import { createWarehouseStore } from "../src/store/warehouseStore";
import type {
  InventoryItem,
  ShelfMetadata,
  WarehouseLayout,
  WarehouseSnapshot,
} from "../src/types/warehouse";

const layout: WarehouseLayout = {
  id: "layout-1",
  name: "Primary Floor",
  updatedAt: new Date().toISOString(),
  zones: [
    {
      id: "zone-1",
      name: "Zone A",
      shelfIds: ["shelf-1"],
    },
  ],
};

const shelfA: ShelfMetadata = {
  id: "shelf-1",
  zoneId: "zone-1",
  label: "Shelf A",
  capacity: 100,
  occupiedCapacity: 40,
  updatedAt: new Date().toISOString(),
  attributes: { temperature: "ambient" },
};

const shelfB: ShelfMetadata = {
  id: "shelf-2",
  zoneId: "zone-1",
  label: "Shelf B",
  capacity: 80,
  occupiedCapacity: 20,
  updatedAt: new Date().toISOString(),
  attributes: { temperature: "cold" },
};

const itemA: InventoryItem = {
  id: "item-1",
  sku: "SKU-1",
  name: "Widget",
  quantity: 50,
  shelfId: "shelf-1",
  updatedAt: new Date().toISOString(),
};

describe("warehouseStore", () => {
  it("initialises with default state", () => {
    const store = createWarehouseStore();
    const state = store.getState();

    expect(state.layout).toBeNull();
    expect(state.shelves).toEqual({});
    expect(state.inventory).toEqual({});
    expect(state.version).toBe(0);
  });

  it("sets layout and increments version", () => {
    const store = createWarehouseStore();
    const initialVersion = store.getState().version;

    store.getState().setLayout(layout);

    const state = store.getState();
    expect(state.layout).toEqual(layout);
    expect(state.lastSyncedAt).not.toBeNull();
    expect(state.version).toBe(initialVersion + 1);
  });

  it("upserts and removes shelves", () => {
    const store = createWarehouseStore();

    store.getState().upsertShelves([shelfA, shelfB]);
    let state = store.getState();
    expect(Object.keys(state.shelves)).toHaveLength(2);
    expect(state.shelves[shelfA.id]).toMatchObject({ label: "Shelf A" });

    store.getState().removeShelves([shelfA.id]);
    state = store.getState();
    expect(state.shelves[shelfA.id]).toBeUndefined();
    expect(Object.keys(state.shelves)).toHaveLength(1);
  });

  it("upserts inventory with cloning semantics", () => {
    const store = createWarehouseStore();
    const updatedItem: InventoryItem = { ...itemA, quantity: 60 };

    store.getState().upsertInventory([itemA]);
    let state = store.getState();
    expect(state.inventory[itemA.id].quantity).toBe(50);

    store.getState().upsertInventory([updatedItem]);
    state = store.getState();
    expect(state.inventory[itemA.id].quantity).toBe(60);
    expect(state.inventory[itemA.id]).not.toBe(updatedItem);
  });

  it("produces immutable snapshots", () => {
    const store = createWarehouseStore();
    store.getState().setLayout(layout);
    store.getState().upsertShelves([shelfA]);
    store.getState().upsertInventory([itemA]);

    const snapshot = store.getState().getSnapshot();
    snapshot.layout!.name = "mutated";
    snapshot.shelves[shelfA.id].label = "Mutated";
    snapshot.inventory[itemA.id].quantity = 0;

    const state = store.getState();
    expect(state.layout?.name).toBe(layout.name);
    expect(state.shelves[shelfA.id].label).toBe(shelfA.label);
    expect(state.inventory[itemA.id].quantity).toBe(itemA.quantity);
  });

  it("applies snapshots and resets to baseline", () => {
    const store = createWarehouseStore();

    const snapshot: WarehouseSnapshot = {
      layout,
      shelves: {
        [shelfA.id]: shelfA,
      },
      inventory: {
        [itemA.id]: itemA,
      },
      isSyncing: false,
      lastSyncedAt: Date.now(),
      version: 10,
    };

    store.getState().applySnapshot(snapshot);
    let state = store.getState();
    expect(state.layout).toEqual(layout);
    expect(state.version).toBe(10);

    store.getState().reset();
    state = store.getState();
    expect(state.layout).toBeNull();
    expect(state.shelves).toEqual({});
    expect(state.inventory).toEqual({});
    expect(state.version).toBeGreaterThan(10);
  });
});
