<template>
  <div class="booking-detail-page">
    <VaCard class="booking-detail-card">
      <VaCardTitle>
        <div class="title-container">
          <h1 class="booking-detail-title">Détails de la réservation</h1>
          <div class="back-button">
            <VaButton preset="secondary" icon="arrow_back" @click="goBack"> Retour </VaButton>
          </div>
        </div>
      </VaCardTitle>

      <VaCardContent>
        <!-- États de chargement et erreurs -->
        <div v-if="loading" class="loading-container">
          <VaLoading color="primary" size="large" />
        </div>
        <VaAlert v-else-if="error" color="danger" class="mb-6" closable>
          {{ error }}
        </VaAlert>
        <div v-else-if="!booking" class="no-booking-container">
          <VaIcon name="error_outline" size="large" color="primary" />
          <p>Réservation introuvable</p>
        </div>

        <!-- Détails de la réservation -->
        <div v-else class="booking-content">
          <!-- Statut et actions -->
          <div class="booking-header">
            <div class="booking-id">
              <span class="label">ID de réservation:</span>
              <span class="value id-value">{{ booking.id }}</span>
            </div>
            <div class="booking-status">
              <VaBadge :color="getStatusColor(booking.status)" :text="getStatusLabel(booking.status)" />
            </div>
          </div>

          <div class="booking-info-grid">
            <!-- Infos sur le salon -->
            <div class="booking-info-card">
              <h3 class="info-title">
                <VaIcon name="airline_seat_individual_suite" />
                Informations sur le salon
              </h3>
              <div class="info-content">
                <div v-if="booking.lounge" class="lounge-info">
                  <div class="lounge-image">
                    <img
                      :src="booking.lounge.imageUrl || 'https://via.placeholder.com/300x200?text=Lounge'"
                      :alt="booking.lounge.name"
                    />
                  </div>
                  <div class="lounge-details">
                    <h3 class="lounge-name">{{ booking.lounge.name }}</h3>
                    <div class="lounge-location">
                      <VaIcon name="location_on" />
                      <span>{{ booking.lounge.airport }}, {{ booking.lounge.country }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="no-lounge-info">
                  <p>Informations sur le salon non disponibles</p>
                </div>
              </div>
            </div>

            <!-- Infos sur la réservation -->
            <div class="booking-info-card">
              <h3 class="info-title">
                <VaIcon name="event_note" />
                Détails de la réservation
              </h3>
              <div class="info-content">
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDate(booking.bookingDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Heure:</span>
                  <span class="value">{{ formatTime(booking.bookingDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Nombre de personnes:</span>
                  <span class="value">{{ booking.numberOfGuests }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Prix total:</span>
                  <span class="value price">{{ formatPrice(booking.totalPrice) }}</span>
                </div>
                <div v-if="booking.specialRequests" class="detail-row">
                  <span class="label">Demandes spéciales:</span>
                  <span class="value">{{ booking.specialRequests }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Statut de paiement:</span>
                  <span class="value">{{ booking.isPaid ? 'Payé' : 'Non payé' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Réservé le:</span>
                  <span class="value">{{ formatDateTime(booking.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Infos sur le client (uniquement pour les admins) -->
            <div v-if="isAdmin" class="booking-info-card">
              <h3 class="info-title">
                <VaIcon name="person" />
                Informations sur le client
              </h3>
              <div class="info-content">
                <div v-if="booking.user" class="user-info">
                  <div class="detail-row">
                    <span class="label">Nom:</span>
                    <span class="value">{{ booking.user.firstName }} {{ booking.user.lastName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">{{ booking.user.email }}</span>
                  </div>
                  <div v-if="booking.user.phoneNumber" class="detail-row">
                    <span class="label">Téléphone:</span>
                    <span class="value">{{ booking.user.phoneNumber }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Type d'abonnement:</span>
                    <span class="value">{{ booking.user.subscriptionType || 'Aucun' }}</span>
                  </div>
                </div>
                <div v-else class="no-user-info">
                  <p>Informations sur le client non disponibles</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions (administrateur ou utilisateur) -->
          <div class="booking-actions">
            <VaButton
              v-if="isAdmin && booking.status === 'PENDING'"
              preset="primary"
              icon="check"
              :loading="actionInProgress"
              @click="confirmBooking(booking.id)"
            >
              Confirmer la réservation
            </VaButton>

            <VaButton
              v-if="isAdmin && booking.status === 'CONFIRMED'"
              preset="success"
              icon="done_all"
              :loading="actionInProgress"
              @click="completeBooking(booking.id)"
            >
              Marquer comme terminée
            </VaButton>

            <VaButton
              v-if="
                (isAdmin || booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
                booking.status !== 'CANCELLED'
              "
              preset="danger"
              icon="cancel"
              :loading="actionInProgress"
              @click="openCancelModal(booking.id)"
            >
              Annuler la réservation
            </VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modal de confirmation d'annulation -->
    <VaModal v-model="showCancelModal" title="Confirmer l'annulation" hide-default-actions>
      <p>Êtes-vous sûr de vouloir annuler cette réservation?</p>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="showCancelModal = false"> Non, garder la réservation </VaButton>
        <VaButton preset="danger" :loading="actionInProgress" @click="cancelBooking"> Oui, annuler </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '../../stores/booking'
import { useAuthStore } from '../../stores/auth'
import type { Booking } from '../../types'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const authStore = useAuthStore()

// État local
const loading = ref(false)
const error = ref<string | null>(null)
const showCancelModal = ref(false)
const bookingToCancel = ref<string | null>(null)
const actionInProgress = ref(false)

// Vérifier si l'utilisateur est un administrateur
const isAdmin = computed(() => authStore.isAdmin)

// Récupérer la réservation depuis le store
const booking = computed(() => bookingStore.currentBooking)

// Récupérer les détails de la réservation
const fetchBookingDetails = async () => {
  const bookingId = route.params.id as string
  if (!bookingId) return

  loading.value = true
  error.value = null

  try {
    await bookingStore.fetchBookingById(bookingId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de récupérer les détails de la réservation'
  } finally {
    loading.value = false
  }
}

// Retourner à la page précédente
const goBack = () => {
  if (isAdmin.value) {
    router.push({ name: 'admin-bookings' })
  } else {
    router.push({ name: 'bookings' })
  }
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
    error.value = err instanceof Error ? err.message : "Erreur lors de l'annulation de la réservation"
  } finally {
    actionInProgress.value = false
    bookingToCancel.value = null
  }
}

// Confirmer une réservation (admin)
const confirmBooking = async (bookingId: string) => {
  if (!isAdmin.value) return

  actionInProgress.value = true
  try {
    await bookingStore.confirmBooking(bookingId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors de la confirmation de la réservation'
  } finally {
    actionInProgress.value = false
  }
}

// Marquer une réservation comme terminée (admin)
const completeBooking = async (bookingId: string) => {
  if (!isAdmin.value) return

  actionInProgress.value = true
  try {
    await bookingStore.completeBooking(bookingId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du marquage de la réservation comme terminée'
  } finally {
    actionInProgress.value = false
  }
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

// Formater la date et l'heure
const formatDateTime = (date: Date) => {
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

onMounted(async () => {
  await fetchBookingDetails()
})
</script>

<style scoped>
.booking-detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.booking-detail-card {
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.booking-detail-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin: 0;
}

.loading-container,
.no-booking-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.booking-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.id-value {
  font-family: monospace;
  padding: 0.3rem 0.6rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
}

.booking-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.booking-info-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--va-primary);
  margin-top: 0;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
}

.lounge-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lounge-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}

.lounge-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lounge-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: var(--va-primary);
}

.lounge-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.95rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  font-weight: 600;
}

.value.price {
  color: var(--va-primary);
}

.booking-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .booking-actions {
    justify-content: center;
  }

  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
