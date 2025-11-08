import { useEffect, useMemo, useState } from 'react'
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/api'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { colors } = useTheme()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const styles = useMemo(() => createStyles(colors), [colors])

  async function loadProfile() {
    try {
      const response = await api.get('/profile')
      setProfile(response.data)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadProfile()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <Text style={styles.heading}>Welcome back</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth context user</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>{JSON.stringify(user, null, 2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>/profile response</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>
              {error
                ? `Error: ${error}`
                : profile
                ? JSON.stringify(profile, null, 2)
                : 'Loading profile…'}
            </Text>
          </View>
        </View>

        <Text style={styles.logout} onPress={logout}>
          Sign out
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
    },
    heading: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
      color: colors.text,
    },
    section: {
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.text,
    },
    codeBlock: {
      borderRadius: 10,
      backgroundColor: colors.codeBg,
      padding: 16,
    },
    code: {
      color: colors.codeText,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
      fontSize: 12,
    },
    logout: {
      marginTop: 8,
      fontSize: 16,
      color: colors.danger,
      fontWeight: '600',
    },
  })
