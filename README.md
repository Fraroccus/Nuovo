# 3D Warehouse Visualization

This project provides a synchronized 3D warehouse view built with React, react-three-fiber (Three.js), and Zustand state management.

Highlights
- Camera controls (OrbitControls), lighting, and floor/grid helpers aligned to 2D coordinates (x -> X, y -> Z; Y is vertical height).
- Shelves rendered as 3D boxes from shared state, with selection and highlight.
- TransformControls for translate/scale; interactions update the shared store.
- Performance: memoization in meshes, demand-driven frame loop, reasonable dpr.
- Integration tests for selection synchronization and a snapshot hook.

Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm test` — run tests (vitest)

Keyboard shortcuts
- T — translate mode
- S — scale mode
- Esc — clear selection

Notes
- 2D to 3D mapping uses XZ plane for floor. Shelf Y position is half its height so it sits on the plane.
