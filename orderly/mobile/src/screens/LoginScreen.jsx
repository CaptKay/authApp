import { useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginScreen() {
  const { login, loading } = useAuth()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const styles = useMemo(() => createStyles(colors), [colors])

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Missing credentials', 'Please enter your email and password.')
      return
    }

    const result = await login({ email, password, totp, backupCode })
    if (!result.ok) {
      Alert.alert('Login failed', result.error || 'Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Orderly Mobile Login</Text>
          <Text style={styles.description}>
            Sign in with the same credentials you use on the web dashboard.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.subHeading}>Two-factor authentication (optional)</Text>
          <TextInput
            placeholder="6-digit TOTP code"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={totp}
            onChangeText={setTotp}
          />

          <TextInput
            placeholder="Backup code"
            autoCapitalize="characters"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={backupCode}
            onChangeText={setBackupCode}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonLabel}>{loading ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heading: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
      color: colors.text,
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      fontSize: 16,
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
    },
    subHeading: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
      color: colors.textMuted,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonLabel: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  })
