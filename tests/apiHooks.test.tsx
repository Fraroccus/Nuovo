import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { FC, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useInventoryMutation,
  useInventoryQuery,
  useShelfMutation,
  useShelvesQuery,
  useWarehouseLayoutQuery,
} from "../src/api/hooks";
import {
  WarehouseApiProvider,
  type WarehouseApiClient,
} from "../src/api/client";
import {
  resetWarehouseStore,
  useWarehouseStore,
} from "../src/store/warehouseStore";
import type {
  InventoryItem,
  ShelfMetadata,
  WarehouseLayout,
} from "../src/types/warehouse";

const layout: WarehouseLayout = {
  id: "layout-test",
  name: "Test Layout",
  updatedAt: new Date().toISOString(),
  zones: [],
};

const shelves: ShelfMetadata[] = [
  {
    id: "shelf-test",
    zoneId: "zone-1",
    label: "Test Shelf",
    capacity: 100,
    occupiedCapacity: 10,
    updatedAt: new Date().toISOString(),
    attributes: {},
  },
];

const inventory: InventoryItem[] = [
  {
    id: "item-test",
    sku: "SKU-TEST",
    name: "Gadget",
    quantity: 5,
    shelfId: "shelf-test",
    updatedAt: new Date().toISOString(),
  },
];

type WrapperProps = {
  children: ReactNode;
};

describe("react-query integration hooks", () => {
  let queryClient: QueryClient;
  let apiClient: WarehouseApiClient;

  const createWrapper = (): FC<WrapperProps> => ({ children }) => (
    <WarehouseApiProvider client={apiClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WarehouseApiProvider>
  );

  beforeEach(() => {
    resetWarehouseStore();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    apiClient = {
      fetchLayout: vi.fn().mockResolvedValue(layout),
      fetchShelves: vi.fn().mockResolvedValue(shelves),
      fetchInventory: vi.fn().mockResolvedValue(inventory),
      updateShelf: vi.fn(),
      updateInventory: vi.fn(),
    } satisfies WarehouseApiClient;
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("hydrates the store when queries resolve", async () => {
    const wrapper = createWrapper();

    const { result: layoutQuery } = renderHook(
      () => useWarehouseLayoutQuery(),
      { wrapper },
    );
    await waitFor(() => expect(layoutQuery.current.isSuccess).toBe(true));

    expect(useWarehouseStore.getState().layout).toEqual(layout);

    const { result: shelvesQuery } = renderHook(() => useShelvesQuery(), {
      wrapper,
    });
    await waitFor(() => expect(shelvesQuery.current.isSuccess).toBe(true));

    expect(Object.keys(useWarehouseStore.getState().shelves)).toContain(
      "shelf-test",
    );

    const { result: inventoryQuery } = renderHook(() => useInventoryQuery(), {
      wrapper,
    });
    await waitFor(() => expect(inventoryQuery.current.isSuccess).toBe(true));

    expect(Object.keys(useWarehouseStore.getState().inventory)).toContain(
      "item-test",
    );
  });

  it("applies optimistic updates when mutating shelves", async () => {
    const serverShelf: ShelfMetadata = {
      ...shelves[0],
      label: "Server Shelf",
      updatedAt: new Date().toISOString(),
    };

    let resolveMutation: (value: ShelfMetadata) => void;
    apiClient.updateShelf = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<ShelfMetadata>((resolve) => {
            resolveMutation = resolve;
          }),
      );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useShelfMutation(), { wrapper });

    act(() => {
      result.current.mutate({
        id: shelves[0].id,
        zoneId: shelves[0].zoneId,
        label: "Optimistic Shelf",
      });
    });

    const optimisticShelf = useWarehouseStore.getState().shelves[shelves[0].id];
    expect(optimisticShelf.label).toBe("Optimistic Shelf");

    act(() => {
      resolveMutation!(serverShelf);
    });

    await waitFor(() =>
      expect(useWarehouseStore.getState().shelves[shelves[0].id].label).toBe(
        "Server Shelf",
      ),
    );
  });

  it("rolls back optimistic inventory updates when mutations fail", async () => {
    resetWarehouseStore();
    useWarehouseStore.getState().upsertInventory(inventory);

    const error = new Error("Network failure");
    apiClient.updateInventory = vi.fn().mockRejectedValue(error);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useInventoryMutation(), { wrapper });

    const mutatePromise = act(async () => {
      await expect(
        result.current.mutateAsync({
          id: inventory[0].id,
          quantity: 100,
        }),
      ).rejects.toThrow("Network failure");
    });

    await mutatePromise;

    const state = useWarehouseStore.getState();
    expect(state.inventory[inventory[0].id].quantity).toBe(
      inventory[0].quantity,
    );
  });
});
