import { StatusBar } from 'expo-status-bar'
import RootNavigator from './src/navigation/RootNavigator'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'

function Shell() {
  const { isDark } = useTheme()
  return (
    <>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} animated translucent backgroundColor="transparent" />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  )
}
