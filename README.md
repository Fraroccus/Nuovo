# Warehouse Manager - 3D Inventory Management System

A modern, full-stack warehouse management application built with Next.js 15, featuring 3D visualization, real-time data management, and a comprehensive tech stack.

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - App Router for modern React development
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query (@tanstack/react-query)** - Data fetching and caching
- **Zustand** - Lightweight state management
- **React Three Fiber + Drei** - 3D visualization with Three.js
- **Jest + React Testing Library** - Testing framework

### Backend

- **Prisma** - Type-safe ORM
- **PostgreSQL** - Robust relational database
- **Next.js API Routes** - RESTful API endpoints

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **tsx** - TypeScript execution for scripts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db?schema=public"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Set up the database**

   Generate Prisma Client:

   ```bash
   npm run db:generate
   ```

   Run migrations:

   ```bash
   npm run db:migrate
   ```

   Seed the database with sample data:

   ```bash
   npm run db:seed
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database Schema

### Warehouse

- `id` - Unique identifier (CUID)
- `name` - Warehouse name
- `location` - Physical location
- `description` - Optional description
- `capacity` - Storage capacity
- `shelves` - Related shelves (one-to-many)

### Shelf

- `id` - Unique identifier (CUID)
- `name` - Shelf name/identifier
- `section` - Section within warehouse
- `level` - Shelf level/height
- `capacity` - Shelf capacity
- `warehouseId` - Foreign key to warehouse
- `items` - Related items (one-to-many)

### Item

- `id` - Unique identifier (CUID)
- `name` - Item name
- `sku` - Unique stock keeping unit
- `description` - Optional description
- `quantity` - Current quantity
- `price` - Item price
- `category` - Item category
- `shelfId` - Foreign key to shelf

## 🎨 Project Structure

```
project/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── warehouses/
│   │   │   ├── shelves/
│   │   │   └── items/
│   │   ├── warehouses/    # Warehouses pages
│   │   ├── items/         # Items pages
│   │   ├── 3d-view/       # 3D visualization page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── layout/        # Layout components
│   │   └── 3d/            # 3D visualization components
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   └── providers.tsx  # React Query provider
│   ├── store/
│   │   └── useWarehouseStore.ts  # Zustand store
│   └── __tests__/         # Test files
├── public/                # Static assets
├── .env.example           # Example environment variables
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup
├── .prettierrc            # Prettier configuration
└── eslint.config.mjs      # ESLint configuration
```

## 🎯 Features

### Current Features

- **Warehouse Management** - Create, view, and manage warehouse locations
- **Inventory Tracking** - Track items across all warehouse locations
- **3D Visualization** - Interactive 3D view of warehouse layouts
- **Real-time Data** - Efficient data fetching with React Query
- **Type Safety** - Full TypeScript support with Prisma
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

### API Endpoints

#### Warehouses

- `GET /api/warehouses` - List all warehouses
- `POST /api/warehouses` - Create a warehouse
- `GET /api/warehouses/[id]` - Get warehouse details
- `DELETE /api/warehouses/[id]` - Delete a warehouse

#### Shelves

- `GET /api/shelves/[id]` - Get shelf details with items

#### Items

- `GET /api/items` - List all items (supports filtering by shelfId and category)

## 🧪 Testing

The project uses Jest and React Testing Library for testing.

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🎨 Styling

The project uses Tailwind CSS for styling. The configuration supports:

- Custom color schemes
- Dark mode support
- Custom fonts (Geist Sans and Geist Mono)
- Responsive design utilities

## 🔧 Configuration Files

### Environment Variables

See `.env.example` for required environment variables.

### Prisma

Database configuration and schema are in `prisma/schema.prisma`.

### ESLint

ESLint configuration is in `eslint.config.mjs` with Next.js and Prettier integration.

### Prettier

Code formatting rules are defined in `.prettierrc`.

### TypeScript

TypeScript configuration is in `tsconfig.json`.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure you:

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Build the application: `npm run build`
5. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions, please open an issue in the repository.
