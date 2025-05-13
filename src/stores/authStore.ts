import { ref, readonly, computed } from 'vue'
import { AuthService, type ILoginRequest, type IAuthState } from '../services/api/authService'

// État global
const authState = ref<IAuthState>(AuthService.getCurrentAuth())
const isLoading = ref(false)
const error = ref<Error | null>(null)

// Computed properties
const isAuthenticated = computed(() => authState.value.isAuthenticated)
const user = computed(() => authState.value.user)
const isAdmin = computed(() => authState.value.user?.isAdmin === true)
const hasSubscription = computed(() => {
  const user = authState.value.user
  if (!user || !user.subscriptionType || !user.subscriptionExpiryDate) {
    return false
  }
  return new Date(user.subscriptionExpiryDate) > new Date()
})
const subscriptionType = computed(() => authState.value.user?.subscriptionType || null)

// Actions
const login = async (credentials: ILoginRequest) => {
  isLoading.value = true
  error.value = null

  try {
    authState.value = await AuthService.login(credentials)
    return authState.value
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Échec de la connexion')
    throw error.value
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  AuthService.logout()
  authState.value = {
    user: null,
    token: null,
    isAuthenticated: false,
  }
}

// Rafraîchir les données d'authentification (utile si les données utilisateur changent)
const refreshAuth = () => {
  authState.value = AuthService.getCurrentAuth()
}

// Exporter l'API du store
export const useAuthStore = () => {
  return {
    // État en lecture seule
    authState: readonly(authState),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed properties
    isAuthenticated,
    user,
    isAdmin,
    hasSubscription,
    subscriptionType,

    // Actions
    login,
    logout,
    refreshAuth,
  }
}
