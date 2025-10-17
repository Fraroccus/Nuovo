import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  InventoryItem,
  InventoryMutationInput,
  ShelfMetadata,
  ShelfMutationInput,
  WarehouseLayout,
} from "../types/warehouse";
import { useWarehouseStore } from "../store/warehouseStore";
import { useWarehouseApi } from "./client";

const clone = <T>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
};

const arrayToRecord = <T extends { id: string }>(items: T[]): Record<string, T> => {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
};

export const WAREHOUSE_QUERY_KEYS = {
  layout: ["warehouse", "layout"] as const,
  shelves: ["warehouse", "shelves"] as const,
  inventory: ["warehouse", "inventory"] as const,
};

type LayoutQueryOptions = Omit<
  UseQueryOptions<WarehouseLayout, Error, WarehouseLayout, typeof WAREHOUSE_QUERY_KEYS.layout>,
  "queryKey" | "queryFn"
>;

type ShelvesQueryOptions = Omit<
  UseQueryOptions<ShelfMetadata[], Error, ShelfMetadata[], typeof WAREHOUSE_QUERY_KEYS.shelves>,
  "queryKey" | "queryFn"
>;

type InventoryQueryOptions = Omit<
  UseQueryOptions<InventoryItem[], Error, InventoryItem[], typeof WAREHOUSE_QUERY_KEYS.inventory>,
  "queryKey" | "queryFn"
>;

type ShelfMutationContext = {
  previousShelves: Record<string, ShelfMetadata>;
};

type InventoryMutationContext = {
  previousInventory: Record<string, InventoryItem>;
};

type ShelfMutationOptions = Omit<
  UseMutationOptions<ShelfMetadata, Error, ShelfMutationInput, ShelfMutationContext>,
  "mutationFn"
>;

type InventoryMutationOptions = Omit<
  UseMutationOptions<InventoryItem, Error, InventoryMutationInput, InventoryMutationContext>,
  "mutationFn"
>;

const buildOptimisticShelf = (
  input: ShelfMutationInput,
  existing: ShelfMetadata | undefined,
): ShelfMetadata => ({
  ...(existing ?? {
    id: input.id,
    zoneId: input.zoneId,
    label: input.label ?? input.id,
    capacity: input.capacity ?? 0,
    occupiedCapacity: input.occupiedCapacity ?? 0,
    attributes: input.attributes ?? {},
    updatedAt: new Date().toISOString(),
  }),
  ...input,
  attributes: input.attributes ?? existing?.attributes ?? {},
  updatedAt: new Date().toISOString(),
});

const buildOptimisticInventory = (
  input: InventoryMutationInput,
  existing: InventoryItem | undefined,
): InventoryItem => ({
  ...(existing ?? {
    id: input.id,
    sku: input.sku ?? input.id,
    name: input.name ?? input.sku ?? input.id,
    quantity: input.quantity ?? 0,
    shelfId: input.shelfId ?? "",
    metadata: input.metadata ?? {},
    updatedAt: new Date().toISOString(),
  }),
  ...input,
  metadata: input.metadata ?? existing?.metadata ?? {},
  updatedAt: new Date().toISOString(),
});

export const useWarehouseLayoutQuery = (
  options?: LayoutQueryOptions,
): UseQueryResult<WarehouseLayout, Error> => {
  const api = useWarehouseApi();
  const setLayout = useWarehouseStore((state) => state.setLayout);

  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.layout,
    queryFn: () => api.fetchLayout(),
    ...(options ?? {}),
    onSuccess: (layout) => {
      setLayout(layout);
      options?.onSuccess?.(layout);
    },
  });
};

export const useShelvesQuery = (
  options?: ShelvesQueryOptions,
): UseQueryResult<ShelfMetadata[], Error> => {
  const api = useWarehouseApi();
  const replaceShelves = useWarehouseStore((state) => state.replaceShelves);

  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.shelves,
    queryFn: () => api.fetchShelves(),
    ...(options ?? {}),
    onSuccess: (shelves) => {
      replaceShelves(arrayToRecord(shelves));
      options?.onSuccess?.(shelves);
    },
  });
};

export const useInventoryQuery = (
  options?: InventoryQueryOptions,
): UseQueryResult<InventoryItem[], Error> => {
  const api = useWarehouseApi();
  const replaceInventory = useWarehouseStore((state) => state.replaceInventory);

  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.inventory,
    queryFn: () => api.fetchInventory(),
    ...(options ?? {}),
    onSuccess: (items) => {
      replaceInventory(arrayToRecord(items));
      options?.onSuccess?.(items);
    },
  });
};

export const useShelfMutation = (
  options?: ShelfMutationOptions,
): UseMutationResult<
  ShelfMetadata,
  Error,
  ShelfMutationInput,
  ShelfMutationContext
> => {
  const api = useWarehouseApi();
  const queryClient = useQueryClient();
  const upsertShelves = useWarehouseStore((state) => state.upsertShelves);
  const replaceShelves = useWarehouseStore((state) => state.replaceShelves);

  return useMutation({
    mutationFn: (input) => api.updateShelf(input),
    ...(options ?? {}),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: WAREHOUSE_QUERY_KEYS.shelves });
      const previousShelves = clone(
        useWarehouseStore.getState().shelves,
      ) as Record<string, ShelfMetadata>;
      const existing = previousShelves[input.id];
      const optimistic = buildOptimisticShelf(input, existing);
      upsertShelves([optimistic]);
      const userContext = await options?.onMutate?.(input);
      return {
        ...(userContext ?? {}),
        previousShelves,
      } satisfies ShelfMutationContext;
    },
    onError: (error, variables, context) => {
      if (context?.previousShelves) {
        replaceShelves(context.previousShelves);
      }
      options?.onError?.(error, variables, context);
    },
    onSuccess: (result, variables, context) => {
      upsertShelves([result]);
      options?.onSuccess?.(result, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.shelves });
      options?.onSettled?.(data, error, variables, context);
    },
  });
};

export const useInventoryMutation = (
  options?: InventoryMutationOptions,
): UseMutationResult<
  InventoryItem,
  Error,
  InventoryMutationInput,
  InventoryMutationContext
> => {
  const api = useWarehouseApi();
  const queryClient = useQueryClient();
  const upsertInventory = useWarehouseStore((state) => state.upsertInventory);
  const replaceInventory = useWarehouseStore((state) => state.replaceInventory);

  return useMutation({
    mutationFn: (input) => api.updateInventory(input),
    ...(options ?? {}),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: WAREHOUSE_QUERY_KEYS.inventory });
      const previousInventory = clone(
        useWarehouseStore.getState().inventory,
      ) as Record<string, InventoryItem>;
      const existing = previousInventory[input.id];
      const optimistic = buildOptimisticInventory(input, existing);
      upsertInventory([optimistic]);
      const userContext = await options?.onMutate?.(input);
      return {
        ...(userContext ?? {}),
        previousInventory,
      } satisfies InventoryMutationContext;
    },
    onError: (error, variables, context) => {
      if (context?.previousInventory) {
        replaceInventory(context.previousInventory);
      }
      options?.onError?.(error, variables, context);
    },
    onSuccess: (result, variables, context) => {
      upsertInventory([result]);
      options?.onSuccess?.(result, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.inventory });
      options?.onSettled?.(data, error, variables, context);
    },
  });
};
