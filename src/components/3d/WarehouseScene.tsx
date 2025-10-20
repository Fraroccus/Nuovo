"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { useOptimisticShelfUpdate } from "@/hooks/useOptimisticShelfUpdate";

export type Shelf = {
  id: string;
  name: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  width: number;
  depth: number;
  height: number;
};

export type WarehouseSceneProps = {
  shelves: Shelf[];
  gridSize: number;
  dimensions?: { width: number; length: number };
};

function snapToGrid(value: number, grid: number) {
  return Math.round(value / grid) * grid;
}

function clampMin(value: number, min: number) {
  return value < min ? min : value;
}

export function WarehouseScene({ shelves, gridSize, dimensions }: WarehouseSceneProps) {
  const selectedShelfId = useWarehouseStore((s) => s.selectedShelfId);
  const setSelectedShelf = useWarehouseStore((s) => s.setSelectedShelf);

  const [mode, setMode] = useState<"translate" | "scale">("translate");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const mutation = useOptimisticShelfUpdate();

  const gridArgs = useMemo(() => {
    const w = dimensions?.width ?? 20;
    const l = dimensions?.length ?? 20;
    return [w, l] as [number, number];
  }, [dimensions?.width, dimensions?.length]);

  return (
    <div className="relative h-[600px] w-full">
      {/* Controls overlay */}
      <div className="pointer-events-auto absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md bg-white/90 p-2 shadow">
        <span className="text-xs text-gray-600">Mode</span>
        <button
          className={`rounded px-2 py-1 text-xs ${
            mode === "translate" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMode("translate")}
        >
          Move
        </button>
        <button
          className={`rounded px-2 py-1 text-xs ${
            mode === "scale" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMode("scale")}
        >
          Resize
        </button>
        {status === "saving" ? (
          <span className="ml-2 text-xs text-blue-700">Saving…</span>
        ) : status === "error" ? (
          <span className="ml-2 text-xs text-red-700">Save failed. Reverted.</span>
        ) : null}
      </div>

      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid
            args={gridArgs}
            cellSize={gridSize}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={Math.max(1, Math.floor((dimensions?.width ?? 20) / 4))}
            sectionThickness={1}
            sectionColor="#374151"
            fadeDistance={50}
            fadeStrength={1}
          />

          {shelves.map((shelf) => (
            <ShelfMesh
              key={shelf.id}
              shelf={shelf}
              gridSize={gridSize}
              selected={selectedShelfId === shelf.id}
              onSelect={() => setSelectedShelf(shelf.id)}
              mode={mode}
              onCommit={async (update) => {
                setStatus("saving");
                try {
                  await mutation.mutateAsync({ id: shelf.id, data: update });
                  setStatus("idle");
                } catch (e) {
                  console.error(e);
                  setStatus("error");
                  // Clear the error after a moment
                  setTimeout(() => setStatus("idle"), 2000);
                }
              }}
            />
          ))}

          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}

function ShelfMesh({
  shelf,
  gridSize,
  selected,
  onSelect,
  mode,
  onCommit,
}: {
  shelf: Shelf;
  gridSize: number;
  selected: boolean;
  onSelect: () => void;
  mode: "translate" | "scale";
  onCommit: (update: Partial<Shelf>) => void | Promise<void>;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  const basePosition = useMemo<THREE.Vector3>(() => {
    return new THREE.Vector3(
      shelf.positionX,
      Math.max(0, shelf.positionY) + shelf.height / 2,
      shelf.positionZ
    );
  }, [shelf.positionX, shelf.positionY, shelf.positionZ, shelf.height]);

  const color = selected
    ? "#60a5fa" // blue-400
    : hovered
    ? "#a16207" // amber-700 when hovered
    : "#8B4513"; // base brown

  const material = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);

  // handle commit after interaction ends
  const handleCommit = () => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Calculate new absolute position (snap to grid on X/Z), keep Y at half height
    const snappedX = snapToGrid(mesh.position.x, gridSize);
    const snappedZ = snapToGrid(mesh.position.z, gridSize);

    // Calculate new absolute size from scale applied during manipulation
    const newWidth = clampMin(snapToGrid(shelf.width * mesh.scale.x, gridSize), gridSize);
    const newDepth = clampMin(snapToGrid(shelf.depth * mesh.scale.z, gridSize), gridSize);
    const newHeight = clampMin(snapToGrid(shelf.height * mesh.scale.y, gridSize), gridSize);

    // Reset mesh transforms to render from updated props on next paint
    mesh.scale.set(1, 1, 1);
    mesh.position.set(snappedX, newHeight / 2, snappedZ);

    void onCommit({
      positionX: snappedX,
      positionY: 0, // ground floor baseline
      positionZ: snappedZ,
      width: newWidth,
      depth: newDepth,
      height: newHeight,
    });
  };

  return (
    <TransformControls
      enabled={selected}
      mode={mode}
      translationSnap={gridSize}
      scaleSnap={gridSize}
      onMouseDown={(e) => {
        // stop orbiting while interacting
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        handleCommit();
      }}
      onObjectChange={(e) => {
        // Keep Y anchored to floor visually during translate mode
        if (mode === "translate" && meshRef.current) {
          meshRef.current.position.y = shelf.height / 2;
        }
      }}
    >
      {/* Using a simple box mesh for the shelf */}
      <mesh
        ref={meshRef}
        position={basePosition}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <boxGeometry args={[shelf.width, shelf.height, shelf.depth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </TransformControls>
  );
}
