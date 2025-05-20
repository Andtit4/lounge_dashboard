import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

export function useSubscriptionCheck() {
  const router = useRouter()
  const authStore = useAuthStore()

  const hasSubscription = computed(() => authStore.hasSubscription)
  const subscriptionType = computed(() => authStore.subscriptionType)

  // Vérifie si l'utilisateur a un abonnement actif
  const checkSubscription = () => {
    if (!authStore.isAuthenticated.value) {
      router.push({ name: 'login' })
      return false
    }

    if (!hasSubscription.value) {
      router.push({ name: 'pricing-plans' })
      return false
    }

    return true
  }

  // Vérifie si l'utilisateur a un abonnement du type spécifié
  const checkSubscriptionType = (requiredType: string) => {
    if (!checkSubscription()) {
      return false
    }

    /* const currentType = subscriptionType.value
    if (currentType === null || currentType !== requiredType) {
      router.push({
        name: 'pricing-plans',
        query: {
          message: `Vous avez besoin d'un abonnement de type "${requiredType}" pour accéder à cette fonctionnalité.`,
        },
      })
      return false
    }
 */
    return true
  }

  // Accéder directement à la page d'abonnement avec un message personnalisé
  const goToSubscriptions = (message?: string) => {
    router.push({
      name: 'pricing-plans',
      query: message ? { message } : undefined,
    })
  }

  return {
    hasSubscription,
    subscriptionType,
    checkSubscription,
    checkSubscriptionType,
    goToSubscriptions,
  }
}
