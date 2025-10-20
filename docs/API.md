# API Documentation

Base URL: `http://localhost:3000/api`

## Warehouses

### List All Warehouses

```http
GET /api/warehouses
```

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "location": "string",
    "description": "string | null",
    "capacity": number,
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "_count": {
      "shelves": number
    }
  }
]
```

### Create Warehouse

```http
POST /api/warehouses
```

**Request Body:**

```json
{
  "name": "string",
  "location": "string",
  "description": "string (optional)",
  "capacity": number
}
```

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "location": "string",
  "description": "string | null",
  "capacity": number,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Get Warehouse Details

```http
GET /api/warehouses/{id}
```

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "location": "string",
  "description": "string | null",
  "capacity": number,
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "shelves": [
    {
      "id": "string",
      "name": "string",
      "section": "string",
      "level": number,
      "capacity": number,
      "_count": {
        "items": number
      }
    }
  ]
}
```

### Delete Warehouse

```http
DELETE /api/warehouses/{id}
```

**Response:**

```json
{
  "success": true
}
```

**Note:** This will cascade delete all shelves and items in the warehouse.

---

## Shelves

### Get Shelf Details

```http
GET /api/shelves/{id}
```

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "section": "string",
  "level": number,
  "capacity": number,
  "warehouseId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "warehouse": {
    "id": "string",
    "name": "string",
    "location": "string"
  },
  "items": [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "quantity": number,
      "price": number,
      "category": "string"
    }
  ]
}
```

---

## Items

### List Items

```http
GET /api/items
```

**Query Parameters:**

- `shelfId` (optional): Filter by shelf ID
- `category` (optional): Filter by category

**Examples:**

```http
GET /api/items?category=Electronics
GET /api/items?shelfId=abc123
```

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "sku": "string",
    "description": "string | null",
    "quantity": number,
    "price": number,
    "category": "string",
    "shelfId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "shelf": {
      "name": "string",
      "warehouse": {
        "name": "string"
      }
    }
  }
]
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Examples

### Using fetch API

```typescript
// Get all warehouses
const warehouses = await fetch("/api/warehouses").then((res) => res.json());

// Create a warehouse
const newWarehouse = await fetch("/api/warehouses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "New Warehouse",
    location: "123 Main St",
    capacity: 10000,
  }),
}).then((res) => res.json());

// Get items by category
const electronics = await fetch("/api/items?category=Electronics").then((res) =>
  res.json()
);
```

### Using React Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetch warehouses
const { data: warehouses } = useQuery({
  queryKey: ["warehouses"],
  queryFn: async () => {
    const res = await fetch("/api/warehouses");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
});

// Create warehouse
const createMutation = useMutation({
  mutationFn: async (data) => {
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create");
    return res.json();
  },
});
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing rate limiting middleware.

## Authentication

Currently, the API is not protected by authentication. For production use, implement proper authentication and authorization.
