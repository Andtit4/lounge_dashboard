<template>
  <!-- États de chargement et d'erreur -->
  <div v-if="loading || isLoading" class="loading-container my-6">
    <VaLoading size="large" color="primary" />
  </div>
  <div v-else-if="error" class="mb-6">
    <VaAlert color="danger" closable>{{ error }}</VaAlert>
  </div>
  <div v-else-if="!lounge" class="mb-6">
    <VaAlert color="info">Salon non trouvé</VaAlert>
  </div>

  <!-- Contenu principal lorsque les données sont chargées -->
  <div v-else class="lounge-details-container">
    <!-- En-tête avec image de couverture -->
    <div class="lounge-header mb-6">
      <div
        class="lounge-cover-image"
        :style="`background-image: url(${
          lounge.imageUrl ||
          'https://images.unsplash.com/photo-1566196544088-7891620c9d95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
        })`"
      >
        <div class="lounge-header-overlay">
          <h1 class="lounge-title">{{ lounge.name }}</h1>
          <div class="lounge-meta">
            <div class="lounge-location">
              <VaIcon name="location_on" />
              <span>{{ lounge.location }} - {{ lounge.airport }}</span>
            </div>
            <div class="lounge-country">
              <VaIcon name="public" />
              <span>{{ lounge.country }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal en deux colonnes sur desktop -->
    <div class="lounge-content-container">
      <!-- Colonne gauche - Informations sur le salon -->
      <div class="lounge-info-section">
        <VaCard class="info-card">
          <VaCardTitle class="card-title">
            <VaIcon name="info" />
            À propos de ce salon
          </VaCardTitle>
          <VaCardContent>
            <p class="lounge-description">{{ lounge.description }}</p>

            <div v-if="lounge.amenities" class="amenities-section">
              <h3 class="section-title">
                <VaIcon name="star" />
                Services disponibles
              </h3>
              <div class="amenities-list">
                <VaChip
                  v-for="(amenity, index) in formatAmenities(lounge.amenities)"
                  :key="index"
                  color="primary"
                  size="small"
                  class="amenity-chip"
                >
                  {{ amenity.trim() }}
                </VaChip>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Colonne droite - Tarifs et réservation -->
      <div class="lounge-booking-section">
        <!-- Carte des tarifs -->
        <VaCard class="pricing-card mb-4">
          <VaCardTitle class="card-title">
            <VaIcon name="payments" />
            Tarifs
          </VaCardTitle>
          <VaCardContent>
            <div class="pricing-grid">
              <div class="pricing-item standard">
                <div class="pricing-header">Standard</div>
                <div class="pricing-value">{{ formatPrice(lounge.price) }}</div>
                <div class="pricing-description">Prix normal pour visiteurs</div>
              </div>

              <div class="pricing-item classic">
                <div class="pricing-header">
                  <VaBadge color="warning" text="CLASSIC" />
                </div>
                <div class="pricing-value">{{ formatPrice(lounge.classicDiscountPrice) }}</div>
                <div class="pricing-description">Avec abonnement Classic</div>
              </div>

              <div class="pricing-item premium">
                <div class="pricing-header">
                  <VaBadge color="success" text="PREMIUM" />
                </div>
                <div class="pricing-value">{{ formatPrice(lounge.premiumDiscountPrice) }}</div>
                <div class="pricing-description">Avec abonnement Premium</div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Carte de réservation -->
        <VaCard class="booking-card">
          <VaCardTitle class="card-title">
            <VaIcon name="event_available" />
            Réserver maintenant
          </VaCardTitle>
          <VaCardContent>
            <div v-if="hasSubscription">
              <form @submit.prevent="submitBooking">
                <div class="booking-form">
                  <VaDateInput
                    v-model="bookingForm.bookingDate"
                    label="Date de réservation"
                    :min-date="minDate"
                    class="mb-4"
                    full-width
                    required
                  />

                  <VaInput
                    v-model="bookingForm.numberOfGuests"
                    label="Nombre d'invités"
                    type="number"
                    min="1"
                    class="mb-4"
                    full-width
                    required
                  />

                  <VaTextarea
                    v-model="bookingForm.specialRequests"
                    label="Demandes spéciales"
                    placeholder="Indiquez toute demande spéciale ici..."
                    class="mb-4"
                    full-width
                  />

                  <div class="price-estimate">
                    <div class="estimate-label">Prix estimé</div>
                    <div class="estimate-value">{{ calculateEstimatedPrice() }}</div>
                    <div class="price-info">* Prix ajusté selon votre abonnement</div>
                  </div>

                  <div class="booking-actions">
                    <VaButton
                      preset="primary"
                      type="submit"
                      :loading="bookingLoading"
                      size="large"
                      class="booking-btn"
                      icon="check_circle"
                    >
                      Réserver maintenant
                    </VaButton>

                    <VaButton
                      preset="secondary"
                      size="large"
                      icon="arrow_back"
                      :to="{ name: 'lounges' }"
                      class="back-btn"
                    >
                      Retour
                    </VaButton>
                  </div>
                </div>
              </form>
            </div>
            <div v-else class="subscription-required">
              <div class="subscription-message">
                <VaIcon name="warning" size="large" color="warning" />
                <p>Un abonnement actif est nécessaire pour réserver ce salon.</p>
              </div>

              <div class="subscription-actions">
                <VaButton
                  preset="primary"
                  size="large"
                  icon="shopping_cart"
                  :to="{ name: 'pricing-plans' }"
                  class="pricing-btn mt-4"
                >
                  Découvrir nos abonnements
                </VaButton>

                <VaButton
                  preset="secondary"
                  size="large"
                  icon="arrow_back"
                  :to="{ name: 'lounges' }"
                  class="back-btn mt-4"
                >
                  Retour
                </VaButton>
              </div>
            </div>

            <div v-if="bookingError" class="mt-4">
              <VaAlert color="danger" closable>{{ bookingError }}</VaAlert>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoungeStore } from '../../stores/lounge'
import { useAuthStore } from '../../stores/auth'
import httpService from '../../services/httpService'
import api from '../../services/api'
import { CreateBookingDto } from '../../types'
// import BookingButton from '../../components/BookingButton.vue'
import { useSubscriptionCheck } from '../../composables/useSubscriptionCheck'

const route = useRoute()
const router = useRouter()
const loungeStore = useLoungeStore()
const authStore = useAuthStore()
const { hasSubscription } = useSubscriptionCheck()

// Déstructurer pour éviter les problèmes de référence
const { loading, error } = loungeStore
const lounge = computed(() => loungeStore.currentLounge)
const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)
const isLoading = ref(true)

// Formulaire de réservation
const bookingForm = ref<Partial<CreateBookingDto>>({
  bookingDate: new Date(),
  numberOfGuests: 1,
  specialRequests: '',
})

// Date minimale (aujourd'hui)
const minDate = new Date()

// Format les amenities en tableau
const formatAmenities = (amenities: string) => {
  if (!amenities) return []
  return amenities.split(',').map((item) => item.trim())
}

// Prix estimé
const calculateEstimatedPrice = () => {
  if (!lounge.value) return '0 €'

  let basePrice = lounge.value.price

  // Appliquer le tarif en fonction du type d'abonnement
  if (authStore.currentUser?.subscriptionType === 'CLASSIC') {
    basePrice = lounge.value.classicDiscountPrice
  } else if (authStore.currentUser?.subscriptionType === 'PREMIUM') {
    basePrice = lounge.value.premiumDiscountPrice
  }

  const totalPrice = basePrice * (bookingForm.value.numberOfGuests || 1)
  return formatPrice(totalPrice)
}

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Soumettre la réservation
const submitBooking = async () => {
  if (!authStore.currentUser?.id) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  bookingLoading.value = true
  bookingError.value = null

  try {
    const bookingData: CreateBookingDto = {
      userId: authStore.currentUser.id,
      loungeId: lounge.value?.id || '',
      bookingDate: bookingForm.value.bookingDate as Date,
      numberOfGuests: Number(bookingForm.value.numberOfGuests) || 1,
      specialRequests: bookingForm.value.specialRequests,
    }

    const response = await httpService.post(api.bookings(), bookingData)

    if (response.error) {
      bookingError.value = response.error.message
    } else {
      // Rediriger vers la page des réservations
      router.push({ name: 'bookings' })
    }
  } catch (err) {
    bookingError.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    bookingLoading.value = false
  }
}

// Charger les données au montage du composant
onMounted(async () => {
  const id = route.params.id as string
  await loungeStore.fetchLoungeById(id)
  isLoading.value = false
})
</script>

<style scoped>
/* Container global */
.lounge-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* Header avec image de couverture */
.lounge-header {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.lounge-cover-image {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.lounge-header-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  color: white;
}

.lounge-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.lounge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.lounge-location,
.lounge-country {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Layout principal à deux colonnes */
.lounge-content-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .lounge-content-container {
    grid-template-columns: 3fr 2fr;
  }
}

/* Cartes */
.info-card,
.pricing-card,
.booking-card {
  border-radius: 12px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.25rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--va-primary);
}

/* Section Description */
.lounge-description {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #444;
  margin-bottom: 2rem;
}

/* Section Amenities */
.amenities-section {
  margin-top: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--va-primary);
  color: var(--va-primary);
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-chip {
  margin-bottom: 0.5rem;
}

/* Grille de prix */
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.pricing-item {
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s;
}

.pricing-item:hover {
  transform: translateY(-3px);
}

.pricing-item.standard {
  background-color: #f9f9f9;
  border: 1px solid #e6e6e6;
}

.pricing-item.classic {
  background-color: #fff8e1;
  border: 1px solid #ffecb3;
}

.pricing-item.premium {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
}

.pricing-header {
  margin-bottom: 0.8rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.pricing-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.8rem;
}

.pricing-description {
  font-size: 0.9rem;
  color: #666;
}

/* Formulaire de réservation */
.booking-form {
  padding: 0.5rem 0;
}

.price-estimate {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 1.5rem 0;
  text-align: center;
}

.estimate-label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.estimate-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.5rem;
}

.price-info {
  font-size: 0.85rem;
  color: #888;
}

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
}

.booking-btn,
.back-btn {
  flex: 1;
  min-width: 140px;
}

/* Message d'abonnement requis */
.subscription-required {
  padding: 1rem 0;
}

.subscription-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #fff8e1;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #ffecb3;
}

.subscription-message p {
  margin: 0;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 991px) {
  .lounge-cover-image {
    height: 300px;
  }

  .lounge-title {
    font-size: 2rem;
  }

  .lounge-meta {
    flex-direction: column;
    gap: 0.8rem;
  }
}

@media (max-width: 767px) {
  .lounge-cover-image {
    height: 250px;
  }

  .lounge-title {
    font-size: 1.6rem;
  }

  .lounge-header-overlay {
    padding: 1.5rem;
  }

  .booking-actions {
    flex-direction: column;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

.subscription-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.pricing-btn {
  background-color: var(--va-warning);
  color: white;
  width: 100%;
}

@media (min-width: 768px) {
  .subscription-actions {
    flex-direction: row;
  }
}
</style>
