# Contributing Guide

Thank you for your interest in contributing to Warehouse Manager! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/project.git
   cd project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature/fix

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Run linting and formatting

   ```bash
   npm run lint
   npm run format
   ```

4. Write tests for new features

   ```bash
   npm test
   ```

5. Commit your changes with clear messages

   ```bash
   git commit -m "feat: add new feature"
   ```

6. Push to your fork and create a Pull Request

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types for all function parameters and return values
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object types

### React Components

- Use functional components with hooks
- Add `"use client"` directive for client components
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks

### Naming Conventions

- Components: PascalCase (e.g., `WarehouseList.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: Tailwind utility classes

### File Structure

- Components in `/src/components`
- Pages in `/src/app`
- API routes in `/src/app/api`
- Utilities in `/src/lib`
- Types in `/src/types`
- Tests co-located with components or in `__tests__`

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles
- Group related classes logically
- Use responsive design utilities

### Comments

- Write self-documenting code when possible
- Add comments for complex logic
- Document all public APIs
- Use JSDoc for function documentation

## Testing

### Writing Tests

- Use Jest and React Testing Library
- Test user interactions, not implementation details
- Aim for high coverage on critical paths
- Mock external dependencies

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

## Database Changes

### Creating Migrations

1. Update the Prisma schema in `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npm run db:migrate
   ```
3. Update the seed script if necessary
4. Test the migration thoroughly

### Seed Data

- Keep seed data realistic and useful
- Update seed script when schema changes
- Document any new seed data

## API Development

### Creating New Endpoints

1. Create route handler in `/src/app/api`
2. Use proper HTTP methods (GET, POST, PUT, DELETE)
3. Return appropriate status codes
4. Handle errors gracefully
5. Add TypeScript types for request/response

### Error Handling

```typescript
try {
  // Your code
  return NextResponse.json(data);
} catch (error) {
  console.error("Error description:", error);
  return NextResponse.json({ error: "User-friendly message" }, { status: 500 });
}
```

## Commit Message Guidelines

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:

```
feat: add warehouse filtering
fix: resolve item deletion cascade issue
docs: update API documentation
```

## Pull Request Process

1. Update documentation for any API changes
2. Ensure all tests pass
3. Update the README if needed
4. Fill out the PR template completely
5. Request review from maintainers
6. Address review feedback promptly

## Code Review Guidelines

### For Contributors

- Be open to feedback
- Explain your approach
- Keep PRs focused and reasonably sized
- Respond to comments constructively

### For Reviewers

- Be respectful and constructive
- Focus on code quality and maintainability
- Suggest improvements, don't just criticize
- Approve when ready, request changes when needed

## Performance Considerations

- Optimize database queries (use `select` to limit fields)
- Implement pagination for large datasets
- Use React Query for efficient data caching
- Lazy load components when appropriate
- Optimize images and assets

## Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before database operations
- Follow OWASP security guidelines

## Questions?

If you have questions:

- Check existing issues and discussions
- Review the documentation
- Open a new discussion
- Reach out to maintainers

Thank you for contributing! 🎉
