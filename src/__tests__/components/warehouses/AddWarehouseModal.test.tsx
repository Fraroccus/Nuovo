import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/lib/providers";
import WarehouseDashboardPage from "@/app/warehouse/page";
import { useWarehouseStore } from "@/store/useWarehouseStore";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

describe("WarehouseDashboardPage", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "w1",
        name: "Default Warehouse",
        location: "",
        description: null,
        capacity: 0,
        width: 20,
        length: 20,
        height: 6,
        gridSize: 1,
        shelves: [],
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("loads default warehouse, sets store, and toggles view", async () => {
    render(
      <Wrapper>
        <WarehouseDashboardPage />
      </Wrapper>
    );

    expect(await screen.findByText(/Default Warehouse/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(useWarehouseStore.getState().warehouseId).toBe("w1");
      expect(useWarehouseStore.getState().viewMode).toBe("2d");
    });

    const btn3d = screen.getByRole("button", { name: /3D View/i });
    await userEvent.click(btn3d);

    await waitFor(() => {
      expect(useWarehouseStore.getState().viewMode).toBe("3d");
    });

    expect(screen.getByRole("button", { name: /2D View/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3D View/i })).toBeInTheDocument();
  });
});
