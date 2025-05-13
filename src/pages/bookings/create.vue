<template>
  <div class="booking-page">
    <VaCard class="booking-card">
      <VaCardTitle>
        <h1 class="booking-title">Réserver un accès au salon</h1>
      </VaCardTitle>

      <VaCardContent v-if="loading">
        <div class="loading-container">
          <VaLoading color="primary" size="large" />
        </div>
      </VaCardContent>

      <VaAlert v-else-if="error" color="danger" class="mb-6" closable>
        {{ error }}
      </VaAlert>

      <div v-else-if="!selectedLounge" class="no-lounge-container">
        <VaIcon name="error_outline" size="large" color="primary" />
        <p>Aucun salon sélectionné. Veuillez choisir un salon depuis la liste.</p>
        <VaButton preset="primary" @click="navigateToLounges"> Voir les salons </VaButton>
      </div>

      <div v-else>
        <VaCardContent>
          <!-- Informations sur le salon -->
          <div class="lounge-info">
            <div class="lounge-image">
              <img
                :src="selectedLounge.imageUrl || 'https://via.placeholder.com/300x200?text=Lounge'"
                :alt="selectedLounge.name"
              />
            </div>
            <div class="lounge-details">
              <h2 class="lounge-name">{{ selectedLounge.name }}</h2>
              <div class="lounge-location">
                <VaIcon name="location_on" />
                <span>{{ selectedLounge.airport }}, {{ selectedLounge.country }}</span>
              </div>
              <div class="lounge-price">
                <div class="price-row">
                  <span>Prix standard:</span>
                  <span class="price">{{ formatPrice(selectedLounge.price) }}</span>
                </div>
                <div v-if="subscriptionType === 'CLASSIC'" class="price-row">
                  <span>Prix membre CLASSIC:</span>
                  <span class="price discounted">{{ formatPrice(selectedLounge.classicDiscountPrice) }}</span>
                </div>
                <div v-if="subscriptionType === 'PREMIUM'" class="price-row">
                  <span>Prix membre PREMIUM:</span>
                  <span class="price discounted">{{ formatPrice(selectedLounge.premiumDiscountPrice) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulaire de réservation -->
          <form class="booking-form" @submit.prevent="submitBooking">
            <div class="form-section">
              <h3>Détails de la réservation</h3>

              <div class="form-row">
                <VaDateInput
                  v-model="bookingDate"
                  label="Date de visite"
                  :min-date="new Date().toISOString().split('T')[0]"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-row">
                <div class="va-time-input-wrapper">
                  <label class="va-time-label">Heure d'arrivée</label>
                  <input v-model="bookingTime" type="time" required class="va-time-input form-control" />
                </div>
              </div>

              <div class="form-row">
                <VaSelect
                  v-model="numberOfGuests"
                  label="Nombre de personnes"
                  :options="guestsOptions"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-row">
                <VaTextarea
                  v-model="specialRequests"
                  label="Demandes spéciales (optionnel)"
                  placeholder="Indiquez vos demandes particulières ici..."
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-section">
              <h3>Récapitulatif de la commande</h3>

              <div class="summary-item">
                <span>Salon:</span>
                <span>{{ selectedLounge.name }}</span>
              </div>
              <div class="summary-item">
                <span>Date:</span>
                <span>{{ formatDate(bookingDate) }}</span>
              </div>
              <div class="summary-item">
                <span>Heure:</span>
                <span>{{ bookingTime }}</span>
              </div>
              <div class="summary-item">
                <span>Nombre de personnes:</span>
                <span>{{ numberOfGuests }}</span>
              </div>
              <div class="summary-item total">
                <span>Prix total:</span>
                <span>{{ formatPrice(calculateTotalPrice()) }}</span>
              </div>
            </div>

            <div class="form-actions">
              <VaButton type="button" preset="secondary" @click="cancelBooking"> Annuler </VaButton>
              <VaButton type="submit" preset="primary" :loading="submitting"> Confirmer la réservation </VaButton>
            </div>
          </form>
        </VaCardContent>
      </div>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '../../stores/booking'
import { useLoungeStore } from '../../stores/lounge'
import { useAuthStore } from '../../stores/auth'
import type { Lounge, CreateBookingDto } from '../../types'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const loungeStore = useLoungeStore()
const authStore = useAuthStore()

// État du formulaire
const bookingDate = ref<string>(new Date().toISOString().split('T')[0])
const bookingTime = ref<string>('10:00')
const numberOfGuests = ref(1)
const specialRequests = ref('')
const submitting = ref(false)

// État de la page
const loading = ref(false)
const error = ref<string | null>(null)

// Récupérer le type d'abonnement de l'utilisateur
const subscriptionType = computed(() => authStore.currentUser?.subscriptionType || null)

// Options pour le nombre de personnes
const guestsOptions = [1, 2, 3, 4, 5, 6].map((num) => ({
  text: num === 1 ? '1 personne' : `${num} personnes`,
  value: num,
}))

// Récupérer le loungeId depuis la query
const loungeId = computed(() => route.query.loungeId as string)
const selectedLounge = computed(() => loungeStore.currentLounge)

// Récupérer les informations du lounge
const fetchLoungeDetails = async () => {
  if (!loungeId.value) return

  loading.value = true
  try {
    await loungeStore.fetchLoungeById(loungeId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de récupérer les informations du salon'
  } finally {
    loading.value = false
  }
}

// Naviguer vers la liste des salons
const navigateToLounges = () => {
  router.push({ name: 'lounges' })
}

// Annuler la réservation
const cancelBooking = () => {
  router.push({ name: 'lounges' })
}

// Calculer le prix total
const calculateTotalPrice = () => {
  if (!selectedLounge.value) return 0

  const basePrice =
    subscriptionType.value === 'PREMIUM'
      ? selectedLounge.value.premiumDiscountPrice
      : subscriptionType.value === 'CLASSIC'
        ? selectedLounge.value.classicDiscountPrice
        : selectedLounge.value.price

  return basePrice * numberOfGuests.value
}

// Soumettre le formulaire de réservation
const submitBooking = async () => {
  if (!selectedLounge.value || !authStore.currentUser) return

  submitting.value = true
  error.value = null

  try {
    // Combiner la date et l'heure
    const [year, month, day] = bookingDate.value.split('-')
    const [hours, minutes] = bookingTime.value.split(':')
    const bookingDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
    )

    // Créer l'objet de réservation
    const bookingData: CreateBookingDto = {
      userId: authStore.currentUser.id, // Sera ignoré par l'API mais requis par le type
      loungeId: selectedLounge.value.id,
      bookingDate: bookingDateTime,
      numberOfGuests: numberOfGuests.value,
      totalPrice: calculateTotalPrice(),
      specialRequests: specialRequests.value || undefined,
    }

    // Envoyer la réservation
    const result = await bookingStore.createBooking(bookingData)

    if (result) {
      // Rediriger vers la page des réservations avec un message de succès
      router.push({
        name: 'bookings',
        query: { success: 'true' },
      })
    } else {
      error.value = 'Impossible de créer votre réservation. Veuillez réessayer.'
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de votre réservation'
  } finally {
    submitting.value = false
  }
}

// Formater le prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString

  const year = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const day = parseInt(parts[2])

  const date = new Date(year, month, day)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// Au chargement de la page
onMounted(async () => {
  if (!authStore.hasActiveSubscription) {
    router.push({ name: 'pricing-plans' })
    return
  }

  if (loungeId.value) {
    await fetchLoungeDetails()
  }
})
</script>

<style scoped>
.booking-page {
  max-width: 900px;
  margin: 0 auto;
}

.booking-card {
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.booking-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.5rem;
}

.loading-container,
.no-lounge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.lounge-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.lounge-image {
  width: 250px;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
}

.lounge-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lounge-details {
  flex: 1;
}

.lounge-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--va-primary);
}

.lounge-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #666;
}

.lounge-price {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
}

.price-row:not(:last-child) {
  border-bottom: 1px dashed #e0e0e0;
}

.price {
  font-weight: 700;
}

.price.discounted {
  color: var(--va-success);
}

.booking-form {
  margin-top: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: var(--va-primary);
}

.form-row {
  margin-bottom: 1.2rem;
}

.form-control {
  width: 100%;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item.total {
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #ddd;
  border-bottom: none;
  padding-top: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .lounge-info {
    flex-direction: column;
  }

  .lounge-image {
    width: 100%;
  }
}

.va-time-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.va-time-label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--va-text-primary);
}

.va-time-input {
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  padding: 0.65rem 1rem;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.2s;
}

.va-time-input:focus {
  outline: none;
  border-color: var(--va-primary);
  box-shadow: 0 0 0 2px rgba(var(--va-primary-rgb), 0.2);
}
</style>
