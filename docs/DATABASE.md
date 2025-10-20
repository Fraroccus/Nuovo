# Database Schema Documentation

## Overview

This application uses PostgreSQL with Prisma ORM for type-safe database access. The schema is designed to model a warehouse inventory management system with three main entities: Warehouses, Shelves, and Items.

## Entity Relationship Diagram

```
Warehouse (1) ──── (many) Shelf (1) ──── (many) Item
```

## Tables

### Warehouse

Represents a physical warehouse location.

| Column      | Type     | Constraints       | Description               |
| ----------- | -------- | ----------------- | ------------------------- |
| id          | String   | Primary Key, CUID | Unique identifier         |
| name        | String   | Required, Indexed | Warehouse name            |
| location    | String   | Required          | Physical address          |
| description | String?  | Optional          | Additional details        |
| capacity    | Integer  | Default: 0        | Storage capacity          |
| createdAt   | DateTime | Auto-generated    | Record creation timestamp |
| updatedAt   | DateTime | Auto-updated      | Last update timestamp     |

**Relations:**

- One-to-many with Shelf (cascade delete)

**Indexes:**

- name

---

### Shelf

Represents a storage shelf within a warehouse.

| Column      | Type     | Constraints          | Description               |
| ----------- | -------- | -------------------- | ------------------------- |
| id          | String   | Primary Key, CUID    | Unique identifier         |
| name        | String   | Required             | Shelf identifier          |
| section     | String   | Required, Indexed    | Warehouse section         |
| level       | Integer  | Required             | Shelf level/height        |
| capacity    | Integer  | Default: 0           | Shelf capacity            |
| warehouseId | String   | Foreign Key, Indexed | Parent warehouse ID       |
| createdAt   | DateTime | Auto-generated       | Record creation timestamp |
| updatedAt   | DateTime | Auto-updated         | Last update timestamp     |

**Relations:**

- Many-to-one with Warehouse (required)
- One-to-many with Item (cascade delete)

**Indexes:**

- warehouseId
- section

---

### Item

Represents an inventory item stored on a shelf.

| Column      | Type     | Constraints               | Description               |
| ----------- | -------- | ------------------------- | ------------------------- |
| id          | String   | Primary Key, CUID         | Unique identifier         |
| name        | String   | Required                  | Item name                 |
| sku         | String   | Required, Unique, Indexed | Stock Keeping Unit        |
| description | String?  | Optional                  | Item description          |
| quantity    | Integer  | Default: 0                | Available quantity        |
| price       | Float    | Default: 0                | Item price                |
| category    | String   | Required, Indexed         | Item category             |
| shelfId     | String   | Foreign Key, Indexed      | Parent shelf ID           |
| createdAt   | DateTime | Auto-generated            | Record creation timestamp |
| updatedAt   | DateTime | Auto-updated              | Last update timestamp     |

**Relations:**

- Many-to-one with Shelf (required)

**Indexes:**

- shelfId
- sku (unique)
- category

---

## Cascade Behavior

- Deleting a Warehouse will cascade delete all related Shelves and their Items
- Deleting a Shelf will cascade delete all related Items

## Sample Queries

### Get all warehouses with shelf count

```typescript
const warehouses = await prisma.warehouse.findMany({
  include: {
    _count: {
      select: { shelves: true },
    },
  },
});
```

### Get warehouse with all shelves and items

```typescript
const warehouse = await prisma.warehouse.findUnique({
  where: { id: warehouseId },
  include: {
    shelves: {
      include: {
        items: true,
      },
    },
  },
});
```

### Get items by category

```typescript
const items = await prisma.item.findMany({
  where: { category: "Electronics" },
  include: {
    shelf: {
      include: {
        warehouse: true,
      },
    },
  },
});
```

## Migrations

Migrations are stored in `prisma/migrations/` and are managed by Prisma Migrate.

### Create a new migration

```bash
npm run db:migrate
```

### View migration status

```bash
npx prisma migrate status
```

### Reset database (development only)

```bash
npx prisma migrate reset
```

## Seeding

Sample data can be loaded using the seed script:

```bash
npm run db:seed
```

The seed script creates:

- 2 warehouses
- Multiple shelves per warehouse
- Sample items across different categories (Electronics, Furniture, Office Supplies)

## Performance Considerations

1. **Indexes**: The schema includes indexes on frequently queried fields:
   - Warehouse.name
   - Shelf.warehouseId
   - Shelf.section
   - Item.sku (unique)
   - Item.shelfId
   - Item.category

2. **Cascade Deletes**: Be cautious when deleting warehouses or shelves as it will remove all related data

3. **Pagination**: For large datasets, implement pagination using `skip` and `take`

## Connection Pooling

In production, consider using Prisma connection pooling:

- Prisma Accelerate for connection pooling and caching
- Or configure database connection limits appropriately
