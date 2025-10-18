import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Warehouse Manager
            </Link>
            <nav className="hidden space-x-6 md:flex">
              <Link
                href="/warehouses"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Warehouses
              </Link>
              <Link
                href="/items"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Items
              </Link>
              <Link
                href="/3d-view"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                3D View
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Add Warehouse
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
