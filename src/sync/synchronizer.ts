import type { Unsubscribe } from "zustand";
import type { WarehouseSnapshot } from "../types/warehouse";
import { useWarehouseStore } from "../store/warehouseStore";

export type WarehouseStoreApi = typeof useWarehouseStore;

export interface WarehouseSynchronizer {
  subscribe: (listener: (snapshot: WarehouseSnapshot) => void) => () => void;
  applyRemoteSnapshot: (snapshot: WarehouseSnapshot) => void;
  setSyncing: (isSyncing: boolean) => void;
  destroy: () => void;
}

export const createWarehouseSynchronizer = (
  store: WarehouseStoreApi = useWarehouseStore,
): WarehouseSynchronizer => {
  const listeners = new Set<(snapshot: WarehouseSnapshot) => void>();
  let currentSnapshot = store.getState().getSnapshot();
  let unsubscribeStore: Unsubscribe | null = null;

  const ensureSubscription = () => {
    if (unsubscribeStore) {
      return;
    }

    unsubscribeStore = store.subscribe(
      (state) => state.version,
      () => {
        currentSnapshot = store.getState().getSnapshot();
        listeners.forEach((listener) => listener(currentSnapshot));
      },
    );
  };

  ensureSubscription();

  return {
    subscribe: (listener) => {
      ensureSubscription();
      listeners.add(listener);
      listener(currentSnapshot);
      return () => {
        listeners.delete(listener);
      };
    },
    applyRemoteSnapshot: (snapshot) => {
      store.getState().applySnapshot(snapshot);
    },
    setSyncing: (isSyncing) => {
      store.getState().setSyncing(isSyncing);
    },
    destroy: () => {
      listeners.clear();
      if (unsubscribeStore) {
        unsubscribeStore();
        unsubscribeStore = null;
      }
    },
  };
};
