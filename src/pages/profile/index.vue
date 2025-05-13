<template>
  <div class="profile-page">
    <VaCard class="profile-card mb-6">
      <VaCardTitle>
        <h1 class="profile-title">Mon Profil</h1>
      </VaCardTitle>
      <VaCardContent>
        <div v-if="loading" class="loading-container">
          <VaLoading color="primary" size="large" />
        </div>
        <VaAlert v-else-if="error" color="danger" class="mb-6" closable>
          {{ error }}
        </VaAlert>

        <div v-else-if="currentUser" class="profile-content">
          <!-- Informations personnelles -->
          <div class="profile-section">
            <h2 class="section-title">
              <VaIcon name="person" />
              Informations personnelles
            </h2>
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Prénom:</span>
                <span class="field-value">{{ currentUser.firstName }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Nom:</span>
                <span class="field-value">{{ currentUser.lastName }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Email:</span>
                <span class="field-value">{{ currentUser.email }}</span>
              </div>
              <div v-if="currentUser.phoneNumber" class="profile-field">
                <span class="field-label">Téléphone:</span>
                <span class="field-value">{{ currentUser.phoneNumber }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Membre depuis:</span>
                <span class="field-value">{{ formatDate(currentUser.createdAt) }}</span>
              </div>
            </div>
            <VaButton class="mt-4" preset="secondary" @click="openEditProfileModal">
              Modifier mes informations
            </VaButton>
          </div>

          <!-- Informations d'abonnement -->
          <div class="profile-section">
            <h2 class="section-title">
              <VaIcon name="card_membership" />
              Mon abonnement
            </h2>

            <div v-if="hasActiveSubscription" class="subscription-info">
              <div class="current-plan">
                <VaBadge
                  :color="getSubscriptionColor(currentUser.subscriptionType)"
                  :text="String(currentUser.subscriptionType || '')"
                />
                <p class="mt-2">
                  Votre abonnement est actif jusqu'au {{ formatDate(currentUser.subscriptionExpiryDate) }}
                </p>
              </div>

              <div class="subscription-features">
                <h3>Avantages de votre abonnement:</h3>
                <ul class="features-list">
                  <li v-if="currentUser.subscriptionType === 'CLASSIC'">
                    <VaIcon name="check_circle" color="success" />
                    Accès à tous les salons standard
                  </li>
                  <li v-if="currentUser.subscriptionType === 'CLASSIC'">
                    <VaIcon name="check_circle" color="success" />
                    1 invité par réservation
                  </li>
                  <li v-if="currentUser.subscriptionType === 'PREMIUM'">
                    <VaIcon name="check_circle" color="success" />
                    Accès à tous les salons VIP
                  </li>
                  <li v-if="currentUser.subscriptionType === 'PREMIUM'">
                    <VaIcon name="check_circle" color="success" />
                    Jusqu'à 3 invités par réservation
                  </li>
                  <li v-if="currentUser.subscriptionType === 'PREMIUM'">
                    <VaIcon name="check_circle" color="success" />
                    Priorité de réservation
                  </li>
                </ul>
              </div>
            </div>

            <div v-else class="no-subscription">
              <p>Vous n'avez pas d'abonnement actif.</p>
              <p class="mt-2">Souscrivez à un abonnement pour profiter de nos services premium!</p>
            </div>

            <VaButton class="mt-4" preset="primary" @click="goToPricingPlans">
              {{ hasActiveSubscription ? 'Changer mon abonnement' : 'Souscrire à un abonnement' }}
            </VaButton>
          </div>

          <!-- Sécurité du compte -->
          <div class="profile-section">
            <h2 class="section-title">
              <VaIcon name="security" />
              Sécurité du compte
            </h2>
            <div class="security-options">
              <VaButton preset="secondary" @click="openChangePasswordModal"> Changer mon mot de passe </VaButton>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modales (à implémenter) -->
    <VaModal v-model="showEditProfileModal" title="Modifier mon profil" hide-default-actions>
      <!-- Formulaire de modification à compléter -->
      <p>Fonctionnalité à venir...</p>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="showEditProfileModal = false"> Fermer </VaButton>
      </div>
    </VaModal>

    <VaModal v-model="showChangePasswordModal" title="Changer mon mot de passe" hide-default-actions>
      <!-- Formulaire de changement de mot de passe à compléter -->
      <p>Fonctionnalité à venir...</p>
      <div class="modal-actions">
        <VaButton preset="secondary" @click="showChangePasswordModal = false"> Fermer </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// États locaux
const loading = ref(false)
const error = ref<string | null>(null)
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)

// Computed properties
const currentUser = computed(() => authStore.currentUser)
const hasActiveSubscription = computed(() => authStore.hasActiveSubscription)

// Méthodes
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

const getSubscriptionColor = (type: string | null | undefined) => {
  if (!type) return 'gray'
  switch (type) {
    case 'CLASSIC':
      return 'success'
    case 'PREMIUM':
      return 'primary'
    default:
      return 'info'
  }
}

const openEditProfileModal = () => {
  showEditProfileModal.value = true
}

const openChangePasswordModal = () => {
  showChangePasswordModal.value = true
}

const goToPricingPlans = () => {
  router.push({ name: 'pricing-plans' })
}

onMounted(() => {
  // Rien à faire pour l'instant car les données utilisateur sont déjà dans le store
  // Si besoin de rafraîchir les données, ajouter ici
})
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-primary);
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
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

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  color: #666;
  font-size: 0.9rem;
}

.field-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-plan {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.no-subscription {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--va-warning);
}

.security-options {
  display: flex;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
