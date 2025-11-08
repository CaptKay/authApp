import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggleButton() {
  const { isDark, toggleTheme, colors } = useTheme()

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onPress={toggleTheme}
      style={[styles.button, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{isDark ? '🌙' : '☀️'}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
})
