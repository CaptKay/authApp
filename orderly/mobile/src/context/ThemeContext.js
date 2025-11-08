import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DarkTheme, DefaultTheme } from '@react-navigation/native'

const STORAGE_KEY = 'orderly-mobile-theme'

const palettes = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#d0d5dd',
    accent: '#2563eb',
    danger: '#dc2626',
    codeBg: '#111827',
    codeText: '#f8fafc',
    overlay: 'rgba(248, 250, 252, 0.85)',
  },
  dark: {
    background: '#0b1020',
    surface: '#12182b',
    surfaceAlt: '#26304a',
    text: '#e6e8f0',
    textMuted: '#9aa3b2',
    border: '#26304a',
    accent: '#3b82f6',
    danger: '#f87171',
    codeBg: '#0e1426',
    codeText: '#e6e8f0',
    overlay: 'rgba(11, 16, 32, 0.85)',
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme()
  const [theme, setTheme] = useState(systemScheme === 'dark' ? 'dark' : 'light')
  const [explicit, setExplicit] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored)
          setExplicit(true)
        }
      })
      .catch(() => {
        // ignore storage errors
      })
  }, [])

  useEffect(() => {
    if (explicit) return undefined
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })
    return () => subscription.remove()
  }, [explicit])

  useEffect(() => {
    if (!explicit) return
    AsyncStorage.setItem(STORAGE_KEY, theme).catch(() => {
      // ignore storage errors
    })
  }, [theme, explicit])

  const toggleTheme = useCallback(() => {
    setExplicit(true)
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => {
    const palette = palettes[theme]
    const base = theme === 'dark' ? DarkTheme : DefaultTheme
    const navTheme = {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.accent,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        notification: palette.accent,
      },
    }

    return {
      theme,
      isDark: theme === 'dark',
      colors: palette,
      navTheme,
      toggleTheme,
    }
  }, [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
