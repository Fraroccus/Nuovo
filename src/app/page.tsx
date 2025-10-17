export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Warehouse Inventory Management API</h1>
        <p className="text-lg mb-8">
          Backend APIs for managing warehouses, shelves, and inventory items.
        </p>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><code>/api/warehouses</code> - Warehouse management</li>
            <li><code>/api/shelves</code> - Shelf management</li>
            <li><code>/api/items</code> - Item management</li>
          </ul>
          <p className="mt-6">
            See <a href="/API_DOCUMENTATION.md" className="text-blue-600 underline">API Documentation</a> for details.
          </p>
        </div>
      </div>
    </main>
  )
}
