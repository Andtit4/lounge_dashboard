import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useAppInit() {
  const authStore = useAuthStore()
  const isInitialized = ref(false)
  const isInitializing = ref(true)
  const error = ref<Error | null>(null)

  const initialize = async () => {
    isInitializing.value = true
    error.value = null

    try {
      // Vérifier l'état d'authentification actuel
      authStore.refreshAuth()

      // Vérifier si le token a expiré
      if (authStore.token) {
        // Vous pourriez ajouter ici une logique pour vérifier la validité du token
        // ou récupérer des informations utilisateur mises à jour depuis le serveur
      }

      isInitialized.value = true
    } catch (err) {
      console.error("Erreur lors de l'initialisation de l'application:", err)
      error.value = err instanceof Error ? err : new Error("Erreur d'initialisation inconnue")

      // En cas d'erreur d'authentification, déconnecter l'utilisateur
      if (err instanceof Error && err.message.includes('auth')) {
        authStore.logout()
      }
    } finally {
      isInitializing.value = false
    }
  }

  onMounted(() => {
    initialize()
  })

  return {
    isInitialized,
    isInitializing,
    error,
    initialize,
  }
}
