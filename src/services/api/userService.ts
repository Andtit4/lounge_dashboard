import axios from 'axios'
import type { AxiosResponse } from 'axios'

// URL de base de l'API backend
const API_URL = 'http://185.97.146.99:6610'

// Configuration d'Axios avec des logs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur de requête pour logger les requêtes
apiClient.interceptors.request.use((request) => {
  console.log('Envoi de requête:', request.method?.toUpperCase(), request.url)
  return request
})

// Intercepteur de réponse pour logger les réponses
apiClient.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Erreur API:', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Types
export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
  // Champs d'abonnement
  subscriptionType?: string
  subscriptionStartDate?: string
  subscriptionExpiryDate?: string
  notes?: string
}

export interface ICreateUserDto {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  isAdmin?: boolean
  // Champs d'abonnement optionnels pour la création
  subscriptionType?: string
  subscriptionStartDate?: string
  subscriptionExpiryDate?: string
  notes?: string
}

export interface IUpdateUserDto {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phoneNumber?: string
  isAdmin?: boolean
  // Champs d'abonnement
  subscriptionType?: string
  subscriptionStartDate?: string
  subscriptionExpiryDate?: string
  notes?: string
}

// Service API pour les utilisateurs
export class UserService {
  // Récupérer tous les utilisateurs
  static async getAllUsers(): Promise<IUser[]> {
    try {
      console.log('UserService: Récupération de tous les utilisateurs')
      const response: AxiosResponse<IUser[]> = await apiClient.get('/users')
      console.log('UserService: Utilisateurs récupérés', response.data)
      return response.data
    } catch (error) {
      console.error('UserService: Erreur lors de la récupération des utilisateurs:', error)
      throw error
    }
  }

  // Récupérer un utilisateur par son ID
  static async getUserById(id: string): Promise<IUser> {
    try {
      console.log(`UserService: Récupération de l'utilisateur ${id}`)
      const response: AxiosResponse<IUser> = await apiClient.get(`/users/${id}`)
      console.log(`UserService: Utilisateur ${id} récupéré`, response.data)
      return response.data
    } catch (error) {
      console.error(`UserService: Erreur lors de la récupération de l'utilisateur ${id}:`, error)
      throw error
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: ICreateUserDto): Promise<IUser> {
    try {
      console.log("UserService: Création d'un utilisateur", userData)
      const response: AxiosResponse<IUser> = await apiClient.post('/users', userData)
      console.log('UserService: Utilisateur créé', response.data)
      return response.data
    } catch (error) {
      console.error("UserService: Erreur lors de la création de l'utilisateur:", error)
      throw error
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id: string, userData: IUpdateUserDto): Promise<IUser> {
    try {
      console.log(`UserService: Mise à jour de l'utilisateur ${id}`, userData)
      const response: AxiosResponse<IUser> = await apiClient.patch(`/users/${id}`, userData)
      console.log(`UserService: Utilisateur ${id} mis à jour`, response.data)
      return response.data
    } catch (error) {
      console.error(`UserService: Erreur lors de la mise à jour de l'utilisateur ${id}:`, error)
      throw error
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(id: string): Promise<void> {
    try {
      console.log(`UserService: Suppression de l'utilisateur ${id}`)
      await apiClient.delete(`/users/${id}`)
      console.log(`UserService: Utilisateur ${id} supprimé`)
    } catch (error) {
      console.error(`UserService: Erreur lors de la suppression de l'utilisateur ${id}:`, error)
      throw error
    }
  }
}
