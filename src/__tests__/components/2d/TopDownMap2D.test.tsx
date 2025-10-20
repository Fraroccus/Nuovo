import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Providers } from "@/lib/providers";
import { TopDownMap2D } from "@/components/2d/TopDownMap2D";
import { useWarehouseStore } from "@/store/useWarehouseStore";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

describe("TopDownMap2D", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // reset store
    const { setState } = useWarehouseStore;
    setState({ warehouseId: null, selectedShelfId: null, viewMode: "2d" } as any);
  });

  it("selects shelf on click and syncs store selection", async () => {
    const shelves = [
      {
        id: "s1",
        name: "S1",
        section: "A",
        level: 1,
        capacity: 0,
        positionX: 5,
        positionY: 0,
        positionZ: 5,
        width: 2,
        depth: 2,
        height: 3,
        warehouseId: "w1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <Wrapper>
        <TopDownMap2D shelves={shelves as any} gridSize={1} dimensions={{ width: 20, length: 20 }} />
      </Wrapper>
    );

    const rect = await screen.findByTestId("shelf-rect-s1");
    fireEvent.click(rect);

    await waitFor(() => expect(useWarehouseStore.getState().selectedShelfId).toBe("s1"));
  });

  it("dragging shelf moves and triggers API call with snapped values", async () => {
    const shelves = [
      {
        id: "s1",
        name: "S1",
        section: "A",
        level: 1,
        capacity: 0,
        positionX: 5,
        positionY: 0,
        positionZ: 5,
        width: 2,
        depth: 2,
        height: 3,
        warehouseId: "w1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockFetch = jest.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as any);

    render(
      <Wrapper>
        <TopDownMap2D shelves={shelves as any} gridSize={1} dimensions={{ width: 20, length: 20 }} />
      </Wrapper>
    );

    const svg = screen.getByTestId("topdown-svg");
    // Mock bounding box size for coordinate conversion (200x200 px => 10 px per unit)
    const bbox = { left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200 } as any;
    // @ts-expect-error override read-only for test
    svg.getBoundingClientRect = () => bbox;

    const rect = screen.getByTestId("shelf-rect-s1");

    // pointer down at shelf center (5,5) -> (50,50)px
    fireEvent.pointerDown(rect, { clientX: 50, clientY: 50, pointerId: 1 });
    // move by +2 units x and +1 unit y -> (70,60)px
    fireEvent.pointerMove(svg, { clientX: 70, clientY: 60, pointerId: 1 });
    fireEvent.pointerUp(svg, { pointerId: 1 });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    // body is JSON string
    const body = JSON.parse(lastCall[1].body);
    expect(body.positionX).toBe(7);
    expect(body.positionZ).toBe(6);
  });

  it("resizing east handle updates width and triggers API call", async () => {
    const shelves = [
      {
        id: "s1",
        name: "S1",
        section: "A",
        level: 1,
        capacity: 0,
        positionX: 5,
        positionY: 0,
        positionZ: 5,
        width: 2,
        depth: 2,
        height: 3,
        warehouseId: "w1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockFetch = jest.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as any);

    render(
      <Wrapper>
        <TopDownMap2D shelves={shelves as any} gridSize={1} dimensions={{ width: 20, length: 20 }} />
      </Wrapper>
    );

    const svg = screen.getByTestId("topdown-svg");
    // Mock bounding box size (200x200 -> 10px per unit)
    const bbox = { left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200 } as any;
    // @ts-expect-error override read-only for test
    svg.getBoundingClientRect = () => bbox;

    const handleE = screen.getByTestId("handle-e-s1");

    // pointer down at some position (we'll move +20px => +2 units)
    fireEvent.pointerDown(handleE, { clientX: 100, clientY: 50, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 120, clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(svg, { pointerId: 1 });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    const body = JSON.parse(lastCall[1].body);
    expect(body.width).toBe(4); // 2 + 2
    expect(body.positionX).toBe(6); // left anchored -> center moves +1
    expect(body.positionZ).toBe(5);
  });
});
