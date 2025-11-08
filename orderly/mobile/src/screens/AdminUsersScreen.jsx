import { useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/api'

export default function AdminUsersScreen() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const styles = useMemo(() => createStyles(colors), [colors])

  const canView = user?.permissions?.includes('admin:read')

  async function loadUsers() {
    if (!canView) {
      return
    }

    try {
      const response = await api.get('/admin/users')
      setUsers(response.data?.users || [])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView])

  async function handleRefresh() {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {!canView ? (
        <View style={styles.centered}>
          <Text style={styles.title}>Admin access required</Text>
          <Text style={styles.subtitle}>
            Only administrators can view the full user directory.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id || item._id || item.email}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              progressBackgroundColor={colors.surface}
            />
          }
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.title}>Admin • Users</Text>
              {error ? <Text style={styles.error}>Error: {error}</Text> : null}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userDetail}>Roles: {(item.roles || []).join(', ') || '—'}</Text>
              <Text style={styles.userDetail}>
                Permissions: {(item.permissions || []).join(', ') || '—'}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No users found.</Text>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    header: {
      marginBottom: 12,
    },
    error: {
      color: colors.danger,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    userEmail: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.text,
    },
    userDetail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    empty: {
      textAlign: 'center',
      padding: 40,
      color: colors.textMuted,
    },
  })
