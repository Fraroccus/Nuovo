export interface ShelfMetadata {
  capacity: number;
  contents: string;
  lastUpdated: string;
}

export interface Shelf {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata: ShelfMetadata;
}

export interface WarehouseGrid {
  columns: number;
  rows: number;
}

export interface WarehouseMutation {
  type: "add" | "update" | "select" | "hover" | "remove";
  shelfId?: string;
  timestamp: number;
}
