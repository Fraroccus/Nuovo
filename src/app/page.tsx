import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Warehouse Manager
        </h1>
        <p className="mb-12 text-xl text-gray-600">
          A modern 3D warehouse management system with real-time inventory
          tracking, interactive visualizations, and powerful data management
          capabilities.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <Link
            href="/warehouses"
            className="rounded-lg border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">🏭</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Warehouses
            </h2>
            <p className="text-sm text-gray-600">
              Manage and monitor all warehouse locations
            </p>
          </Link>

          <Link
            href="/items"
            className="rounded-lg border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">📦</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Inventory
            </h2>
            <p className="text-sm text-gray-600">
              Track items across all locations
            </p>
          </Link>

          <Link
            href="/3d-view"
            className="rounded-lg border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <div className="mb-4 text-4xl">🎯</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              3D View
            </h2>
            <p className="text-sm text-gray-600">
              Visualize warehouses in 3D space
            </p>
          </Link>
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-6 text-left">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Real-time Data
              </h3>
              <p className="text-sm text-gray-600">
                Built with React Query for efficient data fetching and caching
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 text-left">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                3D Visualization
              </h3>
              <p className="text-sm text-gray-600">
                Interactive 3D warehouse views using Three.js and React Three
                Fiber
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 text-left">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                State Management
              </h3>
              <p className="text-sm text-gray-600">
                Powered by Zustand for lightweight and efficient state handling
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 text-left">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Type-safe Database
              </h3>
              <p className="text-sm text-gray-600">
                PostgreSQL with Prisma ORM for robust data integrity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
