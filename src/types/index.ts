export type Warehouse = {
  id: string;
  name: string;
  location: string;
  description: string | null;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Shelf = {
  id: string;
  name: string;
  section: string;
  level: number;
  capacity: number;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Item = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  price: number;
  category: string;
  shelfId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WarehouseWithShelves = Warehouse & {
  shelves: Shelf[];
};

export type ShelfWithItems = Shelf & {
  items: Item[];
};

export type ItemWithLocation = Item & {
  shelf: Shelf & {
    warehouse: Warehouse;
  };
};
