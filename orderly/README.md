# Orderly Authentication Demo

This repository contains a full-stack authentication and authorization playground
built with a Node.js/Express API, MongoDB, and a React client. It now also
includes a cross-platform Electron desktop shell and a React Native (Expo)
mobile app that consume the same endpoints as the web front-end without
duplicating UI logic.

## Projects

- `server/` – Express API with JWT auth, refresh tokens, MFA, RBAC, and audit logging.
- `client/` – React + Vite SPA used as the primary reference implementation.
- `desktop/` – Electron + React desktop application targeting Windows, macOS, and Linux.
- `mobile/` – React Native (Expo) client for iOS, Android, and the web.

## Desktop application

1. Install dependencies and start the desktop shell in development mode:

   ```bash
   cd desktop
   npm install
   npm run dev
   ```

   The script runs the Vite dev server on port `5173` and launches Electron once
   the renderer is ready.

2. Copy `.env.example` to `.env` and adjust `VITE_API_URL` so the desktop client
   can talk to your API server. Packaged builds will fall back to the preload
   bridge (`window.orderlyDesktop.apiBaseUrl`).

3. Build installers for macOS, Windows, and Linux:

   ```bash
   npm run build
   ```

   Packages are emitted to `desktop/release/` via `electron-builder` (`dmg`,
   `nsis`, `AppImage`, `deb`).

The renderer reuses the same auth flows and protected routes exported from the
web SPA so both surfaces stay aligned feature-for-feature.

## Mobile application (React Native / Expo)

1. Install dependencies and copy the example environment file:

   ```bash
   cd mobile
   npm install
   cp .env.example .env
   ```

   Ensure `EXPO_PUBLIC_API_URL` points at your API server (defaults to
   `http://localhost:3000/api`).

2. Start the Expo dev server:

   ```bash
   npm run start
   ```

   Use the Expo interface to launch iOS simulators, Android emulators/devices,
   or the web preview. Convenience scripts `npm run ios`, `npm run android`,
   and `npm run web` are also available.

The mobile app mirrors the browser experience: it persists tokens in
`AsyncStorage`, reuses the API client with refresh-token retries, and exposes
profile, accounts, sales, and admin screens gated by the same permissions used
elsewhere in the project.
