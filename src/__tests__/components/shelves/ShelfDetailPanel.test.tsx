import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Providers } from "@/lib/providers";
import { ShelfDetailPanel } from "@/components/shelves/ShelfDetailPanel";
import { useWarehouseStore } from "@/store/useWarehouseStore";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

describe("ShelfDetailPanel", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // reset store
    const { setState } = useWarehouseStore;
    setState({
      warehouseId: null,
      selectedShelfId: null,
      viewMode: "2d",
    } as any);
  });

  function setupFetch(items: any[] = []) {
    const db = { items: items.slice(), shelf: { id: "s1", name: "Shelf A" } };

    const mock = jest
      .spyOn(global, "fetch" as any)
      .mockImplementation(
        async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === "string" ? input : input.toString();
          const method = init?.method || "GET";

          if (url.startsWith("/api/shelves/s1") && method === "GET") {
            return {
              ok: true,
              json: async () => ({
                id: db.shelf.id,
                name: db.shelf.name,
                items: db.items,
              }),
            } as any;
          }

          if (url.startsWith("/api/items") && method === "GET") {
            const u = new URL(url, "http://localhost");
            const shelfId = u.searchParams.get("shelfId");
            if (shelfId === "s1") {
              return { ok: true, json: async () => db.items.slice() } as any;
            }
          }

          if (url === "/api/items" && method === "POST") {
            const body = JSON.parse(init?.body as string);
            const created = { id: `i${db.items.length + 1}`, ...body };
            db.items.unshift(created);
            return { ok: true, json: async () => created, status: 201 } as any;
          }

          if (url.startsWith("/api/items/") && method === "PATCH") {
            const id = url.split("/").pop()!;
            const body = JSON.parse(init?.body as string);
            const item = db.items.find((i) => i.id === id);
            if (!item)
              return {
                ok: false,
                json: async () => ({ error: "Not found" }),
                status: 404,
              } as any;
            if (body.delta !== undefined) {
              const next = item.quantity + body.delta;
              if (next < 0)
                return {
                  ok: false,
                  json: async () => ({ error: "Quantity cannot be negative" }),
                  status: 400,
                } as any;
              item.quantity = next;
            }
            return { ok: true, json: async () => item } as any;
          }

          if (url.startsWith("/api/items/") && method === "DELETE") {
            const id = url.split("/").pop()!;
            db.items = db.items.filter((i) => i.id !== id);
            return { ok: true, json: async () => ({ success: true }) } as any;
          }

          // default fallthrough
          return { ok: true, json: async () => ({}) } as any;
        }
      );

    return { mock, db };
  }

  it("loads shelf items and renders list", async () => {
    const items = [
      {
        id: "i1",
        name: "Widget",
        sku: "W1",
        description: null,
        quantity: 2,
        price: 0,
        category: "General",
        shelfId: "s1",
      },
    ];
    setupFetch(items);

    // open panel
    useWarehouseStore.getState().setSelectedShelf("s1");
    render(
      <Wrapper>
        <ShelfDetailPanel />
      </Wrapper>
    );

    expect(await screen.findByText("Inventory management")).toBeInTheDocument();
    expect(await screen.findByText("Widget")).toBeInTheDocument();
  });

  it("adds a new item with optimistic update and refetch", async () => {
    const { mock, db } = setupFetch([]);

    useWarehouseStore.getState().setSelectedShelf("s1");
    render(
      <Wrapper>
        <ShelfDetailPanel />
      </Wrapper>
    );

    // fill form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Gadget" },
    });
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "G1" } });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Tools" },
    });
    fireEvent.change(screen.getByLabelText("Price"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByTestId("btn-add-item"));

    // optimistic new item appears
    expect(await screen.findByText("Gadget")).toBeInTheDocument();

    // success message after server response
    await waitFor(() =>
      expect(screen.getByTestId("status-success")).toHaveTextContent(
        "Item added"
      )
    );

    // ensure subsequent refetch occurred (GET called again for items)
    await waitFor(() => {
      const calls = mock.mock.calls.filter(
        ([url, init]) =>
          typeof url === "string" &&
          (url as string).startsWith("/api/items?shelfId=")
      );
      expect(calls.length).toBeGreaterThan(1);
    });

    // underlying db updated
    expect(db.items.find((i) => i.name === "Gadget")).toBeTruthy();
  });

  it("adjusts quantities optimistically and rolls back on failure", async () => {
    const { mock } = setupFetch([
      {
        id: "i1",
        name: "Widget",
        sku: "W1",
        description: null,
        quantity: 0,
        price: 0,
        category: "General",
        shelfId: "s1",
      },
    ]);

    useWarehouseStore.getState().setSelectedShelf("s1");
    render(
      <Wrapper>
        <ShelfDetailPanel />
      </Wrapper>
    );

    const decBtn = await screen.findByLabelText("Decrease Widget");
    const incBtn = await screen.findByLabelText("Increase Widget");

    // increment -> optimistic + server success
    fireEvent.click(incBtn);
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());

    // decrement twice -> second should fail and rollback to 1
    fireEvent.click(decBtn); // 0
    await waitFor(() => expect(screen.getByText("0")).toBeInTheDocument());
    fireEvent.click(decBtn); // would go -1 -> server rejects

    await waitFor(() =>
      expect(screen.getByTestId("status-error")).toHaveTextContent(
        "Quantity cannot be negative"
      )
    );
    // rolled back to 0
    expect(screen.getByText("0")).toBeInTheDocument();

    // ensure PATCH was called
    expect(
      mock.mock.calls.some(([url, init]) => (init as any)?.method === "PATCH")
    ).toBe(true);
  });

  it("removes item optimistically", async () => {
    setupFetch([
      {
        id: "i1",
        name: "Widget",
        sku: "W1",
        description: null,
        quantity: 2,
        price: 0,
        category: "General",
        shelfId: "s1",
      },
    ]);

    useWarehouseStore.getState().setSelectedShelf("s1");
    render(
      <Wrapper>
        <ShelfDetailPanel />
      </Wrapper>
    );

    const removeBtn = await screen.findByLabelText("Remove Widget");
    fireEvent.click(removeBtn);

    await waitFor(() =>
      expect(screen.queryByText("Widget")).not.toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByTestId("status-success")).toHaveTextContent(
        "Item removed"
      )
    );
  });
});
