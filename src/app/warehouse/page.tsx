"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { WarehouseScene } from "@/components/3d/WarehouseScene";
import { useWarehouseStore } from "@/store/useWarehouseStore";

interface Shelf {
  id: string;
  name: string;
  section: string;
  level: number;
  _count?: { items: number };
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  capacity: number;
  width: number;
  length: number;
  height: number;
  gridSize: number;
  shelves: Shelf[];
}

async function fetchDefaultWarehouse(): Promise<Warehouse> {
  const res = await fetch("/api/warehouse");
  if (!res.ok) throw new Error("Failed to fetch default warehouse");
  return res.json();
}

export default function WarehouseDashboardPage() {
  const { warehouseId, setWarehouseId, selectedShelfId, setSelectedShelf, viewMode, setViewMode } = useWarehouseStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["warehouse"],
    queryFn: fetchDefaultWarehouse,
  });

  useEffect(() => {
    if (data?.id && warehouseId !== data.id) {
      setWarehouseId(data.id);
    }
  }, [data?.id, setWarehouseId, warehouseId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading warehouse...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Error loading warehouse. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-gray-600">Unified warehouse dashboard</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("2d")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              viewMode === "2d" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            2D View
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              viewMode === "3d" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            3D View
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-9">
          {viewMode === "3d" ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <WarehouseScene />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
              2D warehouse view placeholder
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Shelves</h2>
            {data.shelves.length === 0 ? (
              <p className="text-sm text-gray-600">No shelves configured.</p>
            ) : (
              <ul className="space-y-2">
                {data.shelves.map((shelf) => (
                  <li key={shelf.id}>
                    <button
                      onClick={() => setSelectedShelf(shelf.id)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                        selectedShelfId === shelf.id
                          ? "bg-blue-50 text-blue-800"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{shelf.name}</span>
                        {shelf._count?.items ? (
                          <span className="text-xs text-gray-500">{shelf._count.items} items</span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
