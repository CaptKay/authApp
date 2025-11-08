# Orderly Desktop

Electron + React desktop client for the Orderly authentication demo.

## Getting started

```bash
cd desktop
npm install
npm run dev
```

The development server starts Vite on port 5173 and spawns Electron once the renderer is available.

Create a `.env` file based on `.env.example` to point the desktop shell at your API server.

## Packaging

To create distributable binaries for macOS, Windows, and Linux, run:

```bash
npm run build
```

Artifacts are written to the `release/` directory using `electron-builder` targets (`dmg`, `nsis`, `AppImage`, `deb`).
