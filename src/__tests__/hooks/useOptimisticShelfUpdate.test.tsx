import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOptimisticShelfUpdate } from "@/hooks/useOptimisticShelfUpdate";

function setup(initialData: any) {
  const qc = new QueryClient();
  qc.setQueryData(["warehouse"], initialData);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { wrapper, qc };
}

describe("useOptimisticShelfUpdate", () => {
  const initialWarehouse = {
    id: "w1",
    name: "W",
    gridSize: 1,
    shelves: [
      {
        id: "s1",
        name: "S1",
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        width: 2,
        depth: 1,
        height: 3,
      },
    ],
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("applies optimistic update and persists on success", async () => {
    const { wrapper, qc } = setup(initialWarehouse);

    const newData = { positionX: 4, width: 3 };

    const mockFetch = jest.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({ ...initialWarehouse.shelves[0], ...newData }),
    } as any);

    const { result } = renderHook(() => useOptimisticShelfUpdate(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ id: "s1", data: newData });
    });

    // Verify fetch called
    expect(mockFetch).toHaveBeenCalled();

    // Verify cache contains updated data
    const updated = qc.getQueryData(["warehouse"]) as any;
    expect(updated.shelves[0].positionX).toBe(4);
    expect(updated.shelves[0].width).toBe(3);
  });

  it("rolls back cache on error", async () => {
    const { wrapper, qc } = setup(initialWarehouse);

    const newData = { positionX: 10, width: 5 };

    const mockFetch = jest.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "nope" }),
    } as any);

    const { result } = renderHook(() => useOptimisticShelfUpdate(), {
      wrapper,
    });

    // Kick off mutation and expect it to throw
    await expect(
      act(async () => {
        await result.current.mutateAsync({ id: "s1", data: newData });
      })
    ).rejects.toThrow();

    // After rollback, cache should be original
    const after = qc.getQueryData(["warehouse"]) as any;
    expect(after.shelves[0].positionX).toBe(0);
    expect(after.shelves[0].width).toBe(2);

    expect(mockFetch).toHaveBeenCalled();
  });
});
