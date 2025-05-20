import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export function useSubscriptionCheck() {
  const authStore = useAuthStore()
  const router = useRouter()

  const hasSubscription = computed(() => authStore.hasActiveSubscription)
  const subscriptionType = computed(() => authStore.currentUser?.subscriptionType || null)

  const requireSubscription = () => {
    // Si l'utilisateur n'a pas d'abonnement actif, le rediriger vers la page d'abonnement
    if (!authStore.hasActiveSubscription) {
      router.push({
        name: 'pricing-plans',
        query: { message: 'Un abonnement actif est nécessaire pour accéder à cette fonctionnalité.' },
      })
      return false
    }
    return true
  }

  // Vérifie si l'utilisateur a un abonnement du type spécifié
  const checkSubscriptionType = (requiredType: string) => {
    if (!requireSubscription()) {
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
    requireSubscription,
    checkSubscriptionType,
    goToSubscriptions,
  }
}
