import { useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/api'

export default function SalesScreen() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const styles = useMemo(() => createStyles(colors), [colors])

  const canView = user?.permissions?.includes('sales:read')

  async function loadOrders() {
    if (!canView) {
      return
    }

    try {
      const response = await api.get('/sales/orders')
      setOrders(response.data?.orders || [])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView])

  async function handleRefresh() {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {!canView ? (
        <View style={styles.centered}>
          <Text style={styles.title}>Access restricted</Text>
          <Text style={styles.subtitle}>
            You need the sales:read permission to see order data.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id || item._id || String(item.number)}
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
              <Text style={styles.title}>Sales Orders</Text>
              {error ? <Text style={styles.error}>Error: {error}</Text> : null}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderTitle}>Order #{item.number}</Text>
              <Text style={styles.orderDetail}>Customer: {item.customer}</Text>
              <Text style={styles.orderDetail}>Amount: {item.amount}</Text>
              <Text style={styles.orderDetail}>Status: {item.status}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No orders found.</Text>
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
    orderTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: colors.text,
    },
    orderDetail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    empty: {
      textAlign: 'center',
      padding: 40,
      color: colors.textMuted,
    },
  })
