import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function AccountsScreen() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const canView = user?.permissions?.includes('accounts:read')

  async function loadInvoices() {
    if (!canView) {
      return
    }

    try {
      const response = await api.get('/accounts/invoices')
      setInvoices(response.data?.invoices || [])
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    }
  }

  useEffect(() => {
    loadInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView])

  async function handleRefresh() {
    setRefreshing(true)
    await loadInvoices()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {!canView ? (
        <View style={styles.centered}>
          <Text style={styles.title}>Access restricted</Text>
          <Text style={styles.subtitle}>
            Your account does not have permission to view Accounts invoices.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id || item._id || String(item.number)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.title}>Accounts Invoices</Text>
              {error ? <Text style={styles.error}>Error: {error}</Text> : null}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.invoiceTitle}>Invoice #{item.number}</Text>
              <Text style={styles.invoiceDetail}>Customer: {item.customer}</Text>
              <Text style={styles.invoiceDetail}>Total: {item.total}</Text>
              <Text style={styles.invoiceDetail}>Status: {item.status}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>No invoices found.</Text>
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
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  invoiceDetail: {
    fontSize: 14,
    color: '#374151',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#6b7280',
  },
})
