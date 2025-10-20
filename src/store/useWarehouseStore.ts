import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface WarehouseState {
  warehouseId: string | null;
  selectedShelfId: string | null;
  viewMode: "2d" | "3d";
  setWarehouseId: (id: string | null) => void;
  setSelectedShelf: (id: string | null) => void;
  setViewMode: (mode: "2d" | "3d") => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  devtools(
    (set) => ({
      warehouseId: null,
      selectedShelfId: null,
      viewMode: "2d",
      setWarehouseId: (id) => set({ warehouseId: id }),
      setSelectedShelf: (id) => set({ selectedShelfId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: "warehouse-store" }
  )
);
