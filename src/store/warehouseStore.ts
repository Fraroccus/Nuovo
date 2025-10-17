import { create } from "zustand";
import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import {
  InventoryItem,
  ShelfMetadata,
  WarehouseLayout,
  WarehouseSnapshot,
} from "../types/warehouse";

export interface WarehouseCoreState {
  layout: WarehouseLayout | null;
  shelves: Record<string, ShelfMetadata>;
  inventory: Record<string, InventoryItem>;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  version: number;
}

export interface WarehouseStoreState extends WarehouseCoreState {
  setLayout: (layout: WarehouseLayout) => void;
  upsertShelves: (shelves: ShelfMetadata[]) => void;
  replaceShelves: (shelves: Record<string, ShelfMetadata>) => void;
  removeShelves: (ids: string[]) => void;
  upsertInventory: (items: InventoryItem[]) => void;
  replaceInventory: (inventory: Record<string, InventoryItem>) => void;
  removeInventory: (ids: string[]) => void;
  setSyncing: (isSyncing: boolean) => void;
  applySnapshot: (snapshot: WarehouseSnapshot) => void;
  getSnapshot: () => WarehouseSnapshot;
  reset: () => void;
}

export type WarehouseStore = UseBoundStore<StoreApi<WarehouseStoreState>>;
export type WarehouseStoreInitializer = Partial<WarehouseCoreState>;

const createDefaultCoreState = (): WarehouseCoreState => ({
  layout: null,
  shelves: {},
  inventory: {},
  isSyncing: false,
  lastSyncedAt: null,
  version: 0,
});

const clone = <T>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
};

const stateCreator = (
  initializer?: WarehouseStoreInitializer,
): StateCreator<WarehouseStoreState> => {
  const base = {
    ...createDefaultCoreState(),
    ...clone(initializer ?? {}),
  } as WarehouseCoreState;

  return (set, get) => ({
    ...base,
    setLayout: (layout) =>
      set((state) => ({
        ...state,
        layout: clone(layout),
        lastSyncedAt: Date.now(),
        version: state.version + 1,
      })),
    upsertShelves: (shelves) =>
      set((state) => {
        const nextShelves = { ...state.shelves };
        shelves.forEach((shelf) => {
          nextShelves[shelf.id] = clone(shelf);
        });

        return {
          ...state,
          shelves: nextShelves,
          lastSyncedAt: Date.now(),
          version: state.version + 1,
        };
      }),
    replaceShelves: (shelves) =>
      set((state) => ({
        ...state,
        shelves: clone(shelves),
        lastSyncedAt: Date.now(),
        version: state.version + 1,
      })),
    removeShelves: (ids) =>
      set((state) => {
        if (!ids.length) {
          return state;
        }

        const nextShelves = { ...state.shelves };
        ids.forEach((id) => {
          delete nextShelves[id];
        });

        return {
          ...state,
          shelves: nextShelves,
          lastSyncedAt: Date.now(),
          version: state.version + 1,
        };
      }),
    upsertInventory: (items) =>
      set((state) => {
        const nextInventory = { ...state.inventory };
        items.forEach((item) => {
          nextInventory[item.id] = clone(item);
        });

        return {
          ...state,
          inventory: nextInventory,
          lastSyncedAt: Date.now(),
          version: state.version + 1,
        };
      }),
    replaceInventory: (inventory) =>
      set((state) => ({
        ...state,
        inventory: clone(inventory),
        lastSyncedAt: Date.now(),
        version: state.version + 1,
      })),
    removeInventory: (ids) =>
      set((state) => {
        if (!ids.length) {
          return state;
        }

        const nextInventory = { ...state.inventory };
        ids.forEach((id) => {
          delete nextInventory[id];
        });

        return {
          ...state,
          inventory: nextInventory,
          lastSyncedAt: Date.now(),
          version: state.version + 1,
        };
      }),
    setSyncing: (isSyncing) =>
      set((state) => ({
        ...state,
        isSyncing,
        version: state.version + 1,
      })),
    applySnapshot: (snapshot) =>
      set((state) => ({
        ...state,
        layout: snapshot.layout ? clone(snapshot.layout) : null,
        shelves: clone(snapshot.shelves),
        inventory: clone(snapshot.inventory),
        lastSyncedAt: snapshot.lastSyncedAt ?? Date.now(),
        isSyncing: snapshot.isSyncing,
        version:
          typeof snapshot.version === "number"
            ? snapshot.version
            : state.version + 1,
      })),
    getSnapshot: () => {
      const current = get();
      return {
        layout: current.layout ? clone(current.layout) : null,
        shelves: clone(current.shelves),
        inventory: clone(current.inventory),
        lastSyncedAt: current.lastSyncedAt,
        isSyncing: current.isSyncing,
        version: current.version,
      } satisfies WarehouseSnapshot;
    },
    reset: () =>
      set((state) => ({
        ...state,
        ...clone(base),
        version: state.version + 1,
      })),
  });
};

export const createWarehouseStore = (
  initializer?: WarehouseStoreInitializer,
): WarehouseStore => create<WarehouseStoreState>(stateCreator(initializer));

export const useWarehouseStore = createWarehouseStore();

export const resetWarehouseStore = (): void => {
  useWarehouseStore.getState().reset();
};
