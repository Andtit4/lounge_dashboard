<template>
  <div class="profile-page">
    <h1 class="page-title">Profil et Préférences</h1>
    <VaCard class="profile-card mb-6">
      <VaCardTitle>
        <div class="profile-header">
          <VaAvatar size="large" color="warning"><span class="text-4xl"> 😍 </span></VaAvatar>
          <div class="flex flex-col">
            <h2 class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h2>
            <div class="member-since">
              <span>Membre depuis {{ formatDate(currentUser?.createdAt) }}</span>
            </div>
          </div>
        </div>
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
              <div v-if="isAdmin" class="profile-field">
                <span class="field-label">Rôle:</span>
                <span class="field-value">
                  <VaBadge color="primary" text="Administrateur" />
                </span>
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

          <!-- Préférences de notification -->
          <div class="profile-section">
            <h2 class="section-title">
              <VaIcon name="notifications" />
              Préférences de notifications
            </h2>
            <div class="notification-options">
              <div class="toggle-option">
                <span>Notifications par email</span>
                <VaSwitch v-model="emailNotifications" />
              </div>
              <div class="toggle-option">
                <span>Notifications dans l'application</span>
                <VaSwitch v-model="appNotifications" />
              </div>
              <div class="toggle-option">
                <span>Notifications de réservation</span>
                <VaSwitch v-model="bookingNotifications" />
              </div>
            </div>
            <VaButton class="mt-4" preset="secondary" @click="saveNotificationPreferences">
              Enregistrer les préférences
            </VaButton>
          </div>

          <!-- Préférences d'affichage -->
          <div class="profile-section">
            <h2 class="section-title">
              <VaIcon name="palette" />
              Préférences d'affichage
            </h2>
            <div class="display-options">
              <div class="option-group">
                <h3>Thème</h3>
                <div class="theme-selector">
                  <VaRadio v-model="theme" label="Clair" value="light" />
                  <VaRadio v-model="theme" label="Sombre" value="dark" />
                </div>
              </div>
              <div class="option-group">
                <h3>Langue</h3>
                <VaSelect
                  v-model="language"
                  :options="languageOptions"
                  text-by="text"
                  value-by="value"
                  track-by="value"
                  placeholder="Sélectionner la langue"
                />
              </div>
            </div>
            <VaButton class="mt-4" preset="secondary" @click="saveDisplayPreferences">
              Enregistrer les préférences
            </VaButton>
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modales -->
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
import { useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

const router = useRouter()
const authStore = useAuthStore()
const { init } = useToast()
const { locale } = useI18n()
const { applyPreset /* currentPresetName */ } = useColors()

// États locaux
const loading = ref(false)
const error = ref<string | null>(null)
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)

// Options de préférences
const emailNotifications = ref(true)
const appNotifications = ref(true)
const bookingNotifications = ref(true)
const theme = ref('light')
const language = ref(locale.value)
const languageOptions = [
  { text: 'Français', value: 'fr' },
  { text: 'English', value: 'gb' },
]

// Après la déclaration des languageOptions, ajouter un mappage de locale
const localeMap: Record<string, string> = {
  fr: 'fr',
  gb: 'gb',
}

// Computed properties
const currentUser = computed(() => authStore.currentUser)
const hasActiveSubscription = computed(() => authStore.hasActiveSubscription)
const isAdmin = computed(() => authStore.isAdmin)

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

const saveNotificationPreferences = () => {
  // Simulation de sauvegarde
  init({ message: 'Préférences de notification enregistrées', color: 'success' })
}

// Fonction pour appliquer le thème et le sauvegarder
const applyTheme = (selectedTheme: string) => {
  // Appliquer directement le thème clair ou sombre
  applyPreset(selectedTheme)

  // Sauvegarder la préférence dans le localStorage
  localStorage.setItem('userTheme', selectedTheme)
}

const saveDisplayPreferences = () => {
  try {
    // Gérer le cas où language.value est un objet ou une chaîne
    const localeValue =
      typeof language.value === 'object' && language.value !== null ? (language.value as any).value : language.value

    // S'assurer que la locale est valide
    if (typeof localeValue === 'string' && localeValue in localeMap) {
      const validLocale = localeMap[localeValue]

      // Changer la langue de l'application
      locale.value = validLocale
      console.log('Nouvelle locale définie dans Preferences:', locale.value)

      // Sauvegarder la préférence dans le localStorage
      localStorage.setItem('userLanguage', validLocale)
      console.log('Langue sauvegardée dans localStorage:', validLocale)

      // Appliquer et sauvegarder le thème
      applyTheme(theme.value)
      console.log('Thème appliqué et sauvegardé:', theme.value)

      // Notification de succès
      init({ message: "Préférences d'affichage enregistrées", color: 'success' })

      // Application immédiate de la langue dans le DOM
      document.documentElement.setAttribute('lang', validLocale)

      // Rediriger vers la page d'accueil pour assurer le rechargement complet
      setTimeout(() => {
        router.push({ path: '/' }).then(() => {
          // Forcer un rechargement complet de l'application après la navigation
          window.location.reload()
        })
      }, 500)
    } else {
      console.error('Locale invalide:', language.value)
      init({ message: "Erreur lors de l'enregistrement des préférences", color: 'danger' })
    }
  } catch (error) {
    console.error('Erreur lors du changement de langue:', error)
    init({ message: 'Erreur lors du changement de langue', color: 'danger' })
  }
}

onMounted(() => {
  // Récupérer la langue sauvegardée si elle existe
  const savedLanguage = localStorage.getItem('userLanguage')
  console.log('Langue récupérée du localStorage dans le composant:', savedLanguage)

  if (savedLanguage) {
    // Trouver l'option de langue correspondante
    const option = languageOptions.find((opt) => opt.value === savedLanguage)
    if (option) {
      console.log('Option de langue trouvée:', option)
      language.value = option.value
    } else {
      console.log('Option de langue non trouvée, utilisation de la valeur brute:', savedLanguage)
      language.value = savedLanguage
    }

    locale.value = savedLanguage
    console.log('Locale définie après montage:', locale.value)
  }

  // Récupérer et appliquer le thème sauvegardé
  const savedTheme = localStorage.getItem('userTheme')
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.value = savedTheme
    applyTheme(savedTheme)
    console.log('Thème récupéré et appliqué:', savedTheme)
  } else {
    // Par défaut, utiliser le thème clair
    theme.value = 'light'
    applyTheme('light')
  }
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

.profile-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.member-since {
  font-size: 0.9rem;
  color: #666;
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

.security-options,
.notification-options,
.display-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.option-group {
  margin-bottom: 1rem;
}

.option-group h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.theme-selector {
  display: flex;
  gap: 1.5rem;
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

  .theme-selector {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
