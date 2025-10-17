export type EditMode = "view" | "layout" | "shelf" | "inventory";

export interface WarehouseZone {
  id: string;
  name: string;
  shelfIds: string[];
  metadata?: Record<string, string>;
}

export interface WarehouseLayout {
  id: string;
  name: string;
  zones: WarehouseZone[];
  updatedAt: string;
}

export interface ShelfMetadata {
  id: string;
  zoneId: string;
  label: string;
  capacity: number;
  occupiedCapacity: number;
  attributes?: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  shelfId: string;
  metadata?: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface WarehouseSnapshot {
  layout: WarehouseLayout | null;
  shelves: Record<string, ShelfMetadata>;
  inventory: Record<string, InventoryItem>;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  version: number;
}

export interface ShelfMutationInput {
  id: string;
  zoneId: string;
  label?: string;
  capacity?: number;
  occupiedCapacity?: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface InventoryMutationInput {
  id: string;
  sku?: string;
  name?: string;
  quantity?: number;
  shelfId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface HighlightMetadata {
  id: string;
  type: "shelf" | "inventory" | "zone";
  message?: string;
  level?: "info" | "warning" | "critical";
}
