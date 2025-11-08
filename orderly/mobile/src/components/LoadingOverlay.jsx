import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
})
