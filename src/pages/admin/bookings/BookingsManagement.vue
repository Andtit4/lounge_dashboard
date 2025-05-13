<template>
  <div class="bookings-management">
    <VaCard class="mb-4">
      <VaCardTitle>
        <div class="title-container">
          <h1 class="bookings-management-title">Gestion des réservations</h1>
          <div class="filters">
            <VaInput v-model="searchQuery" placeholder="Rechercher une réservation..." clearable class="search-input">
              <template #append>
                <VaIcon name="search" />
              </template>
            </VaInput>
            <VaSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Filtrer par statut"
              clearable
              class="status-filter"
            />
          </div>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <!-- États de chargement et erreurs -->
        <div v-if="loading" class="loading-container">
          <VaLoading color="primary" size="large" />
        </div>
        <VaAlert v-else-if="error" color="danger" class="mb-4" closable>
          {{ error }}
        </VaAlert>
        <div v-else-if="!filteredBookings.length" class="no-bookings-container">
          <VaIcon name="event_busy" size="large" color="primary" />
          <p>Aucune réservation ne correspond à votre recherche</p>
        </div>

        <!-- Tableau des réservations -->
        <div v-else class="table-responsive">
          <table class="va-table">
            <thead>
              <tr>
                <th class="sortable-header" @click="sortBy('id')">
                  ID
                  <VaIcon
                    v-if="sortColumn === 'id'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('user.lastName')">
                  Client
                  <VaIcon
                    v-if="sortColumn === 'user.lastName'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('lounge.name')">
                  Salon
                  <VaIcon
                    v-if="sortColumn === 'lounge.name'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('bookingDate')">
                  Date
                  <VaIcon
                    v-if="sortColumn === 'bookingDate'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('numberOfGuests')">
                  Personnes
                  <VaIcon
                    v-if="sortColumn === 'numberOfGuests'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('totalPrice')">
                  Prix
                  <VaIcon
                    v-if="sortColumn === 'totalPrice'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th class="sortable-header" @click="sortBy('status')">
                  Statut
                  <VaIcon
                    v-if="sortColumn === 'status'"
                    :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                    size="small"
                  />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in paginatedBookings" :key="booking.id">
                <td class="booking-id">{{ truncateId(booking.id) }}</td>
                <td>{{ getUserName(booking) }}</td>
                <td>{{ booking.lounge?.name || 'N/A' }}</td>
                <td>{{ formatDate(booking.bookingDate) }}</td>
                <td>{{ booking.numberOfGuests }}</td>
                <td>{{ formatPrice(booking.totalPrice) }}</td>
                <td>
                  <VaBadge :color="getStatusColor(booking.status)" :text="getStatusLabel(booking.status)" />
                </td>
                <td>
                  <div class="action-buttons">
                    <VaButton
                      preset="secondary"
                      icon="visibility"
                      size="small"
                      @click="viewBookingDetails(booking.id)"
                    />

                    <VaButton
                      v-if="booking.status === 'PENDING'"
                      preset="primary"
                      icon="check"
                      size="small"
                      @click="confirmBooking(booking.id)"
                    />

                    <VaButton
                      v-if="booking.status === 'CONFIRMED'"
                      preset="success"
                      icon="done_all"
                      size="small"
                      @click="completeBooking(booking.id)"
                    />

                    <VaButton
                      v-if="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
                      preset="danger"
                      icon="cancel"
                      size="small"
                      @click="openCancelModal(booking.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredBookings.length" class="pagination-container">
          <VaPagination v-model="currentPage" :pages="totalPages" :boundaries="1" :siblings="1" />
          <div class="items-per-page">
            <span>Réservations par page:</span>
            <VaSelect v-model="itemsPerPage" :options="[10, 20, 50, 100]" class="items-per-page-select" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modal de confirmation d'annulation -->
    <VaModal v-model="showCancelModal" title="Confirmer l'annulation" hide-default-actions>
      <p>Êtes-vous sûr de vouloir annuler cette réservation?</p>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="showCancelModal = false"> Annuler </VaButton>
        <VaButton preset="danger" :loading="actionInProgress" @click="cancelBooking"> Confirmer l'annulation </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../../stores/booking'
import type { Booking } from '../../../types'

const router = useRouter()
const bookingStore = useBookingStore()

// État local
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortColumn = ref('bookingDate')
const sortDirection = ref<'asc' | 'desc'>('desc')
const showCancelModal = ref(false)
const bookingToCancel = ref<string | null>(null)
const actionInProgress = ref(false)

// Options pour le filtre de statut
const statusOptions = [
  { text: 'En attente', value: 'PENDING' },
  { text: 'Confirmée', value: 'CONFIRMED' },
  { text: 'Annulée', value: 'CANCELLED' },
  { text: 'Terminée', value: 'COMPLETED' },
]

// Récupérer toutes les réservations
const fetchAllBookings = async () => {
  loading.value = true
  error.value = null

  try {
    await bookingStore.fetchAllBookings()
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des réservations'
  } finally {
    loading.value = false
  }
}

// Filtrer les réservations en fonction de la recherche et du filtre de statut
const filteredBookings = computed(() => {
  let result = [...bookingStore.bookings]

  // Filtre de recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((booking) => {
      // Recherche sur plusieurs champs
      return (
        booking.id.toLowerCase().includes(query) ||
        (booking.user?.firstName && booking.user.firstName.toLowerCase().includes(query)) ||
        (booking.user?.lastName && booking.user.lastName.toLowerCase().includes(query)) ||
        (booking.lounge?.name && booking.lounge.name.toLowerCase().includes(query)) ||
        (booking.lounge?.airport && booking.lounge.airport.toLowerCase().includes(query))
      )
    })
  }

  // Filtre de statut
  if (statusFilter.value) {
    result = result.filter((booking) => booking.status === statusFilter.value)
  }

  // Tri
  result.sort((a, b) => {
    let valA, valB

    // Déterminer les valeurs à comparer selon la colonne de tri
    switch (sortColumn.value) {
      case 'user.lastName':
        valA = a.user?.lastName || ''
        valB = b.user?.lastName || ''
        break
      case 'lounge.name':
        valA = a.lounge?.name || ''
        valB = b.lounge?.name || ''
        break
      case 'bookingDate':
        valA = new Date(a.bookingDate).getTime()
        valB = new Date(b.bookingDate).getTime()
        break
      case 'numberOfGuests':
        valA = a.numberOfGuests
        valB = b.numberOfGuests
        break
      case 'totalPrice':
        valA = a.totalPrice
        valB = b.totalPrice
        break
      default:
        valA = a[sortColumn.value as keyof Booking]
        valB = b[sortColumn.value as keyof Booking]
    }

    // Comparer
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage.value))

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

// Remise à zéro de la pagination lors du changement de filtres
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Trier par colonne
const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Récupérer le nom du client
const getUserName = (booking: Booking) => {
  if (booking.user?.firstName && booking.user?.lastName) {
    return `${booking.user.firstName} ${booking.user.lastName}`
  }
  return booking.user?.email || 'Client inconnu'
}

// Tronquer l'ID pour l'affichage
const truncateId = (id: string) => {
  return id.substring(0, 8) + '...'
}

// Formater la date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Formater le prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Obtenir la couleur du badge selon le statut
const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'CANCELLED':
      return 'danger'
    case 'COMPLETED':
      return 'info'
    default:
      return 'gray'
  }
}

// Obtenir le libellé selon le statut
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmée'
    case 'PENDING':
      return 'En attente'
    case 'CANCELLED':
      return 'Annulée'
    case 'COMPLETED':
      return 'Terminée'
    default:
      return status
  }
}

// Voir les détails d'une réservation
const viewBookingDetails = (bookingId: string) => {
  router.push({ name: 'admin-bookings-detail', params: { id: bookingId } })
}

// Ouvrir la modal de confirmation d'annulation
const openCancelModal = (bookingId: string) => {
  bookingToCancel.value = bookingId
  showCancelModal.value = true
}

// Annuler une réservation
const cancelBooking = async () => {
  if (!bookingToCancel.value) return

  actionInProgress.value = true
  try {
    await bookingStore.cancelBooking(bookingToCancel.value)
    showCancelModal.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Une erreur est survenue lors de l'annulation de la réservation"
  } finally {
    actionInProgress.value = false
    bookingToCancel.value = null
  }
}

// Confirmer une réservation
const confirmBooking = async (bookingId: string) => {
  actionInProgress.value = true
  try {
    await bookingStore.confirmBooking(bookingId)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors de la confirmation de la réservation'
  } finally {
    actionInProgress.value = false
  }
}

// Marquer une réservation comme terminée
const completeBooking = async (bookingId: string) => {
  actionInProgress.value = true
  try {
    await bookingStore.completeBooking(bookingId)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors du marquage de la réservation comme terminée'
  } finally {
    actionInProgress.value = false
  }
}

onMounted(async () => {
  await fetchAllBookings()
})
</script>

<style scoped>
.bookings-management {
  max-width: 1200px;
  margin: 0 auto;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bookings-management-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 2;
  min-width: 250px;
}

.status-filter {
  flex: 1;
  min-width: 200px;
}

.loading-container,
.no-bookings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.va-table {
  width: 100%;
  border-collapse: collapse;
}

.va-table th,
.va-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.va-table th {
  background-color: #f9f9f9;
  font-weight: 600;
}

.va-table tr:hover {
  background-color: #f5f5f5;
}

.sortable-header {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.booking-id {
  font-family: monospace;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page-select {
  width: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .title-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .filters {
    flex: 1;
    justify-content: flex-end;
  }
}
</style>
