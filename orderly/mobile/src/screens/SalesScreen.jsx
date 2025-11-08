import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function SalesScreen() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  error: {
    color: '#ef4444',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderDetail: {
    fontSize: 14,
    color: '#374151',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#6b7280',
  },
})
