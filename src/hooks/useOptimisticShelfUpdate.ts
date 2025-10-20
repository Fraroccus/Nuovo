"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShelfUpdatePayload } from "@/lib/shelves";
import { patchShelf } from "@/lib/shelves";

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
      const previous = queryClient.getQueryData<any>(["warehouse"]);

      // Optimistically update shelf in cache
      if (previous?.shelves) {
        const next = {
          ...previous,
          shelves: previous.shelves.map((s: any) =>
            s.id === id ? { ...s, ...data } : s
          ),
        };
        queryClient.setQueryData(["warehouse"], next);
      }

      return { previous } as const;
    },
    onError: (_error, _vars, context) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(["warehouse"], context.previous);
      }
    },
    onSettled: () => {
      // Optionally refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["warehouse"] });
    },
  });
}
