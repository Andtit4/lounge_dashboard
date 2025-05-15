<template>
  <div class="bookings-page">
    <VaCard class="bookings-card">
      <VaCardTitle>
        <div class="title-container">
          <h1 class="bookings-title">Mes réservations</h1>
          <VaButton preset="primary" icon="add" class="new-booking-btn" @click="navigateToLounges">
            Nouvelle réservation
          </VaButton>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <!-- Message de succès -->
        <VaAlert v-if="showSuccessAlert" color="success" closable class="mb-6" @close="closeSuccessAlert">
          Votre réservation a été créée avec succès!
        </VaAlert>

        <!-- États de chargement et erreurs -->
        <div v-if="bookingStore.loading" class="loading-container">
          <VaLoading color="primary" size="large" />
        </div>
        <VaAlert v-else-if="bookingStore.error" color="danger" class="mb-6" closable>
          {{ bookingStore.error }}
        </VaAlert>
        <div v-else-if="!bookingStore.bookings.length" class="no-bookings-container">
          <VaIcon name="event_busy" size="large" color="primary" />
          <p>Vous n'avez pas encore de réservations</p>
          <VaButton preset="primary" @click="navigateToLounges"> Réserver un salon </VaButton>
        </div>

        <!-- Liste des réservations -->
        <div v-else class="bookings-list">
          <div v-for="booking in bookingStore.bookings" :key="booking.id" class="booking-item">
            <VaCard class="booking-card">
              <div class="booking-card-content">
                <div class="booking-status-badge" :class="getStatusClass(booking.status)">
                  {{ getStatusLabel(booking.status) }}
                </div>

                <div class="booking-main">
                  <div class="booking-header">
                    <h3 class="booking-lounge-name">{{ getLoungeInfo(booking, 'name') }}</h3>
                    <div class="booking-location">
                      <VaIcon name="location_on" size="small" />
                      <span>{{ getLoungeInfo(booking, 'airport') }}, {{ getLoungeInfo(booking, 'country') }}</span>
                    </div>
                  </div>

                  <div class="booking-details">
                    <div class="detail-item">
                      <VaIcon name="calendar_today" size="small" />
                      <span>{{ formatDate(booking.bookingDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <VaIcon name="schedule" size="small" />
                      <span>{{ formatTime(booking.bookingDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <VaIcon name="people" size="small" />
                      <span
                        >{{ booking.numberOfGuests }} {{ booking.numberOfGuests > 1 ? 'personnes' : 'personne' }}</span
                      >
                    </div>
                    <div class="detail-item">
                      <VaIcon name="euro" size="small" />
                      <span>{{ formatPrice(booking.totalPrice) }}</span>
                    </div>
                  </div>
                </div>

                <div class="booking-actions">
                  <VaButton
                    preset="secondary"
                    icon="visibility"
                    class="details-btn"
                    @click="viewBookingDetails(booking.id)"
                  >
                    Détails
                  </VaButton>

                  <VaButton
                    v-if="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
                    preset="danger"
                    icon="cancel"
                    class="cancel-btn"
                    @click="confirmCancelBooking(booking.id)"
                  >
                    Annuler
                  </VaButton>
                </div>
              </div>
            </VaCard>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modal de confirmation d'annulation -->
    <VaModal v-model="showCancelModal" title="Confirmer l'annulation" hide-default-actions>
      <p>Êtes-vous sûr de vouloir annuler cette réservation?</p>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="showCancelModal = false"> Non, garder la réservation </VaButton>
        <VaButton preset="danger" :loading="cancelling" @click="cancelBooking"> Oui, annuler </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '../../stores/booking'
import type { Booking } from '../../types'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()

// État local
const showSuccessAlert = ref(false)
const showCancelModal = ref(false)
const bookingToCancel = ref<string | null>(null)
const cancelling = ref(false)

// Vérifier si on vient de créer une réservation
onMounted(async () => {
  if (route.query.success === 'true') {
    showSuccessAlert.value = true
  }
  await fetchBookings()
})

// Récupérer les réservations de l'utilisateur
const fetchBookings = async () => {
  await bookingStore.fetchUserBookings()
}

// Fermer l'alerte de succès
const closeSuccessAlert = () => {
  showSuccessAlert.value = false
  const newRoute = { ...route }
  delete newRoute.query.success
  router.replace(newRoute)
}

// Naviguer vers la liste des salons
const navigateToLounges = () => {
  router.push({ name: 'lounges' })
}

// Voir les détails d'une réservation
const viewBookingDetails = (bookingId: string) => {
  router.push({ name: 'bookings-detail', params: { id: bookingId } })
}

// Confirmer l'annulation d'une réservation
const confirmCancelBooking = (bookingId: string) => {
  bookingToCancel.value = bookingId
  showCancelModal.value = true
}

// Annuler une réservation
const cancelBooking = async () => {
  if (!bookingToCancel.value) return

  cancelling.value = true
  try {
    await bookingStore.cancelBooking(bookingToCancel.value)
    showCancelModal.value = false
  } catch (error) {
    console.error("Erreur lors de l'annulation de la réservation:", error)
  } finally {
    cancelling.value = false
    bookingToCancel.value = null
  }
}

// Récupérer les informations du salon
const getLoungeInfo = (booking: Booking, field: string) => {
  if (booking.lounge) {
    return booking.lounge[field as keyof typeof booking.lounge] || 'Information non disponible'
  }
  return 'Information non disponible'
}

// Obtenir la classe CSS selon le statut
const getStatusClass = (status: Booking['status']) => {
  switch (status) {
    case 'CONFIRMED':
      return 'status-confirmed'
    case 'CANCELLED':
      return 'status-cancelled'
    case 'COMPLETED':
      return 'status-completed'
    default:
      return 'status-pending'
  }
}

// Obtenir le libellé selon le statut
const getStatusLabel = (status: Booking['status']) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmée'
    case 'CANCELLED':
      return 'Annulée'
    case 'COMPLETED':
      return 'Terminée'
    default:
      return 'En attente'
  }
}

// Formater le prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Formater la date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Formater l'heure
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

<style scoped>
.bookings-page {
  max-width: 900px;
  margin: 0 auto;
}

.bookings-card {
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.bookings-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin: 0;
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

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-item {
  margin-bottom: 1rem;
}

.booking-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.booking-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.booking-card-content {
  display: flex;
  position: relative;
  padding: 1.5rem;
}

.booking-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-pending {
  background-color: #fef6e6;
  color: #f59e0b;
}

.status-confirmed {
  background-color: #e9f7ef;
  color: #10b981;
}

.status-cancelled {
  background-color: #fee6e6;
  color: #ef4444;
}

.status-completed {
  background-color: #e6f0fe;
  color: #3b82f6;
}

.booking-main {
  flex: 1;
}

.booking-header {
  margin-bottom: 1rem;
}

.booking-lounge-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.3rem;
}

.booking-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.95rem;
}

.booking-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.95rem;
  color: #555;
  background-color: #f9f9f9;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.details-btn,
.cancel-btn {
  min-width: 120px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .new-booking-btn {
    width: 100%;
  }

  .booking-card-content {
    flex-direction: column;
  }

  .booking-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 1rem;
  }

  .details-btn,
  .cancel-btn {
    flex: 1;
  }
}
</style>
