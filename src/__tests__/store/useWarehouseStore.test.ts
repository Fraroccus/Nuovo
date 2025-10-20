import { act } from "@testing-library/react";
import { useWarehouseStore } from "@/store/useWarehouseStore";

describe("useWarehouseStore", () => {
  beforeEach(() => {
    const { setState } = useWarehouseStore;
    act(() =>
      setState({
        warehouseId: null,
        selectedShelfId: null,
        viewMode: "2d",
      } as any)
    );
  });

  it("sets warehouse id", () => {
    act(() => useWarehouseStore.getState().setWarehouseId("abc"));
    expect(useWarehouseStore.getState().warehouseId).toBe("abc");
  });

  it("sets selected shelf id", () => {
    act(() => useWarehouseStore.getState().setSelectedShelf("s1"));
    expect(useWarehouseStore.getState().selectedShelfId).toBe("s1");
  });

  it("sets view mode", () => {
    act(() => useWarehouseStore.getState().setViewMode("3d"));
    expect(useWarehouseStore.getState().viewMode).toBe("3d");
  });
});
