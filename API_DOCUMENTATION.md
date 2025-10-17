# Warehouse Inventory Management API Documentation

## Overview
This API provides comprehensive endpoints for managing warehouses, shelves, and inventory items with full CRUD operations, validation, and transactional support.

## Base URL
```
http://localhost:3000/api
```

## Common Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [] // Optional validation details
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Warehouses API

### List All Warehouses
```http
GET /api/warehouses
```

**Response:**
```json
{
  "data": [
    {
      "id": "clxxx123",
      "name": "Main Warehouse",
      "location": "123 Storage St",
      "capacity": 10000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "shelves": []
    }
  ]
}
```

### Get Warehouse by ID
```http
GET /api/warehouses/{id}
```

**Response:**
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Main Warehouse",
    "location": "123 Storage St",
    "capacity": 10000,
    "shelves": [
      {
        "id": "clyyy456",
        "name": "Shelf A1",
        "location": "Aisle 1",
        "capacity": 500,
        "items": []
      }
    ]
  }
}
```

### Create Warehouse
```http
POST /api/warehouses
```

**Request Body:**
```json
{
  "name": "Main Warehouse",
  "location": "123 Storage St",
  "capacity": 10000
}
```

**Validation Rules:**
- `name`: Required, minimum 1 character
- `location`: Required, minimum 1 character
- `capacity`: Required, positive integer

**Response:** `201 Created`
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Main Warehouse",
    "location": "123 Storage St",
    "capacity": 10000,
    "shelves": []
  }
}
```

### Update Warehouse
```http
PATCH /api/warehouses/{id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Warehouse Name",
  "location": "456 New St",
  "capacity": 15000
}
```

**Response:**
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Updated Warehouse Name",
    ...
  }
}
```

### Delete Warehouse
```http
DELETE /api/warehouses/{id}
```

**Response:**
```json
{
  "message": "Warehouse deleted successfully"
}
```

**Note:** Deletes all associated shelves and items (cascade delete)

### Get Warehouse Statistics
```http
GET /api/warehouses/{id}/statistics
```

**Response:**
```json
{
  "data": {
    "id": "clxxx123",
    "name": "Main Warehouse",
    "totalShelves": 10,
    "totalItems": 50,
    "totalQuantity": 1500,
    "capacity": 10000,
    "utilizationPercentage": 15.0
  }
}
```

---

## Shelves API

### List All Shelves
```http
GET /api/shelves
GET /api/shelves?warehouseId={warehouseId}
```

**Query Parameters:**
- `warehouseId` (optional): Filter shelves by warehouse

**Response:**
```json
{
  "data": [
    {
      "id": "clyyy456",
      "name": "Shelf A1",
      "location": "Aisle 1",
      "capacity": 500,
      "warehouseId": "clxxx123",
      "warehouse": {
        "id": "clxxx123",
        "name": "Main Warehouse"
      },
      "items": []
    }
  ]
}
```

### Get Shelf by ID
```http
GET /api/shelves/{id}
```

**Response:**
```json
{
  "data": {
    "id": "clyyy456",
    "name": "Shelf A1",
    "location": "Aisle 1",
    "capacity": 500,
    "warehouseId": "clxxx123",
    "warehouse": { ... },
    "items": [ ... ]
  }
}
```

### Create Shelf
```http
POST /api/shelves
```

**Request Body:**
```json
{
  "name": "Shelf A1",
  "location": "Aisle 1",
  "capacity": 500,
  "warehouseId": "clxxx123"
}
```

**Validation Rules:**
- `name`: Required, minimum 1 character
- `location`: Required, minimum 1 character
- `capacity`: Required, positive integer
- `warehouseId`: Required, must reference existing warehouse

**Response:** `201 Created`

### Update Shelf
```http
PATCH /api/shelves/{id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Shelf Name",
  "location": "Aisle 2",
  "capacity": 600,
  "warehouseId": "clxxx999"
}
```

### Delete Shelf
```http
DELETE /api/shelves/{id}
```

**Response:**
```json
{
  "message": "Shelf deleted successfully"
}
```

**Note:** Deletes all associated items (cascade delete)

### Clear Shelf
```http
POST /api/shelves/{id}/clear
```

**Description:** Removes all items from the shelf in a single transaction.

**Response:**
```json
{
  "data": {
    "shelfId": "clyyy456",
    "deletedItemsCount": 15
  }
}
```

### Get Shelf Statistics
```http
GET /api/shelves/{id}/statistics
```

**Response:**
```json
{
  "data": {
    "id": "clyyy456",
    "name": "Shelf A1",
    "warehouseId": "clxxx123",
    "totalItems": 5,
    "totalQuantity": 150,
    "capacity": 500,
    "utilizationPercentage": 30.0
  }
}
```

---

## Items API

### List All Items
```http
GET /api/items
GET /api/items?shelfId={shelfId}
```

**Query Parameters:**
- `shelfId` (optional): Filter items by shelf

**Response:**
```json
{
  "data": [
    {
      "id": "clzzz789",
      "name": "Widget",
      "sku": "WDG-001",
      "quantity": 50,
      "description": "Standard widget",
      "shelfId": "clyyy456",
      "shelf": {
        "id": "clyyy456",
        "name": "Shelf A1",
        "warehouse": { ... }
      }
    }
  ]
}
```

### Get Item by ID
```http
GET /api/items/{id}
```

**Response:**
```json
{
  "data": {
    "id": "clzzz789",
    "name": "Widget",
    "sku": "WDG-001",
    "quantity": 50,
    "description": "Standard widget",
    "shelfId": "clyyy456",
    "shelf": { ... }
  }
}
```

### Get Item by SKU
```http
GET /api/items/sku/{sku}
```

**Response:** Same as Get Item by ID

### Create Item
```http
POST /api/items
```

**Request Body:**
```json
{
  "name": "Widget",
  "sku": "WDG-001",
  "quantity": 50,
  "description": "Standard widget",
  "shelfId": "clyyy456"
}
```

**Validation Rules:**
- `name`: Required, minimum 1 character
- `sku`: Required, minimum 1 character, must be unique
- `quantity`: Required, non-negative integer
- `description`: Optional
- `shelfId`: Required, must reference existing shelf
- Total shelf quantity cannot exceed shelf capacity

**Response:** `201 Created`

### Update Item
```http
PATCH /api/items/{id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Widget",
  "sku": "WDG-002",
  "quantity": 75,
  "description": "Updated description",
  "shelfId": "clyyy999"
}
```

### Delete Item
```http
DELETE /api/items/{id}
```

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

### Adjust Item Quantity
```http
POST /api/items/{id}/adjust-quantity
```

**Description:** Atomically adjust item quantity (add or subtract) within a transaction. Validates capacity constraints.

**Request Body:**
```json
{
  "adjustment": 10
}
```

**Validation Rules:**
- `adjustment`: Required integer (positive to add, negative to subtract)
- Resulting quantity cannot be negative
- Resulting total shelf quantity cannot exceed shelf capacity

**Response:**
```json
{
  "data": {
    "id": "clzzz789",
    "name": "Widget",
    "quantity": 60,
    ...
  }
}
```

### Move Item
```http
POST /api/items/{id}/move
```

**Description:** Move an item (or partial quantity) to another shelf within a transaction. Validates capacity constraints.

**Request Body:**
```json
{
  "targetShelfId": "clyyy999",
  "quantity": 25
}
```

**Validation Rules:**
- `targetShelfId`: Required, must reference existing shelf
- `quantity`: Optional, positive integer (defaults to entire item quantity)
- Cannot move more than available quantity
- Target shelf capacity cannot be exceeded

**Behavior:**
- If moving entire quantity: item's shelfId is updated
- If moving partial quantity: original item quantity is reduced, and:
  - If same SKU exists on target shelf: quantities are merged
  - Otherwise: new item is created on target shelf

**Response:**
```json
{
  "data": {
    "id": "clzzz789",
    "name": "Widget",
    "quantity": 25,
    "shelfId": "clyyy999",
    ...
  }
}
```

---

## Transaction Support

The following operations use Prisma transactions to ensure data consistency:

1. **Clear Shelf** (`POST /api/shelves/{id}/clear`)
   - Atomically deletes all items from a shelf

2. **Adjust Item Quantity** (`POST /api/items/{id}/adjust-quantity`)
   - Atomically adjusts quantity with capacity validation

3. **Move Item** (`POST /api/items/{id}/move`)
   - Atomically moves items between shelves with capacity validation
   - Handles partial moves and SKU merging

---

## Error Examples

### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "message": "Name is required",
      "path": ["name"]
    }
  ]
}
```

### Not Found Error
```json
{
  "error": "Warehouse not found"
}
```

### Business Logic Error
```json
{
  "error": "Shelf capacity exceeded"
}
```

### Duplicate SKU Error
```json
{
  "error": "Item with this SKU already exists"
}
```

---

## Database Schema

### Warehouse
- `id`: String (CUID)
- `name`: String
- `location`: String
- `capacity`: Integer
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations:** One-to-many with Shelf

### Shelf
- `id`: String (CUID)
- `name`: String
- `location`: String
- `capacity`: Integer
- `warehouseId`: String (FK)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations:** Many-to-one with Warehouse, One-to-many with Item

### Item
- `id`: String (CUID)
- `name`: String
- `sku`: String (Unique)
- `quantity`: Integer
- `description`: String (Nullable)
- `shelfId`: String (FK)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relations:** Many-to-one with Shelf

---

## Best Practices

1. **Always validate input**: Use the provided validation schemas
2. **Check capacity**: Before adding/moving items, ensure shelf capacity is not exceeded
3. **Use transactions**: For multi-step operations, use the transactional endpoints
4. **Handle errors gracefully**: All endpoints return structured error responses
5. **Monitor capacity**: Use statistics endpoints to track utilization
6. **Unique SKUs**: Ensure SKUs are unique across the entire system

---

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Run tests:
   ```bash
   npm test
   ```

---

## Testing

The API includes comprehensive unit tests for all service layer operations:

- `warehouse.service.test.ts` - Warehouse CRUD and statistics
- `shelf.service.test.ts` - Shelf CRUD, clearing, and statistics
- `item.service.test.ts` - Item CRUD, quantity adjustments, and moves

Run tests with:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```
