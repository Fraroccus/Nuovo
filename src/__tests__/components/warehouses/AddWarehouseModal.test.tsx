import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/Header";
import { AddWarehouseModal } from "@/components/warehouses/AddWarehouseModal";
import { useWarehouseStore } from "@/store/useWarehouseStore";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

describe("AddWarehouseModal", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id", name: "Test W", width: 10, length: 10, height: 5, gridSize: 1 }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("opens from header button, validates, submits, and closes", async () => {
    render(
      <Wrapper>
        <Header />
        <AddWarehouseModal />
      </Wrapper>
    );

    const openBtn = screen.getByText(/Add Warehouse/i);
    await userEvent.click(openBtn);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Central Warehouse/i) as HTMLInputElement;
    // Clear then try submit to see validation
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole("button", { name: /Create/i }));
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();

    // Fill and submit
    await userEvent.type(nameInput, "Test W");
    await userEvent.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/warehouse",
      expect.objectContaining({ method: "PATCH" })
    );

    expect(useWarehouseStore.getState().selectedWarehouseId).toBe("new-id");
  });
});
