// @ts-ignore
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api, { setAccessToken } from "../api/api.js";

const AuthCtx = createContext(null);

// Keep values across refreshes (dev convenience)
const storage = {
  save({ token, user, nextPath }) {
    if (token != null) sessionStorage.setItem("accessToken", token); // ✅ add value
    if (user != null) sessionStorage.setItem("user", JSON.stringify(user));
    if (nextPath != null) sessionStorage.setItem("nextPath", nextPath);
  },

  load() {
    return {
      token: sessionStorage.getItem("accessToken"),
      user: JSON.parse(sessionStorage.getItem("user") || "null"),
      nextPath: sessionStorage.getItem("nextPath") || "/profile",
    };
  },

  clear() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("nextPath");
  },
};

// @ts-ignore
export function AuthProvider({ children }) {
  // @ts-ignore
  const [accessToken, setToken] = useState(null);
  // @ts-ignore
  const [user, setUser] = useState(null);
  // @ts-ignore
  const [nextPath, setNextPath] = useState("/profile");
  // @ts-ignore
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const stored = storage.load();
    if (stored.token) {
      setToken(stored.token);
      setAccessToken(stored.token);
    }
    if (stored.user) setUser(stored.user);
    if (stored.nextPath) setNextPath(stored.nextPath);
    setBooting(false);
  }, []);

  // ——— internal helpers exposed to Bootstrap ———
  // @ts-ignore
  async function setSession({ token, user, nextPath }) {
    if (token) {
      setToken(token);
      setAccessToken(token);
    }
    if (user) setUser(user);
    if (nextPath) setNextPath(nextPath);
    storage.save({ token, user, nextPath });
  }

  // @ts-ignore
  function clearSession() {
    setToken(null);
    setAccessToken(null);
    setUser(null);
    setNextPath("/profile");
    storage.clear();
  }

  // ——— public API for pages ———
  // login
  async function login({ email, password, totp, backupCode }) {
    // @ts-ignore
    setLoading(true);
    try {
      const resp = await api.post("/auth/login", {
        email,
        password,
        totp,
        backupCode,
      });
      const { accessToken, user, nextPath } = resp.data || {};
      if (!accessToken) return { ok: false, error: "No token returned" };

      // @ts-ignore
      await setSession({ token: accessToken, user, nextPath });
      return { ok: true, nextPath: nextPath || "/profile" };
    } catch (error) {
      console.error("[login] failed:", error?.response?.data || error.message);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.errorMessage ||
        "Login failed";
      return { ok: false, error: msg };
    } finally {
      // @ts-ignore
      setLoading(false);
    }
  }

  // logout
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("[logout] warning:", error?.response?.data || error.message);
      // even if server fails, clear local state
    }
    // @ts-ignore
    clearSession();
  }

  // @ts-ignore
  const value = useMemo(
    () => ({
      // state
      accessToken,
      user,
      nextPath,
      loading,
      booting,
      // actions
      login,
      logout,
      // expose for Bootstrap
      setSession,
      clearSession,
      setBooting,
    }),
    [accessToken, user, nextPath, loading, booting]
  );

  // @ts-ignore
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthCtx);
}
