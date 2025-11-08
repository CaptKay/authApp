import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import LoadingOverlay from '../components/LoadingOverlay'
import LoginScreen from '../screens/LoginScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AccountsScreen from '../screens/AccountsScreen'
import SalesScreen from '../screens/SalesScreen'
import AdminUsersScreen from '../screens/AdminUsersScreen'
import { useTheme } from '../context/ThemeContext'
import ThemeToggleButton from '../components/ThemeToggleButton'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

function AppTabs() {
  const { colors } = useTheme()
  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => <ThemeToggleButton />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
      <Tab.Screen name="Admin" component={AdminUsersScreen} />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { accessToken, booting } = useAuth()
  const { navTheme } = useTheme()

  if (booting) {
    return <LoadingOverlay message="Restoring session…" />
  }

  return (
    <NavigationContainer theme={navTheme}>
      {accessToken ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}
