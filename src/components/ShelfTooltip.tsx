import type { Shelf, WarehouseGrid } from "../types";

interface ShelfTooltipProps {
  shelf: Shelf;
  grid: WarehouseGrid;
}

function ShelfTooltip({ shelf, grid }: ShelfTooltipProps) {
  const leftPercent = ((shelf.x + shelf.width / 2) / grid.columns) * 100;
  const topPercent = (shelf.y / grid.rows) * 100;

  return (
    <div
      className="shelf-tooltip"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: "translate(-50%, -110%)"
      }}
      role="status"
      data-testid={`shelf-tooltip-${shelf.id}`}
    >
      <p className="shelf-tooltip__name">Shelf {shelf.label}</p>
      <p className="shelf-tooltip__meta">
        <span>Capacity</span>
        <span>{shelf.metadata.capacity}</span>
        <span>Contents</span>
        <span>{shelf.metadata.contents}</span>
        <span>Updated</span>
        <span>{new Date(shelf.metadata.lastUpdated).toLocaleTimeString()}</span>
      </p>
    </div>
  );
}

export default ShelfTooltip;
