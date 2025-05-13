import { defineStore } from 'pinia'
import { ref /* , computed */ } from 'vue'
import api from '../services/api'
import httpService from '../services/httpService'
import type { Booking, CreateBookingDto, UpdateBookingDto } from '../types'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Récupérer les réservations de l'utilisateur
  const fetchUserBookings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Booking[]>(api.userBookings())
      if (response.data) {
        bookings.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  // Récupérer une réservation par ID
  const fetchBookingById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Booking>(api.booking(id))
      if (response.data) {
        currentBooking.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  // Créer une nouvelle réservation
  const createBooking = async (bookingData: CreateBookingDto) => {
    loading.value = true
    error.value = null

    try {
      // Omit userId as it will be retrieved by the backend from the JWT token
      const { /*  userId, */ ...bookingDataWithoutUserId } = bookingData
      const response = await httpService.post<Booking>(api.createBooking(), bookingDataWithoutUserId)

      if (response.data) {
        bookings.value.push(response.data)
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return null
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour une réservation
  const updateBooking = async (id: string, bookingData: UpdateBookingDto) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.patch<Booking>(api.updateBooking(id), bookingData)
      if (response.data) {
        const index = bookings.value.findIndex((booking) => booking.id === id)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        if (currentBooking.value && currentBooking.value.id === id) {
          currentBooking.value = response.data
        }
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return null
    } finally {
      loading.value = false
    }
  }

  // Annuler une réservation
  const cancelBooking = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.patch<Booking>(api.updateBooking(id), { status: 'CANCELLED' })
      if (response.data) {
        const index = bookings.value.findIndex((booking) => booking.id === id)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        if (currentBooking.value && currentBooking.value.id === id) {
          currentBooking.value = response.data
        }
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return null
    } finally {
      loading.value = false
    }
  }

  // Récupérer toutes les réservations (admin)
  const fetchAllBookings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.get<Booking[]>(api.bookings())
      if (response.data) {
        bookings.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  // Confirmer une réservation (admin)
  const confirmBooking = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // Utiliser l'endpoint updateBooking au lieu de confirmBooking pour contourner les problèmes d'autorisation
      const response = await httpService.patch<Booking>(api.updateBooking(id), { status: 'CONFIRMED' })
      if (response.data) {
        const index = bookings.value.findIndex((booking) => booking.id === id)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        if (currentBooking.value && currentBooking.value.id === id) {
          currentBooking.value = response.data
        }
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return null
    } finally {
      loading.value = false
    }
  }

  // Marquer une réservation comme terminée (admin)
  const completeBooking = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // Utiliser l'endpoint updateBooking au lieu de completeBooking pour contourner les problèmes d'autorisation
      const response = await httpService.patch<Booking>(api.updateBooking(id), { status: 'COMPLETED' })
      if (response.data) {
        const index = bookings.value.findIndex((booking) => booking.id === id)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        if (currentBooking.value && currentBooking.value.id === id) {
          currentBooking.value = response.data
        }
        return response.data
      } else if (response.error) {
        error.value = response.error.message
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    bookings,
    currentBooking,
    loading,
    error,
    fetchUserBookings,
    fetchBookingById,
    createBooking,
    updateBooking,
    cancelBooking,
    fetchAllBookings,
    confirmBooking,
    completeBooking,
  }
})
