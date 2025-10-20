# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database (if using local PostgreSQL)
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Using Prisma Dev Database

The project comes with `.env` pre-configured to use Prisma's local development database. To start it:

```bash
npx prisma dev
```

This will start a local PostgreSQL instance that's perfect for development.

## Project Architecture

### Frontend Architecture

- **Next.js App Router**: File-based routing in `/src/app`
- **React Query**: Server state management and caching
- **Zustand**: Client state management
- **Tailwind CSS**: Utility-first styling

### Backend Architecture

- **Next.js API Routes**: RESTful API in `/src/app/api`
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Relational database

### 3D Visualization

- **React Three Fiber**: React renderer for Three.js
- **Drei**: Helper components for R3F
- **Three.js**: 3D graphics library

## Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── warehouses/        # Warehouse pages
│   ├── items/             # Items pages
│   ├── 3d-view/           # 3D visualization
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components
│   └── 3d/               # 3D components
├── lib/                   # Utilities and config
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── __tests__/            # Test files
```

## Common Development Tasks

### Adding a New Page

1. Create file in `src/app/[route]/page.tsx`
2. Export default React component
3. Add navigation link in Header component

### Adding an API Endpoint

1. Create route handler in `src/app/api/[route]/route.ts`
2. Export HTTP method handlers (GET, POST, etc.)
3. Use Prisma client from `@/lib/prisma`

### Adding a Database Model

1. Update `prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Update seed script if needed
4. Add TypeScript types in `src/types`

### Creating a Component

1. Create file in `src/components/[category]/ComponentName.tsx`
2. Add `"use client"` if component uses hooks/interactivity
3. Use Tailwind CSS for styling
4. Export component

### Adding State Management

For local component state:

- Use React `useState` or `useReducer`

For shared client state:

- Create/update Zustand store in `src/store`

For server state:

- Use React Query in components

### Writing Tests

1. Create test file alongside component or in `__tests__`
2. Import testing utilities from `@testing-library/react`
3. Test user interactions, not implementation
4. Run tests: `npm test`

## Working with the Database

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

### Database Migrations

Create a migration:

```bash
npm run db:migrate
```

Push schema without migration (dev only):

```bash
npm run db:push
```

Reset database (dev only):

```bash
npx prisma migrate reset
```

### Seeding Data

Run seed script:

```bash
npm run db:seed
```

Edit seed data in `prisma/seed.ts`

## Debugging

### Server-side Debugging

Add console.logs in API routes or server components:

```typescript
console.log("Debug data:", data);
```

View logs in terminal where dev server is running.

### Client-side Debugging

Use browser DevTools:

- React DevTools for component inspection
- Network tab for API requests
- Console for logs

### Database Queries

Enable Prisma query logging in `src/lib/prisma.ts`:

```typescript
log: ["query", "error", "warn"];
```

### React Query DevTools

Built-in and available in dev mode. Look for floating icon in bottom corner.

## Code Quality

### Linting

```bash
npm run lint           # Check for issues
npm run lint -- --fix  # Auto-fix issues
```

### Formatting

```bash
npm run format         # Format all files
```

### Type Checking

```bash
npx tsc --noEmit      # Check TypeScript types
```

## Performance Tips

### Database Queries

- Use `select` to limit returned fields
- Add indexes for frequently queried fields
- Use pagination for large datasets
- Leverage React Query caching

### React Performance

- Use React.memo for expensive renders
- Implement proper key props in lists
- Lazy load heavy components
- Optimize images with next/image

### 3D Performance

- Keep polygon count reasonable
- Use LOD (Level of Detail) for complex scenes
- Implement frustum culling
- Use instancing for repeated objects

## Environment Variables

Create `.env` file with:

```env
# Required
DATABASE_URL="postgresql://..."

# Optional
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify credentials and database exists
4. Run `npm run db:generate`

### Build Errors

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npx tsc --noEmit`

### 3D Rendering Issues

1. Check browser WebGL support
2. Verify Three.js and R3F versions are compatible
3. Check browser console for errors
4. Ensure components have proper suspense boundaries

### Test Failures

1. Update snapshots if intentional: `npm test -- -u`
2. Clear Jest cache: `npx jest --clearCache`
3. Check test isolation
4. Verify mocks are properly set up

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
