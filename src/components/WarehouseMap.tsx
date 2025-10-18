import { PointerEvent, useCallback, useMemo, useRef, useState } from "react";
import { useWarehouseStore } from "../store/warehouseStore";
import ShelfTooltip from "./ShelfTooltip";
import { snapToGrid } from "../utils/geometry";
import type { Shelf } from "../types";

type MoveInteraction = {
  mode: "move";
  shelfId: string;
  pointerId: number;
  origin: { x: number; y: number };
  startShelf: Shelf;
  lastApplied: { x: number; y: number };
};

type ResizeInteraction = {
  mode: "resize";
  shelfId: string;
  pointerId: number;
  origin: { x: number; y: number };
  startShelf: Shelf;
  lastApplied: { width: number; height: number };
};

type Interaction = MoveInteraction | ResizeInteraction;

const SHELF_STROKE = "#1e3a8a";
const SHELF_FILL = "rgba(96, 165, 250, 0.7)";
const SHELF_SELECTED_FILL = "rgba(37, 99, 235, 0.8)";

function WarehouseMap() {
  const shelves = useWarehouseStore((state) => state.shelves);
  const grid = useWarehouseStore((state) => state.grid);
  const selectedShelfId = useWarehouseStore((state) => state.selectedShelfId);
  const hoveredShelfId = useWarehouseStore((state) => state.hoveredShelfId);
  const selectShelf = useWarehouseStore((state) => state.selectShelf);
  const setHoveredShelf = useWarehouseStore((state) => state.setHoveredShelf);
  const moveShelf = useWarehouseStore((state) => state.moveShelf);
  const resizeShelf = useWarehouseStore((state) => state.resizeShelf);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  const toGridCoords = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) {
        return { x: 0, y: 0 };
      }
      const rect = svg.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;

      const x = ((clientX - rect.left) / width) * grid.columns;
      const y = ((clientY - rect.top) / height) * grid.rows;

      return {
        x,
        y
      };
    },
    [grid.columns, grid.rows]
  );

  const beginInteraction = useCallback(
    (event: PointerEvent<Element>, shelf: Shelf, mode: Interaction["mode"]) => {
      event.stopPropagation();
      const coords = toGridCoords(event.clientX, event.clientY);
      const payload: Interaction =
        mode === "move"
          ? {
              mode,
              shelfId: shelf.id,
              pointerId: event.pointerId,
              origin: coords,
              startShelf: shelf,
              lastApplied: { x: shelf.x, y: shelf.y }
            }
          : {
              mode,
              shelfId: shelf.id,
              pointerId: event.pointerId,
              origin: coords,
              startShelf: shelf,
              lastApplied: { width: shelf.width, height: shelf.height }
            };

      setInteraction(payload);
      selectShelf(shelf.id);

      const svg = svgRef.current;
      if (svg && svg.setPointerCapture) {
        try {
          svg.setPointerCapture(event.pointerId);
        } catch {
          // no-op: jsdom does not fully implement pointer capture
        }
      }
    },
    [selectShelf, toGridCoords]
  );

  const handleCanvasPointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      setInteraction((current) => {
        if (!current || current.pointerId !== event.pointerId) {
          return current;
        }

        const coords = toGridCoords(event.clientX, event.clientY);

        if (current.mode === "move") {
          const dx = coords.x - current.origin.x;
          const dy = coords.y - current.origin.y;
          const nextX = snapToGrid(current.startShelf.x + dx, 1);
          const nextY = snapToGrid(current.startShelf.y + dy, 1);

          if (nextX !== current.lastApplied.x || nextY !== current.lastApplied.y) {
            moveShelf(current.shelfId, nextX, nextY);
            return {
              ...current,
              lastApplied: { x: nextX, y: nextY }
            };
          }

          return current;
        }

        const dx = coords.x - current.origin.x;
        const dy = coords.y - current.origin.y;
        const nextWidth = Math.max(1, snapToGrid(current.startShelf.width + dx, 1));
        const nextHeight = Math.max(1, snapToGrid(current.startShelf.height + dy, 1));

        if (
          nextWidth !== current.lastApplied.width ||
          nextHeight !== current.lastApplied.height
        ) {
          resizeShelf(current.shelfId, nextWidth, nextHeight);
          return {
            ...current,
            lastApplied: { width: nextWidth, height: nextHeight }
          };
        }

        return current;
      });
    },
    [moveShelf, resizeShelf, toGridCoords]
  );

  const resetInteraction = useCallback((pointerId: number) => {
    setInteraction((current) => {
      if (!current || current.pointerId !== pointerId) {
        return current;
      }

      const svg = svgRef.current;
      if (svg && svg.releasePointerCapture && svg.hasPointerCapture?.(pointerId)) {
        try {
          svg.releasePointerCapture(pointerId);
        } catch {
          // ignore
        }
      }

      return null;
    });
  }, []);

  const handleCanvasPointerUp = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      resetInteraction(event.pointerId);
    },
    [resetInteraction]
  );

  const handleCanvasPointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.target === svgRef.current) {
        selectShelf(undefined);
      }
    },
    [selectShelf]
  );

  const tooltipShelf = useMemo(() => {
    if (selectedShelfId) {
      return shelves.find((shelf) => shelf.id === selectedShelfId) ?? null;
    }
    if (hoveredShelfId) {
      return shelves.find((shelf) => shelf.id === hoveredShelfId) ?? null;
    }
    return null;
  }, [hoveredShelfId, selectedShelfId, shelves]);

  return (
    <section className="warehouse-map" data-testid="warehouse-map">
      <svg
        ref={svgRef}
        className="warehouse-map__canvas"
        viewBox={`0 0 ${grid.columns} ${grid.rows}`}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={(event) => resetInteraction(event.pointerId)}
        role="img"
        aria-label="Interactive warehouse map"
      >
        <rect x={0} y={0} width={grid.columns} height={grid.rows} fill="transparent" />
        {shelves.map((shelf) => {
          const isSelected = shelf.id === selectedShelfId;
          const isHovered = shelf.id === hoveredShelfId && !isSelected;

          return (
            <g key={shelf.id}>
              <rect
                role="button"
                tabIndex={0}
                className={`shelf${isSelected ? " shelf--selected" : ""}`}
                data-testid={`shelf-${shelf.id}`}
                x={shelf.x}
                y={shelf.y}
                width={shelf.width}
                height={shelf.height}
                rx={0.3}
                ry={0.3}
                fill={isSelected ? SHELF_SELECTED_FILL : SHELF_FILL}
                stroke={SHELF_STROKE}
                strokeWidth={0.15}
                onPointerDown={(event) => beginInteraction(event, shelf, "move")}
                onPointerEnter={() => setHoveredShelf(shelf.id)}
                onPointerLeave={() => setHoveredShelf(undefined)}
                aria-label={`Shelf ${shelf.label}`}
              />
              <rect
                className="shelf__handle"
                data-testid={`shelf-handle-${shelf.id}`}
                x={shelf.x + shelf.width - 0.6}
                y={shelf.y + shelf.height - 0.6}
                width={0.6}
                height={0.6}
                rx={0.1}
                ry={0.1}
                fill={isSelected || isHovered ? "#1f2937" : "#334155"}
                stroke="#f8fafc"
                strokeWidth={0.05}
                onPointerDown={(event) => beginInteraction(event, shelf, "resize")}
                onPointerEnter={() => setHoveredShelf(shelf.id)}
                onPointerLeave={() => setHoveredShelf(undefined)}
                aria-label={`Resize ${shelf.label}`}
              />
            </g>
          );
        })}
      </svg>
      {tooltipShelf ? <ShelfTooltip shelf={tooltipShelf} grid={grid} /> : null}
    </section>
  );
}

export default WarehouseMap;
