<template>
  <div class="lounges-analytics">
    <div v-if="loading" class="analytics-loader">
      <VaLoading size="large" color="primary" />
    </div>
    <div v-else-if="error" class="mb-6">
      <VaAlert color="danger" closable>{{ error }}</VaAlert>
    </div>
    <div v-else class="analytics-container">
      <!-- En-tête -->
      <div class="analytics-header">
        <h1 class="analytics-title">Tableau de bord analytique</h1>
        <p class="analytics-subtitle">Performance et statistiques des salons VIP</p>
      </div>

      <!-- Statistiques principales -->
      <div class="stats-grid">
        <div class="stat-box lounges-box">
          <div class="stat-icon">
            <VaIcon name="meeting_room" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalLounges }}</div>
            <div class="stat-label">Salons</div>
          </div>
        </div>

        <div class="stat-box airports-box">
          <div class="stat-icon">
            <VaIcon name="flight" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ uniqueAirports.length }}</div>
            <div class="stat-label">Aéroports</div>
          </div>
        </div>

        <div class="stat-box countries-box">
          <div class="stat-icon">
            <VaIcon name="public" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ uniqueCountries.length }}</div>
            <div class="stat-label">Pays</div>
          </div>
        </div>

        <div class="stat-box price-box">
          <div class="stat-icon">
            <VaIcon name="euro" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ averagePrice }}€</div>
            <div class="stat-label">Prix moyen</div>
          </div>
        </div>
      </div>

      <!-- Distribution par pays -->
      <div class="analytics-panel country-panel">
        <div class="panel-header">
          <VaIcon name="pie_chart" />
          <h2>Distribution par pays</h2>
        </div>
        <div class="country-list">
          <div v-for="(count, country) in sortedCountryDistribution" :key="country" class="country-item">
            <div class="country-info">
              <span class="country-name">{{ country }}</span>
              <span class="country-count">{{ count }}</span>
            </div>
            <div class="progress-wrapper">
              <div class="progress-bar" :style="`width: ${(count / totalLounges) * 100}%`"></div>
              <span class="progress-label">{{ Math.round((count / totalLounges) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparaison des prix -->
      <div class="analytics-panel price-panel">
        <div class="panel-header">
          <VaIcon name="bar_chart" />
          <h2>Comparaison des prix</h2>
        </div>
        <div class="price-comparison">
          <div class="price-row">
            <div class="price-category">Standard</div>
            <div class="price-range">
              <span class="price-min">{{ minPrice }}€</span>
              <div class="price-track">
                <div
                  class="price-indicator"
                  :style="`left: ${((averagePrice - minPrice) / (maxPrice - minPrice)) * 100}%`"
                ></div>
              </div>
              <span class="price-max">{{ maxPrice }}€</span>
            </div>
            <div class="price-value">{{ averagePrice }}€</div>
          </div>

          <div class="price-row">
            <div class="price-category classic">
              <VaBadge color="warning" text="CLASSIC" />
            </div>
            <div class="price-range">
              <span class="price-min">{{ minClassicPrice }}€</span>
              <div class="price-track">
                <div
                  class="price-indicator"
                  :style="`left: ${
                    ((averageClassicPrice - minClassicPrice) / (maxClassicPrice - minClassicPrice)) * 100
                  }%`"
                ></div>
              </div>
              <span class="price-max">{{ maxClassicPrice }}€</span>
            </div>
            <div class="price-value classic-value">{{ averageClassicPrice }}€</div>
          </div>

          <div class="price-row">
            <div class="price-category premium">
              <VaBadge color="success" text="PREMIUM" />
            </div>
            <div class="price-range">
              <span class="price-min">{{ minPremiumPrice }}€</span>
              <div class="price-track">
                <div
                  class="price-indicator"
                  :style="`left: ${
                    ((averagePremiumPrice - minPremiumPrice) / (maxPremiumPrice - minPremiumPrice)) * 100
                  }%`"
                ></div>
              </div>
              <span class="price-max">{{ maxPremiumPrice }}€</span>
            </div>
            <div class="price-value premium-value">{{ averagePremiumPrice }}€</div>
          </div>
        </div>

        <div class="savings-container">
          <h3 class="savings-title">Économies moyennes</h3>
          <div class="savings-grid">
            <div class="savings-box">
              <div class="savings-label">CLASSIC vs STANDARD</div>
              <div class="savings-data">
                <span class="savings-amount">{{ classicSavings }}€</span>
                <span class="savings-percent">-{{ classicSavingsPercent }}%</span>
              </div>
            </div>
            <div class="savings-box">
              <div class="savings-label">PREMIUM vs STANDARD</div>
              <div class="savings-data">
                <span class="savings-amount">{{ premiumSavings }}€</span>
                <span class="savings-percent">-{{ premiumSavingsPercent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performances -->
      <div class="analytics-panel performance-panel">
        <div class="panel-header">
          <VaIcon name="trending_up" />
          <h2>Performance des salons</h2>
        </div>
        <div class="coming-soon">
          <p>
            Des statistiques détaillées sur les réservations, la fréquentation et la satisfaction client seront bientôt
            disponibles.
          </p>
          <div class="placeholder-graph">
            <div v-for="i in 5" :key="i" class="graph-bar" :style="`height: ${20 + Math.random() * 60}px`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { /* ref, */ computed, onMounted } from 'vue'
import { useLoungeStore } from '../../../stores/lounge'
import type { Lounge } from '../../../types'

const loungeStore = useLoungeStore()
const { loading, error } = loungeStore

// Calculer les statistiques
const totalLounges = computed(() => {
  return loungeStore.lounges.length
})

const uniqueAirports = computed(() => {
  const airports = loungeStore.lounges.map((lounge: Lounge) => lounge.airport)
  return [...new Set(airports)]
})

const uniqueCountries = computed(() => {
  const countries = loungeStore.lounges.map((lounge: Lounge) => lounge.country)
  return [...new Set(countries)]
})

const countryDistribution = computed(() => {
  const distribution: Record<string, number> = {}

  loungeStore.lounges.forEach((lounge: Lounge) => {
    if (distribution[lounge.country]) {
      distribution[lounge.country]++
    } else {
      distribution[lounge.country] = 1
    }
  })

  return distribution
})

// Distribution par pays triée
const sortedCountryDistribution = computed(() => {
  const entries = Object.entries(countryDistribution.value)
  entries.sort((a, b) => b[1] - a[1]) // Trier par nombre de salons décroissant
  return Object.fromEntries(entries)
})

// Statistiques de prix
const averagePrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  const sum = loungeStore.lounges.reduce((acc: number, lounge: Lounge) => acc + lounge.price, 0)
  return Math.round(sum / loungeStore.lounges.length)
})

const minPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.min(...loungeStore.lounges.map((lounge: Lounge) => lounge.price))
})

const maxPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.max(...loungeStore.lounges.map((lounge: Lounge) => lounge.price))
})

const averageClassicPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  const sum = loungeStore.lounges.reduce((acc: number, lounge: Lounge) => acc + lounge.classicDiscountPrice, 0)
  return Math.round(sum / loungeStore.lounges.length)
})

const minClassicPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.min(...loungeStore.lounges.map((lounge: Lounge) => lounge.classicDiscountPrice))
})

const maxClassicPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.max(...loungeStore.lounges.map((lounge: Lounge) => lounge.classicDiscountPrice))
})

const averagePremiumPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  const sum = loungeStore.lounges.reduce((acc: number, lounge: Lounge) => acc + lounge.premiumDiscountPrice, 0)
  return Math.round(sum / loungeStore.lounges.length)
})

const minPremiumPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.min(...loungeStore.lounges.map((lounge: Lounge) => lounge.premiumDiscountPrice))
})

const maxPremiumPrice = computed(() => {
  if (!loungeStore.lounges.length) return 0
  return Math.max(...loungeStore.lounges.map((lounge: Lounge) => lounge.premiumDiscountPrice))
})

// Calcul des économies
const classicSavings = computed(() => {
  return averagePrice.value - averageClassicPrice.value
})

const classicSavingsPercent = computed(() => {
  if (averagePrice.value === 0) return 0
  return Math.round((classicSavings.value / averagePrice.value) * 100)
})

const premiumSavings = computed(() => {
  return averagePrice.value - averagePremiumPrice.value
})

const premiumSavingsPercent = computed(() => {
  if (averagePrice.value === 0) return 0
  return Math.round((premiumSavings.value / averagePrice.value) * 100)
})

// Charger les données au montage du composant
onMounted(async () => {
  await loungeStore.fetchLounges()
})
</script>

<style scoped>
/* Conteneur principal */
.lounges-analytics {
  padding: 2rem;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.analytics-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.analytics-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* En-tête */
.analytics-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.analytics-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.analytics-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* Statistiques principales */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.stat-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.lounges-box {
  border-top: 4px solid #4a6cf7;
}

.airports-box {
  border-top: 4px solid #f7934a;
}

.countries-box {
  border-top: 4px solid #4af762;
}

.price-box {
  border-top: 4px solid #f74a8a;
}

.stat-icon {
  background-color: #f5f7fa;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.lounges-box .stat-icon {
  color: #4a6cf7;
}

.airports-box .stat-icon {
  color: #f7934a;
}

.countries-box .stat-icon {
  color: #4af762;
}

.price-box .stat-icon {
  color: #f74a8a;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.2rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Panneaux d'analyse */
.analytics-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2.5rem;
  overflow: hidden;
}

.panel-header {
  background-color: #f8f9fa;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
}

.panel-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  margin-left: 0.8rem;
}

.panel-header va-icon {
  color: #4a6cf7;
}

/* Distribution par pays */
.country-list {
  padding: 1.5rem;
  max-height: 350px;
  overflow-y: auto;
}

.country-item {
  margin-bottom: 1.2rem;
}

.country-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.country-name {
  font-weight: 500;
  color: #2c3e50;
}

.country-count {
  font-weight: 600;
  color: #4a6cf7;
}

.progress-wrapper {
  position: relative;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4a6cf7;
  border-radius: 4px;
}

.progress-label {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.75rem;
  color: #7f8c8d;
}

/* Comparaison des prix */
.price-comparison {
  padding: 1.5rem 1.5rem 0;
}

.price-row {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.price-category {
  width: 100px;
  font-weight: 500;
  color: #2c3e50;
}

.price-range {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 1.5rem;
}

.price-track {
  flex: 1;
  height: 4px;
  background-color: #e9ecef;
  margin: 0 10px;
  border-radius: 2px;
  position: relative;
}

.price-indicator {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #4a6cf7;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.classic .price-indicator {
  background-color: #f7934a;
}

.premium .price-indicator {
  background-color: #4af762;
}

.price-min,
.price-max {
  font-size: 0.85rem;
  color: #7f8c8d;
  white-space: nowrap;
}

.price-value {
  width: 80px;
  text-align: right;
  font-weight: 700;
  font-size: 1.2rem;
  color: #2c3e50;
}

.classic-value {
  color: #f7934a;
}

.premium-value {
  color: #4af762;
}

/* Économies */
.savings-container {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.savings-title {
  font-size: 1.1rem;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.savings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.savings-box {
  background-color: white;
  border-radius: 8px;
  padding: 1.2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.savings-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.savings-data {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
}

.savings-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4a6cf7;
}

.savings-percent {
  font-size: 1rem;
  font-weight: 600;
  color: #4af762;
}

/* Performance */
.performance-panel {
  margin-bottom: 1rem;
}

.coming-soon {
  padding: 2rem;
  text-align: center;
}

.coming-soon p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.placeholder-graph {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 150px;
  gap: 1.5rem;
}

.graph-bar {
  width: 40px;
  background: linear-gradient(to top, #4a6cf7, #6a8afa);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.graph-bar:hover {
  height: 120px !important;
}

/* Media queries */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lounges-analytics {
    padding: 1rem;
  }

  .analytics-title {
    font-size: 1.8rem;
  }

  .price-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .price-category {
    margin-bottom: 0.5rem;
  }

  .price-range {
    width: 100%;
    margin: 0.5rem 0;
  }

  .price-value {
    align-self: flex-end;
    margin-top: 0.5rem;
  }

  .savings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-box {
    padding: 1rem;
  }

  .placeholder-graph {
    gap: 0.8rem;
  }

  .graph-bar {
    width: 30px;
  }
}
</style>
