# 🛰️ Orbital Dynamics Lab

> An interactive scientific visualization for exploring Lagrange points and satellite dynamics in a two-body orbital system.

## 🚀 Live Demo

**[Open Orbital Dynamics Lab →](https://vignesh-cp-dev-orbital-dynamics-lab.orbital-dynamics-lab.workers.dev)**

## 📸 Preview

### Main Interface

![Orbital Dynamics Lab](assets/orbital-dynamics-ui.png)

### Lagrange Point Visualization

![Lagrange Point Visualization](assets/lagrange-overview.png)

---

## 🌌 Overview

Orbital Dynamics Lab is an interactive web application for exploring the five Lagrange points (L1–L5) of a two-body system.

The application visualizes the orbital geometry, barycenter, stability characteristics, and satellite behavior around the Lagrange points through an interactive mission-control style interface.

Users can experiment with different orbital systems, modify physical parameters, select individual Lagrange points, and run a satellite simulation with configurable perturbations.

---

## ✨ Features

- 🌍 **Earth–Moon preset**
- ☀️ **Sun–Earth preset**
- ⚙️ **Custom two-body system**
- 🎯 Interactive **L1–L5 selection**
- 📊 Real-time mass, separation, ratio, and distance readouts
- 🟢 Stable / unstable Lagrange point classification
- 🛰️ Interactive satellite simulation
- 📈 Configurable satellite perturbation
- 🛸 Satellite trajectory visualization
- ⏱️ Simulation time and velocity telemetry
- ▶️ Run / Pause / Reset controls
- ⚡ Adjustable simulation speed
- 📐 Barycentric rotating reference-frame visualization
- 📱 Responsive interface with collapsible panels

---

## 🧮 Physics & Simulation

The application models the **Circular Restricted Three-Body Problem (CR3BP)**.

The physics layer is separated from the UI so that the visualization can work independently from the underlying calculations.

### Lagrange Points

The five equilibrium points are calculated and visualized as:

| Point | Description | Stability |
|------|-------------|-----------|
| **L1** | Between the two bodies | Unstable |
| **L2** | Beyond the secondary body | Unstable |
| **L3** | Opposite the secondary body | Unstable |
| **L4** | 60° ahead of the secondary | Stable / Metastable |
| **L5** | 60° behind the secondary | Stable / Metastable |

### Satellite Simulation

The satellite simulation uses normalized rotating-frame coordinates and numerical integration to demonstrate how a small perturbation affects satellite motion.

The simulation includes:

- Barycentric rotating reference frame
- Mass-ratio calculation
- Numerical L1/L2/L3 equilibrium calculation
- Analytical L4/L5 geometry
- Stability classification
- Perturbation-based satellite initialization
- Fourth-order Runge–Kutta (RK4) integration
- Satellite trajectory tracking
- Real-time simulation telemetry

> The simulation is intended as an educational visualization rather than a high-fidelity spacecraft mission planner.

---

## 🛠️ Tech Stack

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **SVG-based visualization**
- **Lucide React**
- **TanStack Router**

### Physics

- Custom TypeScript CR3BP implementation
- Numerical root solving
- RK4 numerical integration
- Normalized rotating-frame coordinates

### Deployment

- **Cloudflare Workers**

---

## 📁 Project Structure

```text
orbital-dynamics-lab/
│
├── src/
│   ├── components/
│   │   └── lagrange/
│   │       ├── OrbitalView.tsx
│   │       ├── SatellitePanel.tsx
│   │       ├── ContextPanel.tsx
│   │       ├── ControlPanel.tsx
│   │       ├── SimControls.tsx
│   │       ├── DataStrip.tsx
│   │       └── TopBar.tsx
│   │
│   ├── lib/
│   │   ├── lagrange.ts
│   │   └── satellitePhysics.ts
│   │
│   └── routes/
│       └── index.tsx
│
├── assets/
│   └── lagrange-overview.png
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
