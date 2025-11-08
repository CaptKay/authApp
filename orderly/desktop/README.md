# Orderly Desktop

Electron + React desktop client that wraps the existing web SPA codebase.

The renderer imports the routes, auth context, and UI components directly from
`../client`, so both experiences stay in lockstep with zero duplication. Runtime
configuration comes from the regular Vite env vars and, when packaged, the
`window.orderlyDesktop.apiBaseUrl` bridge injected by the preload script.

## Getting started

```bash
cd desktop
npm install
npm run dev
```

The development server starts Vite on port 5173 and spawns Electron once the
renderer bundle is ready.

Create a `.env` file based on `.env.example` to point the desktop shell at your
API server (falls back to `http://localhost:3000/api`).

## Packaging

To create distributable binaries for macOS, Windows, and Linux, run:

```bash
npm run build
```

Artifacts are written to the `release/` directory using `electron-builder`
targets (`dmg`, `nsis`, `AppImage`, `deb`).
