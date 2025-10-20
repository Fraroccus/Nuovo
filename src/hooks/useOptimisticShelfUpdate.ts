"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShelfUpdatePayload } from "@/lib/shelves";
import { patchShelf } from "@/lib/shelves";

type Shelf = { id: string } & Record<string, unknown>;
type WarehouseCache = { shelves?: Shelf[] } & Record<string, unknown>;
type OptimisticCtx = { previous?: WarehouseCache };

/**
 * Provides an optimistic shelf update mutation using the warehouse query cache.
 * Assumes shelves are nested under the `warehouse` query result as `shelves`.
 */
export function useOptimisticShelfUpdate() {
  const queryClient = useQueryClient();

  return useMutation
    unknown,
    unknown,
    { id: string; data: ShelfUpdatePayload },
    OptimisticCtx
  >({
    mutationFn: async ({ id, data }) => patchShelf(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["warehouse"] });

      const previous = queryClient.getQueryData<WarehouseCache>(["warehouse"]);

      if (previous?.shelves) {
        const next: WarehouseCache = {
          ...previous,
          shelves: previous.shelves.map((s) => (s.id === id ? { ...s, ...data } : s)),
        };
        queryClient.setQueryData<WarehouseCache>(["warehouse"], next);
      }

      return { previous };
    },

    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData<WarehouseCache>(["warehouse"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });
}
