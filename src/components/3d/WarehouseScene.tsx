"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Box } from "@react-three/drei";
import { Suspense } from "react";

type ShelfProps = {
  position: [number, number, number];
  name: string;
};

function Shelf({ position, name: _name }: ShelfProps) {
  // mark as intentionally unused to satisfy the linter
  void _name;

  return (
    <group position={position}>
      <Box args={[2, 3, 1]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[2, 0.2, 1]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[2, 0.2, 1]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[2, 0.2, 1]} position={[0, 2.4, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
}

export function WarehouseScene() {
  return (
    <div className="h-[600px] w-full">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#374151"
            fadeDistance={50}
            fadeStrength={1}
          />
          <Shelf position={[-4, 0, -4]} name="A1" />
          <Shelf position={[0, 0, -4]} name="A2" />
          <Shelf position={[4, 0, -4]} name="A3" />
          <Shelf position={[-4, 0, 0]} name="B1" />
          <Shelf position={[0, 0, 0]} name="B2" />
          <Shelf position={[4, 0, 0]} name="B3" />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
