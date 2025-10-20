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
                href="/warehouse"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Warehouse
              </Link>
              <Link
                href="/items"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Items
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
