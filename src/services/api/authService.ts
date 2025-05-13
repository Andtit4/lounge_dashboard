// Définition des types
export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin?: boolean
  phoneNumber?: string
  createdAt?: string
  updatedAt?: string
  subscriptionType?: string
  subscriptionExpiryDate?: string
}

export interface ILoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface IAuthState {
  user: IUser | null
  token: string | null
  isAuthenticated: boolean
}

// Fonction utilitaire pour la persistance et la récupération des données
const storagePrefix = 'lounge_dashboard_'

const storage = {
  getToken: (): string | null => {
    return JSON.parse(localStorage.getItem(`${storagePrefix}token`) || 'null')
  },
  setToken: (token: string): void => {
    localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
  },
  clearToken: (): void => {
    localStorage.removeItem(`${storagePrefix}token`)
  },
  getUser: (): IUser | null => {
    return JSON.parse(localStorage.getItem(`${storagePrefix}user`) || 'null')
  },
  setUser: (user: IUser): void => {
    localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user))
  },
  clearUser: (): void => {
    localStorage.removeItem(`${storagePrefix}user`)
  },
}

// Service d'authentification
export const AuthService = {
  // Récupérer l'état d'authentification actuel
  getCurrentAuth: (): IAuthState => {
    const token = storage.getToken()
    const user = storage.getUser()

    return {
      user,
      token,
      isAuthenticated: !!token && !!user,
    }
  },

  // Fonction de connexion
  login: async (credentials: ILoginRequest): Promise<IAuthState> => {
    try {
      // Simuler une API pour l'instant
      // Dans un environnement réel, cela ferait un appel à votre backend
      // const response = await api.post('/auth/login', credentials);

      // Simulation d'une réponse d'API (à remplacer par votre implémentation réelle)
      const mockResponse = {
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: credentials.email,
          isAdmin: credentials.email.includes('admin'),
          createdAt: new Date().toISOString(),
          subscriptionType: 'PREMIUM',
          subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        token: 'fake-jwt-token',
      }

      const { user, token } = mockResponse

      // Stockage des informations d'authentification
      if (credentials.rememberMe) {
        storage.setToken(token)
        storage.setUser(user)
      } else {
        // Si l'utilisateur ne veut pas être mémorisé, utiliser sessionStorage
        sessionStorage.setItem(`${storagePrefix}token`, JSON.stringify(token))
        sessionStorage.setItem(`${storagePrefix}user`, JSON.stringify(user))
      }

      return {
        user,
        token,
        isAuthenticated: true,
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw new Error('Échec de la connexion. Veuillez vérifier vos identifiants.')
    }
  },

  // Fonction de déconnexion
  logout: (): void => {
    storage.clearToken()
    storage.clearUser()
    sessionStorage.removeItem(`${storagePrefix}token`)
    sessionStorage.removeItem(`${storagePrefix}user`)
  },

  // Fonction d'enregistrement
  register: async (userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> => {
    try {
      // Simuler un appel API
      // Dans un environnement réel, cela ferait un appel à votre backend
      // const response = await api.post('/auth/register', userData);

      // Simulation d'une réponse d'API (à remplacer par votre implémentation réelle)
      const mockUser: IUser = {
        id: Math.random().toString(36).substring(2, 15),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return mockUser
    } catch (error) {
      console.error("Erreur d'enregistrement:", error)
      throw new Error("Échec de l'enregistrement. Veuillez réessayer.")
    }
  },

  // Vérifier si le token est valide (pourrait faire une requête au backend)
  checkAuth: async (): Promise<boolean> => {
    const { token, user } = AuthService.getCurrentAuth()

    if (!token || !user) {
      return false
    }

    // Dans un environnement réel, vous pourriez vérifier la validité du token avec le backend
    // const response = await api.post('/auth/verify', { token });
    // return response.data.valid;

    return true
  },
}
