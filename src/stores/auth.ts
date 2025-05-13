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
    } else {
      currentUser.value = userData
    }

    if (userData.token) {
      token.value = userData.token
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
        } else {
          currentUser.value = response.data
        }

        if (response.data.token) {
          token.value = response.data.token
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
  }
})
