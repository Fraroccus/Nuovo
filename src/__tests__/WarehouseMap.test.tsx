import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WarehouseMap from "../components/WarehouseMap";
import WarehouseControls from "../components/WarehouseControls";
import { resetWarehouseStore, useWarehouseStore } from "../store/warehouseStore";

const createRect = () => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 480,
  right: 960,
  width: 960,
  height: 480,
  toJSON() {
    return {};
  }
});

beforeEach(() => {
  resetWarehouseStore();
  vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockImplementation(() => createRect() as DOMRect);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Warehouse map interactions", () => {
  test("shows shelf tooltip on hover", async () => {
    const user = userEvent.setup();
    render(<WarehouseMap />);

    const shelf = await screen.findByTestId("shelf-shelf-1");
    await user.hover(shelf);

    const tooltip = await screen.findByTestId("shelf-tooltip-shelf-1");
    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveTextContent("Shelf A-01");
  });

  test("allows dragging a shelf with snapping and notifies store", async () => {
    const user = userEvent.setup();
    render(<WarehouseMap />);

    const shelfBefore = useWarehouseStore.getState().shelves.find((item) => item.id === "shelf-1");
    const initialX = shelfBefore?.x ?? 0;
    const initialRevision = useWarehouseStore.getState().revision;

    const shelfElement = await screen.findByTestId("shelf-shelf-1");
    const svg = await screen.findByRole("img", { name: /warehouse map/i });

    await user.pointer([
      { target: shelfElement, clientX: 120, clientY: 160, pointerId: 1, type: "pointerdown" },
      { target: svg, clientX: 600, clientY: 200, pointerId: 1, type: "pointermove" },
      { target: svg, clientX: 600, clientY: 200, pointerId: 1, type: "pointerup" }
    ]);

    const shelfAfter = useWarehouseStore.getState().shelves.find((item) => item.id === "shelf-1");
    expect(shelfAfter?.x).not.toBe(initialX);
    expect(useWarehouseStore.getState().revision).toBeGreaterThan(initialRevision);
  });

  test("resizes shelf via handle", async () => {
    const user = userEvent.setup();
    render(<WarehouseMap />);

    const before = useWarehouseStore.getState().shelves.find((item) => item.id === "shelf-1");
    const initialWidth = before?.width ?? 0;

    const handle = await screen.findByTestId("shelf-handle-shelf-1");
    const svg = await screen.findByRole("img", { name: /warehouse map/i });

    await user.pointer([
      { target: handle, clientX: 400, clientY: 240, pointerId: 2, type: "pointerdown" },
      { target: svg, clientX: 720, clientY: 320, pointerId: 2, type: "pointermove" },
      { target: svg, clientX: 720, clientY: 320, pointerId: 2, type: "pointerup" }
    ]);

    const after = useWarehouseStore.getState().shelves.find((item) => item.id === "shelf-1");
    expect(after?.width).toBeGreaterThan(initialWidth);
  });

  test("adds a shelf through controls and selects it", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <WarehouseControls />
        <WarehouseMap />
      </div>
    );

    const button = await screen.findByRole("button", { name: /add shelf/i });
    await user.click(button);

    const shelves = useWarehouseStore.getState().shelves;
    const newShelf = shelves[shelves.length - 1];
    expect(newShelf.label).toMatch(/New/);
    expect(useWarehouseStore.getState().selectedShelfId).toBe(newShelf.id);

    const renderedShelf = await screen.findByTestId(`shelf-${newShelf.id}`);
    expect(renderedShelf).toBeInTheDocument();
  });
});
