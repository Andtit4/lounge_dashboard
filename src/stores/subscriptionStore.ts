import { ref, readonly, computed } from 'vue'
import {
  SubscriptionService,
  type ISubscription,
  // type ICreateSubscriptionDto,
} from '../services/api/subscriptionService'
import { useAuthStore } from './authStore'

// État global
const subscriptions = ref<ISubscription[]>([])
const currentSubscription = ref<ISubscription | null>(null)
const isLoading = ref(false)
const error = ref<Error | null>(null)

// Référence au store d'authentification
const authStore = useAuthStore()

// Actions
const fetchUserSubscriptions = async () => {
  if (!authStore.user.value?.id) {
    console.error('Impossible de récupérer les abonnements: utilisateur non connecté')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const userId = authStore.user.value.id
    const fetchedSubscriptions = await SubscriptionService.getUserSubscriptions(userId)
    subscriptions.value = fetchedSubscriptions

    // Récupérer l'abonnement actif (s'il y en a un)
    const active = fetchedSubscriptions.find((sub) => sub.isActive)
    if (active) {
      currentSubscription.value = active
    } else {
      currentSubscription.value = null
    }
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Erreur lors de la récupération des abonnements')
    console.error('Error fetching subscriptions:', err)
  } finally {
    isLoading.value = false
  }
}

const subscribe = async (planType: string, durationMonths: number) => {
  if (!authStore.user.value?.id) {
    throw new Error('Utilisateur non connecté')
  }

  isLoading.value = true
  error.value = null

  try {
    const userId = authStore.user.value.id
    const newSubscription = await SubscriptionService.subscribe(userId, planType, durationMonths)

    // Mettre à jour la liste des abonnements
    await fetchUserSubscriptions()

    // Rafraîchir les données d'authentification pour refléter le nouvel abonnement
    authStore.refreshAuth()

    return newSubscription
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Erreur lors de la souscription')
    console.error('Error subscribing:', err)
    throw error.value
  } finally {
    isLoading.value = false
  }
}

const cancelSubscription = async (subscriptionId: string) => {
  isLoading.value = true
  error.value = null

  try {
    await SubscriptionService.cancelSubscription(subscriptionId)

    // Mettre à jour la liste des abonnements
    await fetchUserSubscriptions()

    // Rafraîchir les données d'authentification
    authStore.refreshAuth()
  } catch (err) {
    error.value = err instanceof Error ? err : new Error("Erreur lors de l'annulation de l'abonnement")
    console.error('Error cancelling subscription:', err)
    throw error.value
  } finally {
    isLoading.value = false
  }
}

// Vérifier le statut d'abonnement
const checkSubscriptionStatus = async () => {
  if (!authStore.user.value?.id) {
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      subscriptionExpiry: null,
    }
  }

  isLoading.value = true
  error.value = null

  try {
    const userId = authStore.user.value.id
    const status = await SubscriptionService.checkSubscriptionStatus(userId)
    return status
  } catch (err) {
    error.value = err instanceof Error ? err : new Error("Erreur lors de la vérification du statut d'abonnement")
    console.error('Error checking subscription status:', err)
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      subscriptionExpiry: null,
    }
  } finally {
    isLoading.value = false
  }
}

// Computed properties
const hasActiveSubscription = computed(() => {
  return currentSubscription.value !== null && currentSubscription.value.isActive
})

const subscriptionType = computed(() => {
  return currentSubscription.value?.type || null
})

const subscriptionEndDate = computed(() => {
  return currentSubscription.value?.endDate || null
})

// Exporter l'API du store
export const useSubscriptionStore = () => {
  return {
    // État en lecture seule
    subscriptions: readonly(subscriptions),
    currentSubscription: readonly(currentSubscription),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed properties
    hasActiveSubscription,
    subscriptionType,
    subscriptionEndDate,

    // Actions
    fetchUserSubscriptions,
    subscribe,
    cancelSubscription,
    checkSubscriptionStatus,
  }
}
