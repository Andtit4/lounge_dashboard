import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import httpService from '../services/httpService'
import type { Lounge, CreateLoungeDto, UpdateLoungeDto } from '../types'

export const useLoungeStore = defineStore('lounge', () => {
  const lounges = ref<Lounge[]>([])
  const currentLounge = ref<Lounge | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getLoungesByAirport = computed(() => {
    return (airport: string) => lounges.value.filter((lounge) => lounge.airport === airport)
  })

  const getLoungesByCountry = computed(() => {
    return (country: string) => lounges.value.filter((lounge) => lounge.country === country)
  })

  // Actions
  const fetchLounges = async (forceRefresh = true) => {
    loading.value = true
    error.value = null

    try {
      console.log('[LOUNGE-STORE] Récupération de la liste des salons', forceRefresh ? '(forcée)' : '')

      // Configuration pour forcer une requête fraîche et contourner le cache si nécessaire
      const config = forceRefresh
        ? {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }
        : undefined

      const response = await httpService.get<Lounge[]>(api.lounges(), config)

      if (response.data) {
        console.log('[LOUNGE-STORE] Salons récupérés avec succès:', response.data.length)
        lounges.value = response.data
      } else if (response.error) {
        console.error('[LOUNGE-STORE] Erreur lors de la récupération des salons:', response.error.message)
        error.value = response.error.message
        lounges.value = []
      }
    } catch (err) {
      console.error('[LOUNGE-STORE] Exception lors de la récupération des salons:', err)
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      lounges.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchLoungeById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Lounge>(api.lounge(id))
      if (response.data) {
        currentLounge.value = response.data
      } else if (response.error) {
        error.value = response.error.message
        currentLounge.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      currentLounge.value = null
    } finally {
      loading.value = false
    }
  }

  const searchLounges = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Lounge[]>(api.searchLounges(query))
      if (response.data) {
        lounges.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  const fetchLoungesByAirport = async (airport: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Lounge[]>(api.loungesByAirport(airport))
      if (response.data) {
        lounges.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  const fetchLoungesByCountry = async (country: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Lounge[]>(api.loungesByCountry(country))
      if (response.data) {
        lounges.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  const createLounge = async (loungeData: CreateLoungeDto) => {
    loading.value = true
    error.value = null

    try {
      console.log("[LOUNGE-STORE] Création d'un salon avec données:", loungeData)

      // Vérifier le format des données (notamment les types numériques)
      if (typeof loungeData.price !== 'number') {
        console.error(
          "[LOUNGE-STORE] Erreur de type: price n'est pas un nombre",
          typeof loungeData.price,
          loungeData.price,
        )
        loungeData.price = Number(loungeData.price)
      }
      if (typeof loungeData.classicDiscountPrice !== 'number') {
        console.error(
          "[LOUNGE-STORE] Erreur de type: classicDiscountPrice n'est pas un nombre",
          typeof loungeData.classicDiscountPrice,
          loungeData.classicDiscountPrice,
        )
        loungeData.classicDiscountPrice = Number(loungeData.classicDiscountPrice)
      }
      if (typeof loungeData.premiumDiscountPrice !== 'number') {
        console.error(
          "[LOUNGE-STORE] Erreur de type: premiumDiscountPrice n'est pas un nombre",
          typeof loungeData.premiumDiscountPrice,
          loungeData.premiumDiscountPrice,
        )
        loungeData.premiumDiscountPrice = Number(loungeData.premiumDiscountPrice)
      }

      console.log('[LOUNGE-STORE] Données après conversion:', loungeData)
      console.log('[LOUNGE-STORE] URL endpoint:', api.createLounge())

      const response = await httpService.post<Lounge>(api.createLounge(), loungeData)

      console.log('[LOUNGE-STORE] Réponse complète:', response)

      // Si la requête a retourné un code d'erreur mais pas d'erreur explicite
      if (response.statusCode === 401) {
        error.value =
          "Erreur d'authentification (401): Vous n'êtes pas autorisé à créer un salon. Veuillez vous reconnecter."
        console.error('[LOUNGE-STORE] Erreur 401 lors de la création du salon. Token probablement invalide ou expiré.')
        throw new Error(error.value)
      }

      if (response.data) {
        console.log('[LOUNGE-STORE] Salon créé avec succès:', response.data)
        lounges.value.push(response.data)
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        console.error('[LOUNGE-STORE] Erreur lors de la création du salon:', error.value)
        throw new Error(error.value)
      } else {
        error.value = "Aucune donnée ou erreur retournée par l'API"
        console.error('[LOUNGE-STORE] Réponse API vide ou invalide')
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du salon'
      console.error('[LOUNGE-STORE] Exception lors de la création du salon:', error.value)
      throw err // Propager l'erreur pour permettre sa gestion dans le composant
    } finally {
      loading.value = false
    }
  }

  const updateLounge = async (id: string, loungeData: UpdateLoungeDto) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.patch<Lounge>(api.updateLounge(id), loungeData)
      if (response.data) {
        const index = lounges.value.findIndex((lounge) => lounge.id === id)
        if (index !== -1) {
          lounges.value[index] = response.data
        }
        if (currentLounge.value && currentLounge.value.id === id) {
          currentLounge.value = response.data
        }
        return response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  const deleteLounge = async (id: string) => {
    loading.value = true
    error.value = null
    console.log(`[LOUNGE-STORE] Tentative de suppression du salon ID:`, id)

    try {
      const response = await httpService.delete<Lounge>(api.deleteLounge(id))
      console.log(`[LOUNGE-STORE] Réponse de suppression:`, response)

      // La suppression est considérée comme réussie si:
      // 1. Une réponse avec données est reçue
      // 2. Ou aucune erreur n'est retournée
      // 3. Ou le statut HTTP est 204 (No Content)
      if (response.data || !response.error || response.statusCode === 204) {
        console.log(`[LOUNGE-STORE] Suppression du salon réussie`)

        // Supprimer le salon de la liste des salons
        const index = lounges.value.findIndex((lounge) => lounge.id === id)
        if (index !== -1) {
          console.log(`[LOUNGE-STORE] Suppression du salon de la liste locale à l'index:`, index)
          lounges.value.splice(index, 1)
        } else {
          console.warn(
            `[LOUNGE-STORE] Le salon n'a pas été trouvé dans la liste locale. Un rafraîchissement est nécessaire.`,
          )
        }

        // Si le salon supprimé est le salon courant, le réinitialiser
        if (currentLounge.value && currentLounge.value.id === id) {
          console.log(`[LOUNGE-STORE] Réinitialisation du salon courant`)
          currentLounge.value = null
        }

        return true
      } else if (response.error) {
        console.error(`[LOUNGE-STORE] Erreur lors de la suppression:`, response.error.message)
        error.value = response.error.message
        return false
      } else {
        console.warn(`[LOUNGE-STORE] Réponse de suppression ambiguë, considérée comme un échec`)
        error.value = 'La suppression a échoué pour une raison inconnue'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression'
      console.error('[LOUNGE-STORE] Exception lors de la suppression du salon:', error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // Fonction pour récupérer les statistiques des salons
  const fetchLoungeStats = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<any>(api.loungeStats(id))
      if (response.data) {
        return response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  // Fonction pour récupérer les statistiques globales
  const fetchLoungeAnalytics = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<any>(api.loungeAnalytics())
      if (response.data) {
        return response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  return {
    lounges,
    currentLounge,
    loading,
    error,
    getLoungesByAirport,
    getLoungesByCountry,
    fetchLounges,
    fetchLoungeById,
    searchLounges,
    fetchLoungesByAirport,
    fetchLoungesByCountry,
    createLounge,
    updateLounge,
    deleteLounge,
    fetchLoungeStats,
    fetchLoungeAnalytics,
  }
})
