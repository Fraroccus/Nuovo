"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  capacity: number;
  _count: {
    shelves: number;
  };
}

async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch("/api/warehouses");
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  return res.json();
}

export default function WarehousesPage() {
  const {
    data: warehouses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: fetchWarehouses,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading warehouses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Error loading warehouses. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Warehouse
        </button>
      </div>

      {warehouses && warehouses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg text-gray-600">No warehouses found.</p>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first warehouse.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {warehouses?.map((warehouse) => (
            <Link
              key={warehouse.id}
              href={`/warehouses/${warehouse.id}`}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {warehouse.name}
              </h2>
              <p className="mb-4 text-sm text-gray-600">{warehouse.location}</p>
              {warehouse.description && (
                <p className="mb-4 text-sm text-gray-500">
                  {warehouse.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Capacity: {warehouse.capacity.toLocaleString()}
                </span>
                <span className="text-gray-600">
                  {warehouse._count.shelves} shelves
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
