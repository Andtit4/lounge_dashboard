import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import api from '../services/api'
import httpService from '../services/httpService'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)

  // À l'initialisation, récupérer l'utilisateur du localStorage ou sessionStorage
  function init() {
    // Récupérer le token
    const tokenFromStorage = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (tokenFromStorage) {
      token.value = tokenFromStorage
    }

    // Récupérer les données utilisateur
    const userFromStorage = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userFromStorage) {
      try {
        currentUser.value = JSON.parse(userFromStorage)
      } catch (e) {
        // Si le JSON est invalide, supprimer le token et l'utilisateur
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        token.value = null
      }
    }
  }

  // Définir l'utilisateur courant et le token
  function setUser(userData: any) {
    if (userData.user) {
      currentUser.value = userData.user
      // Stockage de l'utilisateur
      localStorage.setItem('user', JSON.stringify(userData.user))
      sessionStorage.setItem('user', JSON.stringify(userData.user))
    } else {
      currentUser.value = userData
      // Stockage de l'utilisateur
      localStorage.setItem('user', JSON.stringify(userData))
      sessionStorage.setItem('user', JSON.stringify(userData))
    }

    if (userData.token) {
      token.value = userData.token
      // Stockage du token
      localStorage.setItem('token', userData.token)
      sessionStorage.setItem('token', userData.token)
      console.log('Token stocké:', userData.token.substring(0, 10) + '...')
    }
  }

  // Se connecter
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.post<any>(api.login(), { email, password })

      if (response.data) {
        // Gérer à la fois le format { user, token } et le format utilisateur direct
        if (response.data.user) {
          currentUser.value = response.data.user
          localStorage.setItem('user', JSON.stringify(response.data.user))
          sessionStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          currentUser.value = response.data
          localStorage.setItem('user', JSON.stringify(response.data))
          sessionStorage.setItem('user', JSON.stringify(response.data))
        }

        if (response.data.token) {
          token.value = response.data.token
          localStorage.setItem('token', response.data.token)
          sessionStorage.setItem('token', response.data.token)
          console.log('Token stocké après login:', response.data.token.substring(0, 10) + '...')
        } else if (response.data.accessToken) {
          // Certaines API retournent accessToken au lieu de token
          token.value = response.data.accessToken
          localStorage.setItem('token', response.data.accessToken)
          sessionStorage.setItem('token', response.data.accessToken)
          console.log('AccessToken stocké après login:', response.data.accessToken.substring(0, 10) + '...')
        }

        return true
      } else if (response.error) {
        error.value = response.error.message
      }
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return false
    } finally {
      loading.value = false
    }
  }

  // S'inscrire
  async function register(userData: Omit<User, 'id' | 'isAdmin' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.post<User>(api.allUsers(), userData)

      if (response.data) {
        return true
      } else if (response.error) {
        error.value = response.error.message
      }
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return false
    } finally {
      loading.value = false
    }
  }

  // Se déconnecter
  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  // Vérifier si l'utilisateur a un rôle admin
  const isAdmin = computed(() => currentUser.value?.isAdmin || false)

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = computed(() => {
    if (!currentUser.value) return false

    // Si l'utilisateur a un type d'abonnement défini et une date d'expiration dans le futur
    if (currentUser.value.subscriptionType && currentUser.value.subscriptionExpiryDate) {
      const expiryDate = new Date(currentUser.value.subscriptionExpiryDate)
      return expiryDate > new Date()
    }

    return false
  })

  // Rafraîchir l'état d'authentification depuis le localStorage/sessionStorage
  function refreshAuth() {
    console.log("[AUTH] Rafraîchissement de l'authentification")
    // Nettoyage des états actuels
    token.value = null
    currentUser.value = null

    // Récupérer le token
    const tokenFromStorage = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (tokenFromStorage) {
      token.value = tokenFromStorage
      console.log('[AUTH] Token récupéré:', tokenFromStorage.substring(0, 15) + '...')
    }

    // Récupérer les données utilisateur
    const userFromStorage = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage)
        currentUser.value = userData
        console.log('[AUTH] Utilisateur récupéré:', userData)

        // Vérifier si l'utilisateur a le rôle admin
        const isAdminUser = userData.isAdmin === true || userData.role === 'admin'
        console.log("[AUTH] L'utilisateur est admin:", isAdminUser)

        // Si l'utilisateur n'est pas un admin mais que c'est requis, afficher un avertissement
        if (!isAdminUser) {
          console.warn("[AUTH] L'utilisateur n'a pas les droits administrateur nécessaires pour certaines opérations")
        }
      } catch (e) {
        console.error('[AUTH] Erreur lors de la récupération des données utilisateur:', e)

        // Si le JSON est invalide, supprimer le token et l'utilisateur
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        token.value = null
      }
    }

    return isAuthenticated.value
  }

  // Initialiser l'état à la création du store
  init()

  return {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    setUser,
    login,
    register,
    logout,
    init,
    refreshAuth,
  }
})
