---
name: webgl-3d-architectural-visuals
description: |
  Guide for building interactive Three.js and WebGL 3D architectural scenes, real estate skyscraper models,
  interactive camera orbits, glass shader effects, and performance optimization in Next.js / React 19 applications.
---

# WebGL & Three.js 3D Architectural Visuals Guide

This skill provides patterns, architecture, and code templates for building high-performance 3D real estate visualizations using Three.js inside Next.js 15 and React 19.

---

## 1. Next.js 15 & React 19 SSR Safety Rules

1. **Mount Canvas Strictly in `useEffect`**:
   - WebGL requires the browser `window` and `HTMLCanvasElement`.
   - Never initialize Three.js scenes, renderers, or cameras during server component execution.
   - Use dynamic imports (`next/dynamic` with `ssr: false`) or a client component with an explicit `mounted` state check.

2. **Clean Resource Disposal**:
   - Always cancel `requestAnimationFrame` on unmount.
   - Dispose of geometries, materials, and textures (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`) to prevent memory leaks in Single Page Applications (SPA).
   - Remove window `resize` and `mousemove` event listeners.

---

## 2. 3D Architectural Skyscraper Construction Patterns

### A. Procedural Building Geometry
- **Building Tower Mass**: `THREE.BoxGeometry(width, height, depth)`
- **Glass Facade Material**: `THREE.MeshPhysicalMaterial` or `THREE.MeshStandardMaterial` with:
  - `roughness: 0.1` (crisp glass reflection)
  - `metalness: 0.8` (modern architectural steel frame)
  - `transparent: true`, `opacity: 0.85`
- **Floor Slabs**: Layered horizontal thin boxes or line segments at regular intervals (e.g. every `3.5` units) to represent luxury floor levels.
- **Illuminated Windows**: Randomly lit warm amber (`#f59e0b` / `#d97706`) and cool emerald (`#10b981`) point/box lights representing occupied luxury suites and sky villas.
- **Rooftop Spire & Beacon**: Cylinders and pulsing point lights representing aircraft warning beacons and luxury penthouse observation crowns.

### B. Ambient Atmosphere & Lighting
- **Dusk / Golden Hour Lighting**:
  - `DirectionalLight` at an angle with warm gold color (`#fef3c7`, intensity: 1.5).
  - `AmbientLight` with deep navy/slate tone (`#1e293b`, intensity: 0.6) for realistic architectural shadows.
  - Floating ambient particle cloud (`THREE.Points`) with subtle vertical drift.

### C. Camera & Parallax Interaction
- Smooth lerp tracking on pointer move:
  ```ts
  targetRotationX = (mouseY - window.innerHeight / 2) * 0.0005;
  targetRotationY = (mouseX - window.innerWidth / 2) * 0.0008;
  camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.05;
  ```
