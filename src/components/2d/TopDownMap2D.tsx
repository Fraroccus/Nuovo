"use client";

import { useMemo, useRef, useState } from "react";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useOptimisticShelfUpdate } from "@/hooks/useOptimisticShelfUpdate";
import type { Shelf as ShelfType } from "@/types";

export type TopDownMap2DProps = {
  shelves: ShelfType[];
  gridSize: number;
  dimensions?: { width: number; length: number };
};

function snapToGrid(value: number, grid: number) {
  return Math.round(value / grid) * grid;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function TopDownMap2D({ shelves, gridSize, dimensions }: TopDownMap2DProps) {
  const selectedShelfId = useWarehouseStore((s) => s.selectedShelfId);
  const setSelectedShelf = useWarehouseStore((s) => s.setSelectedShelf);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const mutation = useOptimisticShelfUpdate();

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const viewWidth = dimensions?.width ?? 20;
  const viewHeight = dimensions?.length ?? 20;

  type DragState =
    | null
    | {
        type: "move";
        id: string;
        startCenterX: number;
        startCenterZ: number;
        startPointerX: number;
        startPointerY: number;
      }
    | {
        type: "resize-e" | "resize-s";
        id: string;
        // geometry at start
        startLeft: number; // x of left edge
        startTop: number; // y of top edge (z axis)
        startWidth: number;
        startDepth: number;
        startPointerX: number;
        startPointerY: number;
      };

  const [drag, setDrag] = useState<DragState>(null);
  const [preview, setPreview] = useState<
    | null
    | {
        id: string;
        centerX: number;
        centerZ: number;
        width: number;
        depth: number;
      }
  >(null);

  function toUnitCoords(e: React.PointerEvent | MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const xPx = ("clientX" in e ? e.clientX : 0) - rect.left;
    const yPx = ("clientY" in e ? e.clientY : 0) - rect.top;
    const x = (xPx / rect.width) * viewWidth;
    const y = (yPx / rect.height) * viewHeight;
    return { x, y };
  }

  function commit(id: string, update: Partial<ShelfType>) {
    setStatus("saving");
    return mutation
      .mutateAsync({ id, data: update })
      .then(() => setStatus("idle"))
      .catch((e) => {
        console.error(e);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      });
  }

  function onPointerDownMove(e: React.PointerEvent, shelf: ShelfType) {
    e.preventDefault();
    e.stopPropagation();
    const pt = toUnitCoords(e);
    setSelectedShelf(shelf.id);
    setDrag({
      type: "move",
      id: shelf.id,
      startCenterX: shelf.positionX,
      startCenterZ: shelf.positionZ,
      startPointerX: pt.x,
      startPointerY: pt.y,
    });
    setPreview({
      id: shelf.id,
      centerX: shelf.positionX,
      centerZ: shelf.positionZ,
      width: shelf.width,
      depth: shelf.depth,
    });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerDownResizeE(e: React.PointerEvent, shelf: ShelfType) {
    e.preventDefault();
    e.stopPropagation();
    const pt = toUnitCoords(e);
    const left = shelf.positionX - shelf.width / 2;
    const top = shelf.positionZ - shelf.depth / 2;
    setSelectedShelf(shelf.id);
    setDrag({
      type: "resize-e",
      id: shelf.id,
      startLeft: left,
      startTop: top,
      startWidth: shelf.width,
      startDepth: shelf.depth,
      startPointerX: pt.x,
      startPointerY: pt.y,
    });
    setPreview({ id: shelf.id, centerX: shelf.positionX, centerZ: shelf.positionZ, width: shelf.width, depth: shelf.depth });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerDownResizeS(e: React.PointerEvent, shelf: ShelfType) {
    e.preventDefault();
    e.stopPropagation();
    const pt = toUnitCoords(e);
    const left = shelf.positionX - shelf.width / 2;
    const top = shelf.positionZ - shelf.depth / 2;
    setSelectedShelf(shelf.id);
    setDrag({
      type: "resize-s",
      id: shelf.id,
      startLeft: left,
      startTop: top,
      startWidth: shelf.width,
      startDepth: shelf.depth,
      startPointerX: pt.x,
      startPointerY: pt.y,
    });
    setPreview({ id: shelf.id, centerX: shelf.positionX, centerZ: shelf.positionZ, width: shelf.width, depth: shelf.depth });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const pt = toUnitCoords(e);
    if (drag.type === "move") {
      const dx = pt.x - drag.startPointerX;
      const dz = pt.y - drag.startPointerY;
      let cx = drag.startCenterX + dx;
      let cz = drag.startCenterZ + dz;

      // Clamp so the rect stays within bounds
      const w = preview?.width ?? 0;
      const d = preview?.depth ?? 0;
      cx = clamp(cx, w / 2, viewWidth - w / 2);
      cz = clamp(cz, d / 2, viewHeight - d / 2);

      setPreview((p) => (p && p.id === drag.id ? { ...p, centerX: cx, centerZ: cz } : p));
    } else if (drag.type === "resize-e") {
      const dx = pt.x - drag.startPointerX;
      let newWidth = Math.max(gridSize, drag.startWidth + dx);
      // Clamp right edge within bounds
      const right = drag.startLeft + newWidth;
      if (right > viewWidth) newWidth = viewWidth - drag.startLeft;
      const cx = drag.startLeft + newWidth / 2;
      setPreview((p) => (p && p.id === drag.id ? { ...p, width: newWidth, centerX: cx } : p));
    } else if (drag.type === "resize-s") {
      const dy = pt.y - drag.startPointerY;
      let newDepth = Math.max(gridSize, drag.startDepth + dy);
      // Clamp bottom edge within bounds
      const bottom = drag.startTop + newDepth;
      if (bottom > viewHeight) newDepth = viewHeight - drag.startTop;
      const cz = drag.startTop + newDepth / 2;
      setPreview((p) => (p && p.id === drag.id ? { ...p, depth: newDepth, centerZ: cz } : p));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag || !preview) return;

    const id = drag.id;

    // Snap values to grid
    const snapped = {
      positionX: snapToGrid(preview.centerX, gridSize),
      positionZ: snapToGrid(preview.centerZ, gridSize),
      width: snapToGrid(preview.width, gridSize),
      depth: snapToGrid(preview.depth, gridSize),
      positionY: 0,
    } as const;

    setDrag(null);
    setPreview(null);

    void commit(id, snapped);
  }

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    for (let x = 0; x <= viewWidth; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={viewHeight}
          stroke="#e5e7eb"
          strokeWidth={0.02}
        />
      );
    }
    for (let y = 0; y <= viewHeight; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={viewWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={0.02}
        />
      );
    }
    return lines;
  }, [viewWidth, viewHeight, gridSize]);

  return (
    <div className="relative h-[600px] w-full">
      <div className="pointer-events-auto absolute right-4 top-4 z-10 rounded-md bg-white/90 px-2 py-1 text-xs text-gray-600 shadow">
        {status === "saving" ? "Saving…" : status === "error" ? "Save failed. Reverted." : null}
      </div>
      <svg
        data-testid="topdown-svg"
        ref={svgRef}
        className="h-full w-full select-none"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMin meet"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <rect x={0} y={0} width={viewWidth} height={viewHeight} fill="#f9fafb" />
        {/* grid */}
        <g>{gridLines}</g>

        {/* shelves */}
        {shelves.map((shelf) => {
          const isSelected = selectedShelfId === shelf.id;

          const cX = preview && preview.id === shelf.id ? preview.centerX : shelf.positionX;
          const cZ = preview && preview.id === shelf.id ? preview.centerZ : shelf.positionZ;
          const w = preview && preview.id === shelf.id ? preview.width : shelf.width;
          const d = preview && preview.id === shelf.id ? preview.depth : shelf.depth;

          const left = cX - w / 2;
          const top = cZ - d / 2;

          return (
            <g key={shelf.id} data-testid={`shelf-${shelf.id}`}>
              <rect
                data-testid={`shelf-rect-${shelf.id}`}
                x={left}
                y={top}
                width={w}
                height={d}
                fill={isSelected ? "#93c5fd" : "#9CA3AF"}
                stroke={isSelected ? "#2563eb" : "#374151"}
                strokeWidth={0.05}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShelf(shelf.id);
                }}
                onPointerDown={(e) => onPointerDownMove(e, shelf)}
              />

              {/* east resize handle */}
              <rect
                data-testid={`handle-e-${shelf.id}`}
                x={left + w - 0.25}
                y={top + d / 2 - 0.25}
                width={0.5}
                height={0.5}
                fill="#111827"
                onPointerDown={(e) => onPointerDownResizeE(e, shelf)}
              />

              {/* south resize handle */}
              <rect
                data-testid={`handle-s-${shelf.id}`}
                x={left + w / 2 - 0.25}
                y={top + d - 0.25}
                width={0.5}
                height={0.5}
                fill="#111827"
                onPointerDown={(e) => onPointerDownResizeS(e, shelf)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
