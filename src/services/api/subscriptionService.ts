import axios from 'axios'
import type { AxiosResponse } from 'axios'

// URL de base de l'API backend
const API_URL = 'http://localhost:3000'

// Configuration d'Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types
export interface ISubscription {
  id: string
  userId: string
  type: string
  startDate: string
  endDate: string
  price: number
  isActive: boolean
  paymentId?: string
  isPaid: boolean
  hasUsedFreeLoungeAccess: boolean
  createdAt: string
  updatedAt: string
}

export interface ICreateSubscriptionDto {
  userId: string
  type: string
  startDate: Date
  endDate: Date
  price: number
  paymentId?: string
}

export interface IUpdateSubscriptionDto {
  isActive?: boolean
  isPaid?: boolean
  paymentId?: string
  hasUsedFreeLoungeAccess?: boolean
}

// Service API pour les abonnements
export class SubscriptionService {
  // Récupérer tous les abonnements
  static async getAllSubscriptions(): Promise<ISubscription[]> {
    try {
      const response: AxiosResponse<ISubscription[]> = await apiClient.get('/subscriptions')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error)
      throw error
    }
  }

  // Récupérer un abonnement par ID
  static async getSubscriptionById(id: string): Promise<ISubscription> {
    try {
      const response: AxiosResponse<ISubscription> = await apiClient.get(`/subscriptions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'abonnement ${id}:`, error)
      throw error
    }
  }

  // Récupérer les abonnements d'un utilisateur
  static async getUserSubscriptions(userId: string): Promise<ISubscription[]> {
    try {
      const response: AxiosResponse<ISubscription[]> = await apiClient.get(`/subscriptions?userId=${userId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération des abonnements de l'utilisateur ${userId}:`, error)
      throw error
    }
  }

  // Créer un nouvel abonnement
  static async createSubscription(subscriptionData: ICreateSubscriptionDto): Promise<ISubscription> {
    try {
      const response: AxiosResponse<ISubscription> = await apiClient.post('/subscriptions', subscriptionData)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error)
      throw error
    }
  }

  // Mettre à jour un abonnement
  static async updateSubscription(id: string, subscriptionData: IUpdateSubscriptionDto): Promise<ISubscription> {
    try {
      const response: AxiosResponse<ISubscription> = await apiClient.patch(`/subscriptions/${id}`, subscriptionData)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'abonnement ${id}:`, error)
      throw error
    }
  }

  // Annuler un abonnement
  static async cancelSubscription(id: string): Promise<ISubscription> {
    try {
      const response: AxiosResponse<ISubscription> = await apiClient.patch(`/subscriptions/${id}/cancel`, {})
      return response.data
    } catch (error) {
      console.error(`Erreur lors de l'annulation de l'abonnement ${id}:`, error)
      throw error
    }
  }

  // Vérifier si un utilisateur a un abonnement actif
  static async checkSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean
    subscriptionType: string | null
    subscriptionExpiry: string | null
  }> {
    try {
      const response: AxiosResponse = await apiClient.get(`/subscriptions/status/${userId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la vérification du statut d'abonnement pour l'utilisateur ${userId}:`, error)
      throw error
    }
  }

  // Souscrire à un nouvel abonnement et effectuer le paiement
  static async subscribe(userId: string, planType: string, durationMonths: number): Promise<ISubscription> {
    try {
      // Calculer les dates de début et de fin
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + durationMonths)

      // Déterminer le prix en fonction du type et de la durée
      let price = 0
      if (planType === 'Classic') {
        price = durationMonths === 12 ? 120 : 14.99 * durationMonths
      } else if (planType === 'Premium') {
        price = durationMonths === 12 ? 240 : 29.99 * durationMonths
      }

      // Créer l'abonnement
      return await this.createSubscription({
        userId,
        type: planType,
        startDate,
        endDate,
        price,
      })
    } catch (error) {
      console.error('Erreur lors de la souscription:', error)
      throw error
    }
  }
}
