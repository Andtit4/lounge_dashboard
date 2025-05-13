<template>
  <!-- En-tête avec bannière et présentation -->
  <div class="lounges-header mb-6">
    <div class="lounges-header-content">
      <h1 class="lounges-title">Salons VIP & Lounges</h1>
      <p class="lounges-subtitle">Découvrez notre sélection de salons exclusifs dans les aéroports africains</p>
    </div>
  </div>

  <!-- Filtres et barre de recherche -->
  <VaCard class="filter-card mb-6">
    <VaCardContent>
      <div class="filter-container">
        <div class="search-container">
          <VaInput
            v-model="searchQuery"
            placeholder="Rechercher par nom, aéroport ou pays"
            class="search-input"
            clearable
            @keyup.enter="search"
          >
            <template #append>
              <VaIcon name="search" class="search-icon" @click="search" />
            </template>
          </VaInput>
        </div>

        <div class="advanced-filters">
          <div class="filter-select">
            <VaSelect
              v-model="selectedAirport"
              :options="uniqueAirports"
              placeholder="Filtrer par aéroport"
              clearable
              @update:modelValue="filterByAirport"
            />
          </div>
          <div class="filter-select">
            <VaSelect
              v-model="selectedCountry"
              :options="uniqueCountries"
              placeholder="Filtrer par pays"
              clearable
              @update:modelValue="filterByCountry"
            />
          </div>
          <div class="reset-button">
            <VaButton preset="secondary" icon="refresh" class="reset-filter-btn" @click="resetFilters">
              Réinitialiser
            </VaButton>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>

  <!-- États de chargement et erreurs -->
  <div v-if="loungeStore.loading" class="loading-container">
    <VaLoading color="primary" size="large" />
  </div>
  <VaAlert v-else-if="loungeStore.error" color="danger" class="mb-6" closable>
    {{ loungeStore.error }}
  </VaAlert>
  <VaAlert v-else-if="!loungeStore.lounges.length" color="info" class="mb-6">
    Aucun salon ne correspond à votre recherche
  </VaAlert>

  <!-- Grille de salons -->
  <div v-else class="lounges-grid">
    <div v-for="lounge in loungeStore.lounges" :key="lounge.id" class="lounge-item">
      <VaCard class="lounge-card">
        <div class="lounge-image-container" @click="navigateToDetails(lounge.id)">
          <img
            :src="lounge.imageUrl || 'https://via.placeholder.com/500x300?text=Lounge'"
            :alt="lounge.name"
            class="lounge-image"
          />
          <div class="lounge-country-badge">
            {{ lounge.country }}
          </div>
        </div>

        <VaCardContent class="lounge-content" @click="navigateToDetails(lounge.id)">
          <h3 class="lounge-name">{{ lounge.name }}</h3>

          <div class="lounge-location">
            <VaIcon name="location_on" size="small" />
            <span>{{ lounge.airport }}</span>
          </div>

          <p class="lounge-description">{{ lounge.description }}</p>

          <div class="price-container">
            <div class="price-row">
              <div class="price-type">Standard</div>
              <div class="price-value standard">{{ formatPrice(lounge.price) }}</div>
            </div>
            <div class="price-row">
              <div class="price-type">
                <VaBadge color="warning" text="CLASSIC" />
              </div>
              <div class="price-value classic">{{ formatPrice(lounge.classicDiscountPrice) }}</div>
            </div>
            <div class="price-row">
              <div class="price-type">
                <VaBadge color="success" text="PREMIUM" />
              </div>
              <div class="price-value premium">{{ formatPrice(lounge.premiumDiscountPrice) }}</div>
            </div>
          </div>
        </VaCardContent>

        <VaCardActions class="lounge-actions">
          <VaButton preset="secondary" class="details-btn" @click="navigateToDetails(lounge.id)">
            <VaIcon name="visibility" />
            Détails
          </VaButton>
          <VaButton preset="primary" class="booking-btn" @click="navigateToBooking(lounge.id)">
            <VaIcon name="event_available" />
            Réserver
          </VaButton>
        </VaCardActions>
      </VaCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoungeStore } from '../../stores/lounge'
import { useAuthStore } from '../../stores/auth'
import type { Lounge } from '../../types'

const router = useRouter()
const loungeStore = useLoungeStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedAirport = ref('')
const selectedCountry = ref('')

// Navigation vers la page détails
const navigateToDetails = (loungeId: string) => {
  router.push({ name: 'lounges-detail', params: { id: loungeId } })
}

// Navigation vers la page de réservation
const navigateToBooking = (loungeId: string) => {
  // Vérifier si l'utilisateur a un abonnement actif
  if (authStore.hasActiveSubscription) {
    router.push({ name: 'bookings-create', query: { loungeId } })
  } else {
    router.push({ name: 'pricing-plans' })
  }
}

// Obtenir la liste des aéroports uniques pour le filtre
const uniqueAirports = computed(() => {
  const loungesArray = loungeStore.lounges
  if (!loungesArray || !loungesArray.length) return []
  const airports = loungesArray.map((lounge: Lounge) => lounge.airport)
  return [...new Set(airports)]
})

// Obtenir la liste des pays uniques pour le filtre
const uniqueCountries = computed(() => {
  const loungesArray = loungeStore.lounges
  if (!loungesArray || !loungesArray.length) return []
  const countries = loungesArray.map((lounge: Lounge) => lounge.country)
  return [...new Set(countries)]
})

// Actions
const search = async () => {
  if (searchQuery.value) {
    await loungeStore.searchLounges(searchQuery.value)
  } else {
    await loungeStore.fetchLounges()
  }
}

const filterByAirport = async () => {
  if (selectedAirport.value) {
    await loungeStore.fetchLoungesByAirport(selectedAirport.value)
    selectedCountry.value = ''
  }
}

const filterByCountry = async () => {
  if (selectedCountry.value) {
    await loungeStore.fetchLoungesByCountry(selectedCountry.value)
    selectedAirport.value = ''
  }
}

const resetFilters = async () => {
  searchQuery.value = ''
  selectedAirport.value = ''
  selectedCountry.value = ''
  await loungeStore.fetchLounges()
}

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Charger les données au montage du composant
onMounted(async () => {
  await loungeStore.fetchLounges()
})
</script>

<style scoped>
/* En-tête avec bannière */
.lounges-header {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('https://images.unsplash.com/photo-1583653419130-d6bbfa96dc91?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  border-radius: 12px;
  padding: 3.5rem 2rem;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.lounges-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.lounges-subtitle {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
}

/* Filtres */
.filter-card {
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
}

.search-icon {
  cursor: pointer;
}

.advanced-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-select {
  flex: 1;
  min-width: 200px;
}

.reset-button {
  display: flex;
  align-items: flex-end;
}

.reset-filter-btn {
  height: 36px;
}

/* Grille de salons */
.lounges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.lounge-item {
  height: 100%;
}

.lounge-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.lounge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.lounge-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.lounge-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.lounge-card:hover .lounge-image {
  transform: scale(1.05);
}

.lounge-country-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.lounge-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
}

.lounge-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--va-primary);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.lounge-location {
  display: flex;
  align-items: center;
  color: #666;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.lounge-location i {
  margin-right: 0.35rem;
  font-size: 1rem;
}

.lounge-description {
  flex: 1;
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

/* Conteneur de prix */
.price-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 0.8rem;
  margin-top: auto;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
}

.price-row:not(:last-child) {
  border-bottom: 1px dashed #e0e0e0;
}

.price-type {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.price-value {
  font-weight: 700;
  font-size: 1rem;
}

.price-value.standard {
  color: #555;
}

.price-value.classic {
  color: var(--va-warning);
}

.price-value.premium {
  color: var(--va-success);
}

/* Actions */
.lounge-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.details-btn,
.booking-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* Responsive */
@media (min-width: 768px) {
  .filter-container {
    flex-direction: row;
  }

  .search-container {
    max-width: 40%;
  }

  .advanced-filters {
    flex: 1;
    justify-content: flex-end;
  }
}

@media (max-width: 767px) {
  .lounges-header {
    padding: 2.5rem 1.5rem;
  }

  .lounges-title {
    font-size: 2rem;
  }

  .lounges-subtitle {
    font-size: 1rem;
  }

  .filter-select,
  .reset-button {
    width: 100%;
  }

  .lounges-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
}
</style>
