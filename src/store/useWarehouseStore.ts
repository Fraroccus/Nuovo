import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface WarehouseState {
  selectedWarehouseId: string | null;
  selectedShelfId: string | null;
  viewMode: "list" | "3d";
  isAddWarehouseModalOpen: boolean;
  setSelectedWarehouse: (id: string | null) => void;
  setSelectedShelf: (id: string | null) => void;
  setViewMode: (mode: "list" | "3d") => void;
  openAddWarehouseModal: () => void;
  closeAddWarehouseModal: () => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  devtools(
    (set) => ({
      selectedWarehouseId: null,
      selectedShelfId: null,
      viewMode: "list",
      isAddWarehouseModalOpen: false,
      setSelectedWarehouse: (id) => set({ selectedWarehouseId: id }),
      setSelectedShelf: (id) => set({ selectedShelfId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      openAddWarehouseModal: () => set({ isAddWarehouseModalOpen: true }),
      closeAddWarehouseModal: () => set({ isAddWarehouseModalOpen: false }),
    }),
    { name: "warehouse-store" }
  )
);
