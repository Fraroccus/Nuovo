"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  width: z.coerce.number().int().positive().optional(),
  length: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  gridSize: z.coerce.number().int().positive().optional(),
});

const DEFAULTS = {
  width: 10,
  length: 10,
  height: 5,
  gridSize: 1,
};

export function AddWarehouseModal() {
  const {
    isAddWarehouseModalOpen,
    closeAddWarehouseModal,
    setSelectedWarehouse,
  } = useWarehouseStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      width: DEFAULTS.width,
      length: DEFAULTS.length,
      height: DEFAULTS.height,
      gridSize: DEFAULTS.gridSize,
    },
  });

  useEffect(() => {
    if (!isAddWarehouseModalOpen) {
      reset({
        name: "",
        width: DEFAULTS.width,
        length: DEFAULTS.length,
        height: DEFAULTS.height,
        gridSize: DEFAULTS.gridSize,
      });
    }
  }, [isAddWarehouseModalOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const payload = {
        name: data.name,
        width: data.width ?? DEFAULTS.width,
        length: data.length ?? DEFAULTS.length,
        height: data.height ?? DEFAULTS.height,
        gridSize: data.gridSize ?? DEFAULTS.gridSize,
      };

      const res = await fetch("/api/warehouse", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create warehouse");
      }
      return res.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["warehouses"] });
      const previous = queryClient.getQueryData<any[]>(["warehouses"]);
      const optimistic = {
        id: `temp-${Date.now()}`,
        name: variables.name,
        location: "",
        description: null,
        capacity: 0,
        width: variables.width ?? DEFAULTS.width,
        length: variables.length ?? DEFAULTS.length,
        height: variables.height ?? DEFAULTS.height,
        gridSize: variables.gridSize ?? DEFAULTS.gridSize,
        _count: { shelves: 0 },
      };
      queryClient.setQueryData<any[]>(
        ["warehouses"],
        (old) => [optimistic, ...(old || [])]
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["warehouses"], context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setSelectedWarehouse(data.id);
      closeAddWarehouseModal();
      router.push("/warehouses");
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  if (!isAddWarehouseModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Warehouse
          </h2>
          <button
            aria-label="Close"
            onClick={closeAddWarehouseModal}
            className="rounded p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register("name")}
              placeholder="Central Warehouse"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Width
              </label>
              <input
                type="number"
                {...register("width")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Length
              </label>
              <input
                type="number"
                {...register("length")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Height
              </label>
              <input
                type="number"
                {...register("height")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Grid Size
              </label>
              <input
                type="number"
                {...register("gridSize")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAddWarehouseModal}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
