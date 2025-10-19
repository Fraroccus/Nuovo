import { act } from "@testing-library/react";
import { useWarehouseStore } from "@/store/useWarehouseStore";

describe("useWarehouseStore", () => {
  beforeEach(() => {
    const { setState } = useWarehouseStore;
    act(() => setState({
      selectedWarehouseId: null,
      selectedShelfId: null,
      viewMode: "list",
      isAddWarehouseModalOpen: false,
    } as any));
  });

  it("opens and closes the add warehouse modal", () => {
    expect(useWarehouseStore.getState().isAddWarehouseModalOpen).toBe(false);
    act(() => useWarehouseStore.getState().openAddWarehouseModal());
    expect(useWarehouseStore.getState().isAddWarehouseModalOpen).toBe(true);
    act(() => useWarehouseStore.getState().closeAddWarehouseModal());
    expect(useWarehouseStore.getState().isAddWarehouseModalOpen).toBe(false);
  });

  it("sets selected warehouse id", () => {
    act(() => useWarehouseStore.getState().setSelectedWarehouse("abc"));
    expect(useWarehouseStore.getState().selectedWarehouseId).toBe("abc");
  });

  it("sets view mode", () => {
    act(() => useWarehouseStore.getState().setViewMode("3d"));
    expect(useWarehouseStore.getState().viewMode).toBe("3d");
  });
});
