"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShelfUpdatePayload } from "@/lib/shelves";
import { patchShelf } from "@/lib/shelves";

// Type definitions
type ShelfShape = { id: string } & Record<string, unknown>;

type WarehouseData = {
  shelves: ShelfShape[];
} & Record<string, unknown>;

type OptimisticCtx = {
  previous?: WarehouseData;
};

/**
 * Provides an optimistic shelf update mutation using the warehouse query cache.
 * Assumes shelves are nested under the `warehouse` query result as `shelves`.
 */
export function useOptimisticShelfUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShelfUpdatePayload }) =>
      patchShelf(id, data),
      
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["warehouse"] });
      
      const previous = queryClient.getQueryData<WarehouseData>(["warehouse"]);
      
      // Optimistically update shelf in cache
      if (previous?.shelves) {
        queryClient.setQueryData<WarehouseData>(["warehouse"], {
          ...previous,
          shelves: previous.shelves.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        });
      }
      
      return { previous } satisfies OptimisticCtx;
    },
    
    onError: (_error, _vars, context?: OptimisticCtx) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(["warehouse"], context.previous);
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });
}
