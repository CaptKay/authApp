import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAccessToken } from '../api/api'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  token: 'orderly/accessToken',
  user: 'orderly/user',
  nextPath: 'orderly/nextPath',
}

async function saveToStorage({ token, user, nextPath }) {
  const operations = []
  if (token != null) {
    operations.push(AsyncStorage.setItem(STORAGE_KEYS.token, token))
  }
  if (user != null) {
    operations.push(AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)))
  }
  if (nextPath != null) {
    operations.push(AsyncStorage.setItem(STORAGE_KEYS.nextPath, nextPath))
  }
  if (operations.length) {
    await Promise.all(operations)
  }
}

async function loadFromStorage() {
  const [token, userRaw, nextPath] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.token),
    AsyncStorage.getItem(STORAGE_KEYS.user),
    AsyncStorage.getItem(STORAGE_KEYS.nextPath),
  ])

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
    nextPath: nextPath || '/profile',
  }
}

async function clearStorage() {
  await Promise.all(
    Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
  )
}

export function AuthProvider({ children }) {
  const [accessToken, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [nextPath, setNextPath] = useState('/profile')
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const stored = await loadFromStorage()
        if (!active) return

        if (stored.token) {
          setToken(stored.token)
          setAccessToken(stored.token)
        }
        if (stored.user) {
          setUser(stored.user)
        }
        if (stored.nextPath) {
          setNextPath(stored.nextPath)
        }
      } finally {
        if (active) setBooting(false)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  async function setSession({ token, user: userData, nextPath: incomingNextPath }) {
    if (token) {
      setToken(token)
      setAccessToken(token)
    }
    if (userData) {
      setUser(userData)
    }
    if (incomingNextPath) {
      setNextPath(incomingNextPath)
    }
    await saveToStorage({ token, user: userData, nextPath: incomingNextPath })
  }

  async function clearSession() {
    setToken(null)
    setAccessToken(null)
    setUser(null)
    setNextPath('/profile')
    await clearStorage()
  }

  async function login({ email, password, totp, backupCode }) {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        totp,
        backupCode,
      })

      const { accessToken: token, user: userPayload, nextPath: responseNextPath } =
        response.data || {}

      if (!token) {
        return { ok: false, error: 'No access token returned from server' }
      }

      await setSession({ token, user: userPayload, nextPath: responseNextPath })

      return { ok: true, nextPath: responseNextPath || '/profile' }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.errorMessage ||
        'Unable to login'
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout failures but log for debugging
      console.warn('[logout] request failed', error?.response?.data || error.message)
    } finally {
      await clearSession()
    }
  }

  const value = useMemo(
    () => ({
      accessToken,
      user,
      nextPath,
      loading,
      booting,
      login,
      logout,
      setSession,
      clearSession,
      setBooting,
    }),
    [accessToken, user, nextPath, loading, booting]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
