# Orderly Authentication Demo

This repository contains a full-stack authentication and authorization playground built with a Node.js/Express API, MongoDB, and a React client. It now also includes a cross-platform Electron desktop shell that consumes the same endpoints as the web front-end.

## Projects

- `server/` – Express API with JWT auth, refresh tokens, MFA, RBAC, and audit logging.
- `client/` – React + Vite SPA used as the primary reference implementation.
- `desktop/` – Electron + React desktop application targeting Windows, macOS, and Linux.

## Desktop application

1. Install dependencies and start the desktop shell in development mode:

   ```bash
   cd desktop
   npm install
   npm run dev
   ```

   The script runs the Vite dev server on port `5173` and launches Electron once the renderer is ready.

2. Copy `.env.example` to `.env` and adjust `VITE_API_URL` so the desktop client can talk to your API server.

3. Build installers for macOS, Windows, and Linux:

   ```bash
   npm run build
   ```

   Packages are emitted to `desktop/release/` via `electron-builder` (`dmg`, `nsis`, `AppImage`, `deb`).

The renderer reuses the same auth flows as the web SPA, including JWT handling, role/permission checks, and protected routes. Runtime configuration falls back to the `window.orderlyDesktop.apiBaseUrl` bridge so packaged builds can still discover the API host.
