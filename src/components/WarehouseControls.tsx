import { useWarehouseStore } from "../store/warehouseStore";

function WarehouseControls() {
  const addShelf = useWarehouseStore((state) => state.addShelf);
  const shelvesCount = useWarehouseStore((state) => state.shelves.length);
  const revision = useWarehouseStore((state) => state.revision);

  return (
    <section className="warehouse-controls" aria-label="Warehouse controls">
      <button
        type="button"
        className="warehouse-controls__button"
        onClick={() => addShelf()}
      >
        Add shelf
      </button>
      <span aria-live="polite">Shelves: {shelvesCount}</span>
      <span title="Revision counter">Revision: {revision}</span>
    </section>
  );
}

export default WarehouseControls;
