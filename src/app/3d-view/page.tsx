"use client";

import { WarehouseScene } from "@/components/3d/WarehouseScene";
import { useWarehouseStore } from "@/store/useWarehouseStore";

export default function ThreeDViewPage() {
  const { viewMode, setViewMode, selectedWarehouseId } = useWarehouseStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          3D Warehouse View
        </h1>
        <p className="text-gray-600">
          Interactive 3D visualization of warehouse layout and inventory
        </p>
      </div>

      {selectedWarehouseId && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          Selected warehouse: {selectedWarehouseId}
        </div>
      )}

      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setViewMode("3d")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            viewMode === "3d"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          3D View
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          List View
        </button>
      </div>

      {viewMode === "3d" ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <WarehouseScene />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <p className="text-center text-gray-600">
            List view - Switch to 3D view to see the warehouse visualization
          </p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Controls</h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Left click + drag: Rotate view</li>
            <li>• Right click + drag: Pan view</li>
            <li>• Scroll: Zoom in/out</li>
            <li>• Click on shelves to select and view details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
