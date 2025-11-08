# Orderly Mobile (React Native)

A cross-platform React Native (Expo) client that mirrors the existing web dashboard. It
shares the authentication flows (email/password + MFA) and consumes the same REST API
endpoints for profile data, accounts invoices, sales orders, and admin user management.

## Getting started

```bash
cd orderly/mobile
npm install
```

Create a `.env` file based on `.env.example` and point `EXPO_PUBLIC_API_URL` at your API
instance (the default assumes the Node server is running on `http://localhost:3000/api`).

```bash
cp .env.example .env
```

Then launch the Expo development server:

```bash
npm run start
```

From the Expo CLI UI you can open the native app on:

- **iOS** simulators (or a physical device via the Expo Go app)
- **Android** emulators/devices
- **Web** (for quick inspection in a browser)

For convenience there are shortcut scripts:

```bash
npm run ios    # iOS simulator
npm run android
npm run web
```

## How it works

- `src/context/AuthContext.js` mirrors the web client's auth provider, storing the access
  token + user profile in `AsyncStorage` and attaching the access token to the shared Axios
  instance. The refresh-token interceptor matches the browser behaviour so sessions stay
  alive as long as the refresh cookie is valid.
- `src/navigation/RootNavigator.jsx` toggles between the login stack and the authenticated
  tab navigator. Tabs expose profile, accounts, sales, and admin screens, all guarded by
  the same permission checks used on the web.
- Each screen hits the corresponding API endpoint and renders either the JSON payload or a
  friendly permission error when the user lacks access.

## Linting

You can run Expo's lint rules with:

```bash
npm run lint
```
