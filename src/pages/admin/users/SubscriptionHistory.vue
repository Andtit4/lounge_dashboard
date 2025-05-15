<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SubscriptionService } from '../../../services/api/subscriptionService'
import { formatDate } from '../../../utils/formatters'
import type { IUser } from '../../../services/api/userService'
import { getSubscriptionStatus, getStatusColor, getStatusText } from '../../../utils/subscriptionUtils'

// Définir l'interface pour les transactions d'abonnement
interface ISubscriptionTransaction {
  id: string
  userId: string
  subscriptionType: string
  amount: number
  paymentMethod: string
  transactionDate: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

// Props
const props = defineProps({
  user: {
    type: Object as () => IUser,
    required: true,
  },
})

// État local
const transactions = ref<ISubscriptionTransaction[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Formatage des montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Formatage du statut de paiement
const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'info'
    case 'failed':
      return 'danger'
    case 'refunded':
      return 'warning'
    default:
      return 'secondary'
  }
}

const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Payé'
    case 'pending':
      return 'En attente'
    case 'failed':
      return 'Échoué'
    case 'refunded':
      return 'Remboursé'
    default:
      return 'Inconnu'
  }
}

// Transactions triées par date (plus récente en premier)
const sortedTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => {
    return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  })
})

// Charger les transactions de l'utilisateur
const loadTransactions = async () => {
  if (!props.user || !props.user.id) return

  isLoading.value = true
  error.value = null

  try {
    // Simulation : utiliser un tableau vide pour les transactions
    transactions.value = []
    console.log('Transactions chargées (simulation)')
  } catch (err) {
    console.error('Erreur lors du chargement des transactions:', err)
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}

// Émission d'événements
const emit = defineEmits(['add-transaction'])

// Ajouter une nouvelle transaction
const handleAddTransaction = () => {
  emit('add-transaction')
}

// Au montage du composant
onMounted(() => {
  loadTransactions()
})

// Fonction pour formater la date
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatSubscriptionDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="subscription-history">
    <div class="history-header">
      <h3 class="history-title">Historique des abonnements</h3>
      <VaButton size="small" color="primary" icon="add" @click="handleAddTransaction">
        Ajouter une transaction
      </VaButton>
    </div>

    <div v-if="isLoading" class="loading-state">
      <VaProgress indeterminate />
      <span>Chargement de l'historique...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <VaButton size="small" @click="loadTransactions">Réessayer</VaButton>
    </div>

    <div v-else-if="transactions.length === 0" class="empty-state">
      <p>Aucune transaction d'abonnement trouvée pour cet utilisateur.</p>
      <VaButton color="primary" size="small" @click="handleAddTransaction"> Ajouter la première transaction </VaButton>
    </div>

    <div v-else class="transactions-list">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Forfait</th>
            <th>Montant</th>
            <th>Statut paiement</th>
            <th>Période</th>
            <th>Méthode</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in sortedTransactions" :key="transaction.id">
            <td>{{ formatDate(transaction.transactionDate) }}</td>
            <td>
              <VaBadge color="primary" text="text">
                {{ transaction.subscriptionType }}
              </VaBadge>
            </td>
            <td class="amount">{{ formatAmount(transaction.amount) }}</td>
            <td>
              <VaBadge :color="getPaymentStatusColor(transaction.status)">
                {{ getPaymentStatusText(transaction.status) }}
              </VaBadge>
            </td>
            <td>
              <div class="period-info">
                <div>{{ formatDate(transaction.startDate) }}</div>
                <div class="period-separator">→</div>
                <div>{{ formatDate(transaction.endDate) }}</div>
                <VaBadge
                  class="period-status"
                  size="small"
                  :color="getStatusColor(getSubscriptionStatus(transaction.startDate, transaction.endDate))"
                >
                  {{ getStatusText(getSubscriptionStatus(transaction.startDate, transaction.endDate)) }}
                </VaBadge>
              </div>
            </td>
            <td>{{ transaction.paymentMethod }}</td>
            <td class="notes-cell">{{ transaction.notes || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.subscription-history {
  margin-top: 2rem;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.history-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: var(--va-primary);
}

.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #e0e0e0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-state {
  color: var(--va-danger);
}

.empty-state {
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
}

.transactions-list {
  overflow-x: auto;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #e0e0e0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  white-space: nowrap;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #f5f5f5;
}

.amount {
  font-weight: 600;
  font-family: monospace;
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.period-separator {
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}

.period-status {
  margin-top: 0.25rem;
  align-self: flex-start;
}

.notes-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 0.9em;
}

.transaction-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.transaction-status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.transaction-status-pending {
  background-color: #e3f2fd;
  color: #1565c0;
}

.transaction-status-failed {
  background-color: #ffebee;
  color: #c62828;
}

.transaction-status-refunded {
  background-color: #fff8e1;
  color: #f57f17;
}
</style>
