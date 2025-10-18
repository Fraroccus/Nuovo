import WarehouseMap from "./components/WarehouseMap";
import WarehouseControls from "./components/WarehouseControls";

function App() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1>Warehouse Layout</h1>
      </header>
      <main className="app-shell__main">
        <WarehouseControls />
        <WarehouseMap />
      </main>
    </div>
  );
}

export default App;
