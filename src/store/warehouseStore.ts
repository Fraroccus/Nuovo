import { create } from "zustand";
import { createShelf, saveShelf } from "../api/mockApi";
import { Shelf, WarehouseGrid, WarehouseMutation } from "../types";
import { clamp, snapToGrid } from "../utils/geometry";

export interface WarehouseState {
  grid: WarehouseGrid;
  shelves: Shelf[];
  selectedShelfId?: string;
  hoveredShelfId?: string;
  mutationLog: WarehouseMutation[];
  revision: number;
  addShelf: () => Shelf;
  selectShelf: (id?: string) => void;
  setHoveredShelf: (id?: string) => void;
  moveShelf: (id: string, x: number, y: number) => void;
  resizeShelf: (id: string, width: number, height: number) => void;
  updateShelf: (id: string, patch: Partial<Shelf>) => void;
}

type BaseState = Pick<
  WarehouseState,
  "grid" | "shelves" | "selectedShelfId" | "hoveredShelfId" | "mutationLog" | "revision"
>;

const createInitialShelves = (): Shelf[] => [
  {
    id: "shelf-1",
    label: "A-01",
    x: 2,
    y: 2,
    width: 4,
    height: 2,
    metadata: {
      capacity: 180,
      contents: "Picking bins",
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "shelf-2",
    label: "B-04",
    x: 10,
    y: 5,
    width: 5,
    height: 2,
    metadata: {
      capacity: 140,
      contents: "Bulk storage",
      lastUpdated: new Date().toISOString()
    }
  }
];

const createBaseState = (): BaseState => ({
  grid: {
    columns: 24,
    rows: 12
  },
  shelves: createInitialShelves(),
  selectedShelfId: undefined,
  hoveredShelfId: undefined,
  mutationLog: [],
  revision: 0
});

const MAX_MUTATIONS = 32;

const pushMutation = (list: WarehouseMutation[], entry: WarehouseMutation) => {
  const next = [...list, entry];
  if (next.length > MAX_MUTATIONS) {
    next.shift();
  }
  return next;
};

const withLastUpdated = (shelf: Shelf) => ({
  ...shelf,
  metadata: {
    ...shelf.metadata,
    lastUpdated: new Date().toISOString()
  }
});

const clampShelf = (shelf: Shelf, grid: WarehouseGrid): Shelf => {
  const width = clamp(snapToGrid(shelf.width, 1), 1, grid.columns);
  const height = clamp(snapToGrid(shelf.height, 1), 1, grid.rows);
  const x = clamp(snapToGrid(shelf.x, 1), 0, grid.columns - width);
  const y = clamp(snapToGrid(shelf.y, 1), 0, grid.rows - height);

  return {
    ...shelf,
    x,
    y,
    width,
    height
  };
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  ...createBaseState(),
  addShelf: () => {
    const id = `shelf-${Date.now()}`;
    const shelf: Shelf = {
      id,
      label: `New ${get().shelves.length + 1}`,
      x: 1,
      y: 1,
      width: 4,
      height: 2,
      metadata: {
        capacity: 100,
        contents: "Unassigned",
        lastUpdated: new Date().toISOString()
      }
    };

    let createdShelf: Shelf = shelf;

    set((state) => {
      const normalized = clampShelf(shelf, state.grid);
      createdShelf = normalized;
      return {
        shelves: [...state.shelves, normalized],
        selectedShelfId: normalized.id,
        mutationLog: pushMutation(state.mutationLog, {
          type: "add",
          shelfId: normalized.id,
          timestamp: Date.now()
        }),
        revision: state.revision + 1
      };
    });

    void createShelf(createdShelf);
    return createdShelf;
  },
  selectShelf: (id) => {
    set((state) => ({
      selectedShelfId: id,
      mutationLog: pushMutation(state.mutationLog, {
        type: "select",
        shelfId: id,
        timestamp: Date.now()
      }),
      revision: state.revision + 1
    }));
  },
  setHoveredShelf: (id) => {
    set((state) => ({
      hoveredShelfId: id,
      mutationLog: pushMutation(state.mutationLog, {
        type: "hover",
        shelfId: id,
        timestamp: Date.now()
      }),
      revision: state.revision + 1
    }));
  },
  moveShelf: (id, x, y) => {
    const commit = () => {
      set((state) => {
        const index = state.shelves.findIndex((shelf) => shelf.id === id);
        if (index === -1) return state;

        const updated = withLastUpdated(
          clampShelf(
            {
              ...state.shelves[index],
              x,
              y
            },
            state.grid
          )
        );

        const shelves = [...state.shelves];
        shelves[index] = updated;

        return {
          shelves,
          mutationLog: pushMutation(state.mutationLog, {
            type: "update",
            shelfId: id,
            timestamp: Date.now()
          }),
          revision: state.revision + 1
        };
      });
    };

    commit();
    const shelf = get().shelves.find((item) => item.id === id);
    if (shelf) {
      void saveShelf(shelf);
    }
  },
  resizeShelf: (id, width, height) => {
    const commit = () => {
      set((state) => {
        const index = state.shelves.findIndex((shelf) => shelf.id === id);
        if (index === -1) return state;

        const updated = withLastUpdated(
          clampShelf(
            {
              ...state.shelves[index],
              width,
              height
            },
            state.grid
          )
        );

        const shelves = [...state.shelves];
        shelves[index] = updated;

        return {
          shelves,
          mutationLog: pushMutation(state.mutationLog, {
            type: "update",
            shelfId: id,
            timestamp: Date.now()
          }),
          revision: state.revision + 1
        };
      });
    };

    commit();
    const shelf = get().shelves.find((item) => item.id === id);
    if (shelf) {
      void saveShelf(shelf);
    }
  },
  updateShelf: (id, patch) => {
    const commit = () => {
      set((state) => {
        const index = state.shelves.findIndex((shelf) => shelf.id === id);
        if (index === -1) return state;

        const updated = withLastUpdated(
          clampShelf(
            {
              ...state.shelves[index],
              ...patch
            },
            state.grid
          )
        );

        const shelves = [...state.shelves];
        shelves[index] = updated;

        return {
          shelves,
          mutationLog: pushMutation(state.mutationLog, {
            type: "update",
            shelfId: id,
            timestamp: Date.now()
          }),
          revision: state.revision + 1
        };
      });
    };

    commit();
    const shelf = get().shelves.find((item) => item.id === id);
    if (shelf) {
      void saveShelf(shelf);
    }
  }
}));

export const resetWarehouseStore = () => {
  useWarehouseStore.setState(createBaseState(), false);
};
