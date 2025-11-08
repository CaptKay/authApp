import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../context/ThemeContext'

export default function LoadingOverlay({ message = 'Loading...' }) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
})
