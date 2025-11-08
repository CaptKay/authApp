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
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
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

  if (booting) {
    return <LoadingOverlay message="Restoring session…" />
  }

  return (
    <NavigationContainer>
      {accessToken ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}
