# Kothamangalam 3D data pipeline

The browser build intentionally labels the current town core as **generated/sample**. It uses the real Kothamangalam origin (`10.0647, 76.6287`) and real landmark coordinates, but the visible buildings, vegetation, and street mesh are procedural placeholders. It does **not** claim complete municipal coverage.

## Acquire and validate

1. Run `node scripts/generate-osm.mjs --output data/kothamangalam.json` to download a bounded Overpass extract. Respect the endpoint's rate limits and [OSM attribution/licensing](https://www.openstreetmap.org/copyright).
2. Acquire a DEM from a provider whose terms allow your deployment (for example SRTM/ALOS), then validate its CRS, voids, vertical datum, and resolution.
3. Filter the extract to the defined Kothamangalam boundary (the initial query is a 10.02–10.12 N, 76.57–76.69 E envelope) and retain source IDs/timestamps.
4. Reproject to a local metric frame centered at `10.0647, 76.6287`; keep the original WGS84 coordinates for GPS and attribution.

## Generate and stream

Convert `highway`, `building`, water, landuse, and named-node features into versioned chunk files (for example `z/x/y.json`). Triangulate DEM tiles, extrude validated building footprints, and generate road collision meshes. At runtime, request the current chunk plus a one-chunk ring, cache by source hash, and use simplified collision/LOD meshes beyond 250m. Instance vegetation and cull by frustum; never silently substitute missing source data.

## Coverage ledger

Each generated chunk should include `source`, `retrievedAt`, `license`, `confidence` (`verified`, `estimated`, `procedural`, or `pending`), and feature counts. The HUD's 72/28 split is a prototype status indicator, not a survey claim. Expand the map only after the ledger and validation report are generated.

## Acceptance smoke checks

- Launch with `npm install && npm run dev`; movement responds to WASD, Shift, Space, pointer drag, and the interaction button.
- GPS text changes as the player moves; the player marker and selected POI map pins use the same coordinate transform.
- Search filters indexed POIs; clicking a POI teleports and updates the status line.
- Repeated `npm run build` succeeds without network data, so the sample fallback remains usable offline.
