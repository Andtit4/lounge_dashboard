import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import httpService from '../services/httpService'
import type { Lounge, CreateLoungeDto, UpdateLoungeDto } from '../types'

// Données d'exemples à utiliser si l'API renvoie un tableau vide
const sampleLoungesData: Lounge[] = [
  {
    id: 'sample-1',
    name: 'Dakar Premium Lounge',
    location: 'Terminal International',
    airport: 'Aéroport International Blaise Diagne',
    country: 'Sénégal',
    description:
      'Un salon luxueux offrant une vue imprenable sur les pistes, avec un service attentionné et une cuisine locale raffinée.',
    price: 45,
    classicDiscountPrice: 30,
    premiumDiscountPrice: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1566196544088-7891620c9d95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sample-2',
    name: 'Lagos Executive Retreat',
    location: 'Terminal 2',
    airport: 'Aéroport International Murtala Muhammed',
    country: 'Nigeria',
    description:
      "Échappez au bruit et à l'agitation dans ce havre de paix offrant des services haut de gamme pour voyageurs d'affaires et de loisirs.",
    price: 55,
    classicDiscountPrice: 40,
    premiumDiscountPrice: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sample-3',
    name: 'Le Casablanca Royal',
    location: 'Terminal 1',
    airport: 'Aéroport Mohammed V',
    country: 'Maroc',
    description:
      'Mêlant tradition marocaine et confort moderne, ce salon offre une expérience immersive dans un cadre somptueux avec des spécialités locales.',
    price: 50,
    classicDiscountPrice: 35,
    premiumDiscountPrice: 22,
    imageUrl:
      'https://images.unsplash.com/photo-1630217121039-9b09eb534133?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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
  const fetchLounges = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Lounge[]>(api.lounges())
      if (response.data) {
        // Si l'API renvoie un tableau vide, utiliser les données d'exemple
        if (response.data.length === 0) {
          lounges.value = sampleLoungesData
        } else {
          lounges.value = response.data
        }
      } else if (response.error) {
        error.value = response.error.message
        // En cas d'erreur, utiliser aussi les données d'exemple
        lounges.value = sampleLoungesData
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      // En cas d'erreur, utiliser aussi les données d'exemple
      lounges.value = sampleLoungesData
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
        // Chercher dans les données d'exemple si disponibles
        const sampleLounge = sampleLoungesData.find((lounge) => lounge.id === id)
        if (sampleLounge) {
          currentLounge.value = sampleLounge
        } else if (id.startsWith('sample-')) {
          // Si l'ID commence par "sample-", chercher parmi les exemples
          const sampleId = parseInt(id.replace('sample-', ''), 10)
          if (sampleId > 0 && sampleId <= sampleLoungesData.length) {
            currentLounge.value = sampleLoungesData[sampleId - 1]
          }
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      // Chercher dans les données d'exemple
      const sampleLounge = sampleLoungesData.find((lounge) => lounge.id === id)
      if (sampleLounge) {
        currentLounge.value = sampleLounge
      }
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
      const response = await httpService.post<Lounge>(api.createLounge(), loungeData)
      if (response.data) {
        lounges.value.push(response.data)
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

    try {
      const response = await httpService.delete<Lounge>(api.deleteLounge(id))
      if (response.data || !response.error) {
        const index = lounges.value.findIndex((lounge) => lounge.id === id)
        if (index !== -1) {
          lounges.value.splice(index, 1)
        }
        if (currentLounge.value && currentLounge.value.id === id) {
          currentLounge.value = null
        }
        return true
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
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
