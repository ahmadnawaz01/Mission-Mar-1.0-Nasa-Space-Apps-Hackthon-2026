# 🔴 Martian Map // Planetary Surface Explorer & EVA Mission Control

> **NASA Space Apps Challenge 2026** — Planetary-Scale Autonomous Traversal & Bio-Energetic Pathfinding Console for Mars.  
> Powered by verified **NASA JPL Mars Trek WMTS** endpoints, **USGS Astrogeology catalogs**, and high-performance **A* pathfinding** via FastAPI.

---

## 1. Project Overview & Mission Scope

Human extravehicular activities (EVAs) and robotic rover surface operations on Mars face severe geographic and physical constraints:
* **Extreme Escarpments**: Valles Marineris plunges over $7,000\text{ meters}$; Olympus Mons rises with $6,000\text{ m}$ sheer volcanic cliffs.
* **Biomechanic Slope Limits**: Inclines exceeding $8.0^\circ\text{--}15.0^\circ$ significantly increase metabolic consumption, spacesuit joint torque saturation, and rover rollover risk.
* **Consumable & Science Trade-offs**: Traverses must balance safety with routing incentives near critical astrobiological outcrops (USGS ancient lakebeds, delta deposits, river channels).

**Martian Map** is an industry-grade, precision-engineered React + Leaflet GIS console that renders global planetary topography and computes energy-optimal, slope-constrained routes across the Martian globe.

---

## 2. NASA & USGS Orbital Datasets (WMTS)

The frontend interfaces directly with official NASA Jet Propulsion Laboratory (JPL) Mars Trek Equirectangular Tile Services (`EPSG:4326`, $R_{\text{Mars}} = 3,389.5\text{ km}$):

| Layer Name | Sensor / Instrument | Resolution | Native Zoom | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Optical Mosaic** | Viking Orbiter MDIM 2.1 | $232\text{ m/px}$ | $0\text{--}7$ | Global true-color photographic mosaic of the Martian surface. |
| **Elevation Relief** | MGS Mars Orbiter Laser Altimeter (MOLA) | $463\text{ m/px}$ | $0\text{--}7$ | Color-shaded topography depicting elevation differences from $-8,200\text{ m}$ to $+21,240\text{ m}$. |
| **Thermal Surface** | 2001 Mars Odyssey THEMIS Day IR | $100\text{ m/px}$ | $0\text{--}9$ | Controlled thermal infrared mosaic revealing surface thermal inertia and bedrock exposure ($65^\circ\text{S}$ to $65^\circ\text{N}$). |

---

## 3. Modular Industry-Grade Component Architecture

The codebase has been refactored from a monolithic file into modular components following modern React and GIS best practices:

```
src/
├── constants/
│   ├── api.js                   # Backend endpoint URL and NASA Trek WMTS root configuration
│   ├── layers.js                # Layer definitions (Optical, MOLA Elevation, THEMIS IR)
│   └── places.js                # Planetary landmark catalog (Valles Marineris, Jezero, etc.)
│
├── utils/
│   ├── geo.js                   # Coordinate formatting and antimeridian splitRoute logic
│   └── icons.js                 # Leaflet custom divIcons (landmarkIcon, routeIcon)
│
├── services/
│   └── api.js                   # Asynchronous route calculation service (FastAPI + Vite fallback)
│
├── components/
│   ├── TopBar/
│   │   └── TopBar.jsx           # Mission Mars brand mark, status indicator, and Path Planner toggle
│   │
│   ├── Sidebar/
│   │   ├── Sidebar.jsx          # Collapsible exploration sidebar container
│   │   ├── LayerList.jsx        # 3 selectable map layers with thumbnail previews
│   │   └── PlacesList.jsx       # Ranked exploration landmarks with click-to-fly navigation
│   │
│   ├── Map/
│   │   ├── MapView.jsx          # Map container coordinating tiles, markers, and HUD elements
│   │   ├── MapController.jsx    # Leaflet map event listener and camera animation handler
│   │   ├── MapControls.jsx      # Zoom In, Zoom Out, and Reset View controls
│   │   ├── SearchBar.jsx        # Autocomplete search with "/" keyboard shortcut
│   │   ├── InfoModal.jsx        # "About Martian Map" informational modal dialog
│   │   └── MapBottomBar.jsx     # Live cursor / center coordinates and NASA attribution
│   │
│   └── PathPlanner/
│       ├── PathPlanner.jsx      # Dedicated route planning container
│       ├── RoutePoints.jsx      # Point A (Origin) and Point B (Target) pickers
│       ├── TraverseProfile.jsx  # Safest, Fastest, and Science mode selector buttons
│       └── RouteResults.jsx     # Numerical telemetry stat cards (Distance, EVA Time, Slope, Gain)
│
├── App.jsx                      # Main application orchestrator & centralized state manager
├── main.jsx                     # Clean React 18/19 DOM root mount
└── style.css                    # Production styling
```

---

## 4. Key UI & Geodesy Capabilities

1. **Precision Point-and-Click Path Planning**:
   * Click **Start point (A)** or **Destination (B)** in the Path Planner panel.
   * Click anywhere on Mars to anchor coordinates formatted in planetary notation (e.g. `18.44° N / 77.45° E`).
   * Alternatively, click any landmark on the map (or search result) to set it as **Start (A)** or **Dest (B)** directly from the marker popup.

2. **Antimeridian Polyline Splitting**:
   * Standard cylindrical equirectangular projections ($180^\circ\text{W}$ to $180^\circ\text{E}$) typically distort routes that cross the antimeridian, causing straight lines across the whole world.
   * `src/utils/geo.js` (`splitRoute`) automatically computes intersection latitudes and splits routes across the $180^\circ$ meridian into continuous visual segments.

3. **Smooth Tile Scaling & Clamped Viewport**:
   * `maxNativeZoom` ($7$ or $9$) paired with `maxZoom: 12` ensures Leaflet upscales native tiles on high zoom without firing out-of-bounds 404 tile errors.
   * `minZoom: 2` and `maxBoundsViscosity: 1.0` keep the Martian globe framed in the viewport, preventing disorienting letterboxing into empty space.

4. **Streamlined 3-Mode Traverse Profiles**:
   * **Safest**: Strictly avoids steep slopes and ridges to conserve spacesuit life-support consumables and reduce joint strain.
   * **Fastest**: Prioritizes direct transit paths while respecting maximum mechanical vehicle limits.
   * **Science**: Traverses routes incentivized by proximity to USGS cataloged astrobiology and stratigraphy targets.

5. **Clean Telemetry Readout**:
   * Once computed by the FastAPI engine, routes display numerical mission metrics:
     * **Total Ground Track Distance** (meters or kilometers)
     * **Estimated EVA Walking Time** (minutes or hours)
     * **Maximum Slope Angle** ($^\circ$)
     * **Cumulative Elevation Gain** ($+\text{m}$)

---

## 5. Backend Integration Contract

The frontend connects to the **Martian Map FastAPI** pathfinding service:

### Route Request Payload (`POST /api/plan-route`)
```json
{
  "start": [18.4447, 77.4508],
  "end": [18.4585, 77.4240],
  "mode": "safest"
}
```

### Route Response Payload
```json
{
  "mode_used": "safest",
  "verdict": "SAFE",
  "reason": "[SAFEST] Safe corridor verified. Max incline 7.4° is within nominal EVA limits.",
  "total_distance_m": 5203.4,
  "elevation_gain_m": 128.6,
  "max_slope_deg": 7.4,
  "est_eva_minutes": 104.1,
  "waypoints": [
    { "lat": 18.4447, "lng": 77.4508, "elevation_m": -2564.5, "slope_deg": 0.0 },
    { "lat": 18.4466, "lng": 77.4490, "elevation_m": -2567.7, "slope_deg": 1.8 }
  ]
}
```

---

## 6. Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.x, v20.x, or v22.x+
* **npm**: v9.x or v10.x+
* *(Optional)* Running instance of the `martian-map-backend` at `http://localhost:8000`.

### 1. Installation
```bash
git clone https://github.com/nasa-space-apps-martian-map/martian-map-frontend.git
cd martian-map-frontend
npm install
```

### 2. Configure Environment
Create or edit `.env` in the project root:
```env
# URL of your running FastAPI service
VITE_FASTAPI_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
```

### 3. Launch the Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates a static production bundle in `dist/` ready for hosting on Cloudflare Pages, Vercel, Netlify, or AWS S3.

---

## 7. Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`/`** | Focus the Martian landmark search bar |
| **`Enter`** | Fly directly to the first matching search result |
| **`Esc`** | Dismiss search results or close the Info modal |

---

## 8. Data Credits & Acknowledgments

* **NASA / JPL-Caltech / USGS Astrogeology Science Center**: Planetary Equirectangular WMTS tile mosaics.
* **Mars Global Surveyor (MGS) MOLA Science Team**: Global Martian altimetry and digital elevation models.
* **2001 Mars Odyssey THEMIS Team (Arizona State University)**: Controlled daytime infrared mosaics.
* **NASA Space Apps Challenge 2026**: Planetary logistics and autonomous surface mobility challenge.
