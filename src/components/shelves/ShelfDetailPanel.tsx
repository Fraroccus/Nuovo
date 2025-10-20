"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import {
  fetchShelfItems,
  createItem,
  adjustItemQuantity,
  removeItem,
} from "@/lib/items";

// ✅ Updated ItemDTO type with optional fields
type ItemDTO = {
  id: string;
  shelfId: string;
  name: string;
  sku?: string;
  quantity: number;
  price?: number;
  category?: string;
  description?: string;
};

type Shelf = {
  id: string;
  name: string;
};

type CreateItemPayload = {
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  price: number;
  category: string;
  shelfId: string;
};

type OptimisticContext = {
  previous: ItemDTO[] | undefined;
  shelfId: string;
};

async function fetchShelfMeta(id: string): Promise<Shelf> {
  const res = await fetch(`/api/shelves/${id}`);
  if (!res.ok) throw new Error("Failed to fetch shelf");
  const data = await res.json();
  return { id: data.id, name: data.name } as Shelf;
}

export function ShelfDetailPanel() {
  const selectedShelfId = useWarehouseStore((s) => s.selectedShelfId);
  const setSelectedShelf = useWarehouseStore((s) => s.setSelectedShelf);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedShelfId) {
      setMessage(null);
      setErrorMessage(null);
    }
  }, [selectedShelfId]);

  const shelfQuery = useQuery({
    queryKey: ["shelf", selectedShelfId],
    queryFn: () => fetchShelfMeta(selectedShelfId as string),
    enabled: !!selectedShelfId,
  });

  const itemsQuery = useQuery({
    queryKey: ["items", { shelfId: selectedShelfId }],
    queryFn: () => fetchShelfItems(selectedShelfId as string),
    enabled: !!selectedShelfId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["items", { shelfId: selectedShelfId }],
    });
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["warehouse"] });
  };

  const addMutation = useMutation<
    ItemDTO,
    Error,
    CreateItemPayload,
    OptimisticContext
  >({
    mutationFn: createItem,
    onMutate: async (vars) => {
      setMessage(null);
      setErrorMessage(null);
      await queryClient.cancelQueries({
        queryKey: ["items", { shelfId: vars.shelfId }],
      });
      const previous = queryClient.getQueryData<ItemDTO[]>([
        "items",
        { shelfId: vars.shelfId },
      ]);
      const optimistic: ItemDTO = {
        id: `temp-${Date.now()}`,
        name: vars.name,
        sku: vars.sku,
        description: vars.description ?? undefined,
        quantity: vars.quantity,
        price: vars.price,
        category: vars.category,
        shelfId: vars.shelfId,
      };
      queryClient.setQueryData<ItemDTO[]>(
        ["items", { shelfId: vars.shelfId }],
        (old) => (old ? [optimistic, ...old] : [optimistic])
      );
      return { previous, shelfId: vars.shelfId };
    },
    onError: (_err: Error, _vars, ctx) => {
      if (ctx) {
        queryClient.setQueryData(
          ["items", { shelfId: ctx.shelfId }],
          ctx.previous
        );
      }
      setErrorMessage(_err.message);
    },
    onSuccess: (_data: ItemDTO) => {
      setMessage("Item added");
    },
    onSettled: () => {
      invalidateAll();
    },
  });

  const adjustMutation = useMutation<
    ItemDTO,
    Error,
    { id: string; delta: number },
    OptimisticContext
  >({
    mutationFn: ({ id, delta }) => adjustItemQuantity(id, delta),
    onMutate: async ({ id, delta }) => {
      setMessage(null);
      setErrorMessage(null);
      const shelfId = selectedShelfId as string;
      await queryClient.cancelQueries({ queryKey: ["items", { shelfId }] });
      const previous = queryClient.getQueryData<ItemDTO[]>([
        "items",
        { shelfId },
      ]);
      queryClient.setQueryData<ItemDTO[]>(["items", { shelfId }], (old) => {
        if (!old) return old;
        return old.map((it) =>
          it.id === id
            ? { ...it, quantity: Math.max(0, (it.quantity ?? 0) + delta) }
            : it
        );
      });
      return { previous, shelfId };
    },
    onError: (_err: Error, _vars, ctx) => {
      if (ctx)
        queryClient.setQueryData(
          ["items", { shelfId: ctx.shelfId }],
          ctx.previous
        );
      setErrorMessage(_err.message);
    },
    onSuccess: (_data: ItemDTO) => setMessage("Quantity updated"),
    onSettled: () => invalidateAll(),
  });

  const removeMutation = useMutation<void, Error, string, OptimisticContext>({
    mutationFn: (id) => removeItem(id),
    onMutate: async (id) => {
      setMessage(null);
      setErrorMessage(null);
      const shelfId = selectedShelfId as string;
      await queryClient.cancelQueries({ queryKey: ["items", { shelfId }] });
      const previous = queryClient.getQueryData<ItemDTO[]>([
        "items",
        { shelfId },
      ]);
      queryClient.setQueryData<ItemDTO[]>(
        ["items", { shelfId }],
        (old) => old?.filter((it) => it.id !== id) ?? old
      );
      return { previous, shelfId };
    },
    onError: (_err: Error, _vars, ctx) => {
      if (ctx)
        queryClient.setQueryData(
          ["items", { shelfId: ctx.shelfId }],
          ctx.previous
        );
      setErrorMessage(_err.message);
    },
    onSuccess: () => setMessage("Item removed"),
    onSettled: () => invalidateAll(),
  });

  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: 0,
    price: 0,
    category: "General",
    description: "",
  });

  const canSubmit = useMemo(() => {
    return (
      !!selectedShelfId &&
      form.name.trim().length > 0 &&
      form.sku.trim().length > 0 &&
      form.category.trim().length > 0 &&
      form.quantity >= 0 &&
      form.price >= 0
    );
  }, [form, selectedShelfId]);

  if (!selectedShelfId) return null;

  const isLoading = shelfQuery.isLoading || itemsQuery.isLoading;
  const hasError = shelfQuery.error || itemsQuery.error;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/20"
    >
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {shelfQuery.data?.name ?? "Shelf"}
            </h2>
            <p className="text-sm text-gray-500">Inventory management</p>
          </div>
          <button
            onClick={() => setSelectedShelf(null)}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            Loading shelf and items…
          </div>
        ) : hasError ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load shelf data.
          </div>
        ) : (
          <>
            {message && (
              <div
                data-testid="status-success"
                className="mb-2 rounded-md bg-green-50 p-2 text-green-800"
              >
                {message}
              </div>
            )}
            {errorMessage && (
              <div
                data-testid="status-error"
                className="mb-2 rounded-md bg-red-50 p-2 text-red-800"
              >
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (!selectedShelfId || !canSubmit) return;
                addMutation.mutate({
                  name: form.name.trim(),
                  sku: form.sku.trim(),
                  description: form.description?.trim() || null,
                  quantity: form.quantity,
                  price: form.price,
                  category: form.category.trim(),
                  shelfId: selectedShelfId,
                });
                setForm({
                  name: "",
                  sku: "",
                  description: "",
                  quantity: 0,
                  price: 0,
                  category: "General",
                });
              }}
              className="mb-4 space-y-2 rounded-md border border-gray-200 p-3"
            >
              <h3 className="text-sm font-medium text-gray-800">Add Item</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Name"
                  placeholder="Name"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  disabled={addMutation.isPending}
                />
                <input
                  aria-label="SKU"
                  placeholder="SKU"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.sku}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  disabled={addMutation.isPending}
                />
                <select
                  aria-label="Category"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  disabled={addMutation.isPending}
                >
                  <option>General</option>
                  <option>Electronics</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
                <input
                  aria-label="Price"
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  disabled={addMutation.isPending}
                />
                <input
                  aria-label="Quantity"
                  placeholder="Quantity"
                  type="number"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                  }
                  disabled={addMutation.isPending}
                />
                <textarea
                  aria-label="Description"
                  placeholder="Description"
                  className="col-span-2 rounded border px-2 py-1 text-sm"
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  disabled={addMutation.isPending}
                />
              </div>
              <button
                data-testid="btn-add-item"
                type="submit"
                disabled={!canSubmit || addMutation.isPending}
                className={`rounded-md px-3 py-1 text-sm font-medium text-white ${
                  !canSubmit || addMutation.isPending
                    ? "bg-blue-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {addMutation.isPending ? "Adding…" : "Add Item"}
              </button>
            </form>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-800">Items</h3>
              {itemsQuery.data && itemsQuery.data.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
                  No items on this shelf.
                </div>
              ) : (
                <ul className="space-y-2">
                  {itemsQuery.data?.map((item: ItemDTO) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-gray-200 p-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {item.sku}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          aria-label={`Decrease ${item.name}`}
                          onClick={() =>
                            adjustMutation.mutate({ id: item.id, delta: -1 })
                          }
                          disabled={adjustMutation.isPending}
                          className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          -
                        </button>
                        <div className="w-10 text-center text-sm">
                          {item.quantity}
                        </div>
                        <button
                          aria-label={`Increase ${item.name}`}
                          onClick={() =>
                            adjustMutation.mutate({ id: item.id, delta: 1 })
                          }
                          disabled={adjustMutation.isPending}
                          className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeMutation.mutate(item.id)}
                          disabled={removeMutation.isPending}
                          className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
