# Warehouse Inventory Management API

A comprehensive backend API system built with Next.js 14, Prisma, and TypeScript for managing warehouses, shelves, and inventory items.

## Features

✅ **Full CRUD Operations** for warehouses, shelves, and items
✅ **Zod Validation** for all API endpoints
✅ **Transactional Support** for critical operations (shelf clearing, quantity adjustments, item moves)
✅ **Service Layer Abstraction** for clean architecture
✅ **Comprehensive Unit Tests** with Jest
✅ **Complete API Documentation** in OpenAPI/Markdown format
✅ **Capacity Management** with automatic validation
✅ **Statistics Endpoints** for monitoring utilization
✅ **Error Handling** with structured error responses

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Jest
- **Database**: PostgreSQL

## Project Structure

```
.
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/                # API route handlers
│   │   │   ├── warehouses/     # Warehouse endpoints
│   │   │   ├── shelves/        # Shelf endpoints
│   │   │   └── items/          # Item endpoints
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   └── lib/
│       ├── prisma.ts           # Prisma client singleton
│       ├── validations.ts      # Zod schemas
│       ├── api-utils.ts        # API utilities
│       └── services/           # Service layer
│           ├── warehouse.service.ts
│           ├── shelf.service.ts
│           ├── item.service.ts
│           └── __tests__/      # Unit tests
├── API_DOCUMENTATION.md        # Complete API documentation
├── package.json
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd warehouse-inventory-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_db?schema=public"
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Warehouses
- `GET /api/warehouses` - List all warehouses
- `GET /api/warehouses/{id}` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PATCH /api/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouses/{id}` - Delete warehouse
- `GET /api/warehouses/{id}/statistics` - Get warehouse statistics

### Shelves
- `GET /api/shelves` - List all shelves (optional: filter by warehouseId)
- `GET /api/shelves/{id}` - Get shelf by ID
- `POST /api/shelves` - Create shelf
- `PATCH /api/shelves/{id}` - Update shelf
- `DELETE /api/shelves/{id}` - Delete shelf
- `POST /api/shelves/{id}/clear` - Clear all items from shelf (transactional)
- `GET /api/shelves/{id}/statistics` - Get shelf statistics

### Items
- `GET /api/items` - List all items (optional: filter by shelfId)
- `GET /api/items/{id}` - Get item by ID
- `GET /api/items/sku/{sku}` - Get item by SKU
- `POST /api/items` - Create item
- `PATCH /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item
- `POST /api/items/{id}/adjust-quantity` - Adjust item quantity (transactional)
- `POST /api/items/{id}/move` - Move item to another shelf (transactional)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed documentation.

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Database Schema

### Warehouse
- Stores warehouse information (name, location, capacity)
- Has many shelves

### Shelf
- Stores shelf information (name, location, capacity)
- Belongs to a warehouse
- Has many items

### Item
- Stores inventory item information (name, SKU, quantity, description)
- Belongs to a shelf
- SKU is unique across the system

## Transactional Operations

The following operations use Prisma transactions to ensure data integrity:

1. **Clear Shelf** - Atomically removes all items from a shelf
2. **Adjust Quantity** - Atomically adjusts item quantity with capacity validation
3. **Move Item** - Atomically moves items between shelves with capacity validation and SKU merging

## Validation

All API endpoints use Zod schemas for request validation:

- Required fields are enforced
- Data types are validated
- Business rules are checked (positive integers, capacity limits, etc.)
- Foreign key references are validated

## Error Handling

All errors are caught and returned in a consistent format:

```json
{
  "error": "Error message",
  "details": []  // Optional validation details
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Database Management

View database with Prisma Studio:
```bash
npm run prisma:studio
```

Create a new migration:
```bash
npx prisma migrate dev --name <migration-name>
```

Reset database:
```bash
npx prisma migrate reset
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

MIT
