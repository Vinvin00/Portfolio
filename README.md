# Vincenzo Balbi — 3D Interactive Portfolio

A fully interactive 3D portfolio built with React, Three.js, and React Three Fiber. Visitors explore a floating island environment as a character, walking up to objects that reveal different sections of the portfolio.

## Live Demo

Deployed on Vercel: [https://github.com/Vinvin00/Portfolio](https://github.com/Vinvin00/Portfolio)

---

## Features

- **3D walkable world** — a floating island scene with interactive objects, animated character, and atmospheric fog
- **Character controls** — keyboard-driven movement (WASD / arrow keys) with walk, idle, and fall animations via FBX
- **Proximity interaction system** — walk near an object and press `E` to interact; a nameplate floats above each point of interest
- **Projects screen** — an in-world standing desk with a 3D monitor that displays a scaled projects showcase via iframe
- **Camera tween** — smooth GSAP-animated camera transition zooms into the monitor when entering the projects view
- **About overlay** — message board triggers a full-screen About panel
- **Contact overlay** — mailbox triggers a Contact panel
- **CV popup** — file cabinet reveals a CV download popup
- **Dark / light mode** — interact with the campfire to toggle between dark and light scene lighting; background, fog, and lights all transition smoothly
- **Intro sequence** — animated title card and character drop-in before exploration begins
- **Loading overlay** — asset preload screen with fade-out before the scene is revealed
- **Vanta.js background** — animated net/fog background behind the Three.js canvas
- **HUD bar** — persistent heads-up display with mode toggle and navigation hints

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 |
| 3D engine | Three.js + React Three Fiber |
| 3D helpers | @react-three/drei |
| Animations | GSAP 3 |
| State management | Zustand |
| Styling | Tailwind CSS |
| Background FX | Vanta.js |
| Build tool | Vite |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── App.jsx                        # Root component — Canvas, overlays, scene wiring
├── main.jsx                       # React entry point
├── index.css                      # Global styles and font imports
│
├── components/
│   ├── intro/
│   │   └── IntroSequence.jsx      # Animated intro title + character drop-in
│   ├── scene/
│   │   ├── Character.jsx          # Animated character with FBX model + controls
│   │   ├── CharacterFbx.jsx       # Low-level FBX loader and animation mixer
│   │   ├── MainIsland.jsx         # Primary floating island GLTF
│   │   ├── IslandObjects.jsx      # Renders all interactive scene objects
│   │   ├── SceneObject.jsx        # Generic interactive object (model + label + action)
│   │   ├── ProximityTracker.jsx   # Detects character proximity to objects
│   │   ├── ProjectsScreen.jsx     # In-world monitor mesh + iframe portal
│   │   ├── ProjectsCameraController.jsx  # GSAP camera tween into monitor view
│   │   ├── ProjectsMonitorCamera.jsx     # Orbital camera during projects view
│   │   ├── MonitorIframePortal.jsx       # DOM portal that renders iframe over monitor
│   │   ├── ScaledProjectsIframe.jsx      # Scales projects HTML to fit the monitor
│   │   ├── VantaBackground.jsx    # Vanta.js animated background
│   │   ├── SafeGltfModel.jsx      # GLTF loader with error boundary
│   │   └── CanvasErrorBoundary.jsx
│   └── ui/
│       ├── HUDBar.jsx             # Persistent HUD with controls + dark mode toggle
│       ├── AboutOverlay.jsx       # About me full-screen overlay
│       ├── ContactOverlay.jsx     # Contact form/links overlay
│       ├── CVPopup.jsx            # CV download popup near file cabinet
│       ├── LoadingOverlay.jsx     # Asset loading screen with fade
│       ├── OverlayCard.jsx        # Generic overlay card wrapper
│       ├── Nameplate.jsx          # Floating label above interactive objects
│       ├── MonitorBackButton.jsx  # Back button shown during projects screen
│       ├── BorderGlow.jsx/css     # Glowing border UI effect
│       └── CurvedLoop.jsx/css     # Curved animated text loop component
│
├── config/
│   ├── objects.js                 # Scene object definitions (position, model, action)
│   ├── models.js                  # Model paths and preload config
│   └── projectsIframe.js         # Projects iframe source and layout constants
│
├── hooks/
│   ├── useCharacterControls.js    # Keyboard input → character movement
│   ├── useInteractKey.js          # E key → trigger nearby object action
│   ├── useProximity.js            # Distance check between character and objects
│   └── useModelAvailable.js      # Runtime check for GLTF model availability
│
├── store/
│   ├── useStore.js                # Zustand global state (overlays, mode, scene state)
│   ├── monitorRef.js              # Shared ref for the monitor mesh
│   └── projectsViewTuning.js     # Camera/position constants for projects view
│
└── utils/
    ├── monitorScreen.js           # Monitor screen geometry helpers
    ├── projectsMonitorEvents.js   # Custom events for monitor interaction
    └── projectsView.js            # Projects camera and view state helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
cd vincenzo-portfolio
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## Interactive Objects

| Object | Action |
|---|---|
| Message board | Opens About overlay |
| Standing desk / monitor | Enters in-world Projects view |
| Mailbox | Opens Contact overlay |
| File cabinet | Shows CV download popup |
| Campfire | Toggles dark / light mode |

Walk near any object until a nameplate appears, then press **E** to interact.

---

## Controls

| Key | Action |
|---|---|
| `W` / `↑` | Walk forward |
| `S` / `↓` | Walk backward |
| `A` / `←` | Turn left |
| `D` / `→` | Turn right |
| `E` | Interact with nearby object |
| `Esc` | Close overlay / exit projects view |

---

## Deployment

The project is deployed on Vercel. Static assets (`/models/`, `/assets/`) are served with a 1-year immutable cache header (configured in [`vercel.json`](vercel.json)).

To deploy your own fork:

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set the root directory to `vincenzo-portfolio`
4. Deploy — Vercel auto-detects Vite

---

## License

Personal portfolio — all rights reserved. 3D models and fonts are subject to their respective licenses.
