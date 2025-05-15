import { ref } from 'vue'
import axios from 'axios'

interface HttpResponse<T> {
  data: T | null
  error: Error | null
  loading: boolean
  statusCode?: number
}

// Fonction commune pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  console.log(`[HTTP] Getting auth token: ${token ? 'Token present' : 'No token found'}`)
  if (token) {
    console.log(`[HTTP] Token preview: ${token.substring(0, 15)}...`)
  }
  return token
}

// Fonction pour formater correctement le token d'authentification
const formatAuthHeader = (token: string): string => {
  // Si le token commence déjà par "Bearer ", ne pas le modifier
  if (token.startsWith('Bearer ')) {
    return token
  }
  // Sinon, préfixer avec "Bearer "
  return `Bearer ${token}`
}

// Créer une instance axios avec la configuration de base
const axiosInstance = axios.create({
  timeout: 10000, // 10 secondes
})

// Ajouter un intercepteur pour toutes les requêtes axios
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = formatAuthHeader(token)
    }

    // Vérifier si l'utilisateur est admin
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        if (user.isAdmin === true || user.role === 'admin') {
          // Ajouter le header X-Admin-Role
          config.headers['X-Admin-Role'] = 'true'
          console.log('[AXIOS] Ajout du header X-Admin-Role pour confirmation des droits admin')
        }
      } catch (e) {
        console.error('[AXIOS] Erreur lors de la lecture des données utilisateur:', e)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Exporter l'instance axios pour l'utiliser ailleurs
export { axiosInstance }

export default {
  async get<T>(url: string): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)
    let statusCode: number | undefined = undefined

    try {
      console.log(`[HTTP] GET request to ${url}`)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = formatAuthHeader(token)
        console.log(`[HTTP] Using token for GET: ${token.substring(0, 15)}...`)
      } else {
        console.log(`[HTTP] WARNING: No token found for authentication on GET request to ${url}`)
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      })

      statusCode = response.status
      console.log(`[HTTP] Response status for GET ${url}: ${response.status}`)

      if (!response.ok) {
        // Convertir la réponse d'erreur en texte et l'inclure dans le message d'erreur
        const errorText = await response.text()
        console.error(`[HTTP] Error response (${response.status}): ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      data.value = await response.json()
      console.log(`[HTTP] Response data:`, data.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('[HTTP] GET Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value, statusCode }
  },

  async post<T>(url: string, body: any): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)
    let statusCode: number | undefined = undefined

    try {
      console.log(`[HTTP] POST request to ${url}`, body)

      // Vérification des types de données pour les salons
      if (url.includes('/lounges') && !url.includes('/upload-image')) {
        console.log('[HTTP] Vérification des données du salon:')
        // Vérifier les prix
        if (body.price !== undefined) {
          console.log(`[HTTP] price: ${typeof body.price} (${body.price})`)
          if (typeof body.price !== 'number') {
            console.warn('[HTTP] Conversion de price en nombre')
            body.price = Number(body.price)
          }
        }
        if (body.classicDiscountPrice !== undefined) {
          console.log(`[HTTP] classicDiscountPrice: ${typeof body.classicDiscountPrice} (${body.classicDiscountPrice})`)
          if (typeof body.classicDiscountPrice !== 'number') {
            console.warn('[HTTP] Conversion de classicDiscountPrice en nombre')
            body.classicDiscountPrice = Number(body.classicDiscountPrice)
          }
        }
        if (body.premiumDiscountPrice !== undefined) {
          console.log(`[HTTP] premiumDiscountPrice: ${typeof body.premiumDiscountPrice} (${body.premiumDiscountPrice})`)
          if (typeof body.premiumDiscountPrice !== 'number') {
            console.warn('[HTTP] Conversion de premiumDiscountPrice en nombre')
            body.premiumDiscountPrice = Number(body.premiumDiscountPrice)
          }
        }

        console.log('[HTTP] Données de salon corrigées:', body)
      }

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = formatAuthHeader(token)
        console.log(`[HTTP] Using token for POST: ${token.substring(0, 15)}...`)

        // DEBUG: Forcer l'envoi d'un header supplémentaire pour le rôle admin
        if (url.includes('/lounges')) {
          headers['X-Admin-Role'] = 'true'
          console.log('[HTTP] Ajout du header X-Admin-Role pour confirmer les droits admin')
        }
      } else {
        console.log(`[HTTP] WARNING: No token found for authentication on POST request to ${url}`)
      }

      // Log complet des en-têtes
      console.log('[HTTP] En-têtes de la requête:', headers)

      // Log complet du corps de la requête
      console.log('[HTTP] Corps de la requête:', JSON.stringify(body))

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      })

      statusCode = response.status
      console.log(`[HTTP] Response status for POST ${url}: ${response.status}`)
      const responseText = await response.text()
      console.log(`[HTTP] Response text: ${responseText}`)

      if (!response.ok) {
        // Traitement spécifique de l'erreur 403
        if (response.status === 403) {
          console.error("[HTTP] Erreur 403 Forbidden - Problème d'autorisation")

          // Extraire le message d'erreur du serveur
          let errorMessage = 'Accès refusé'
          try {
            const errorObject = JSON.parse(responseText)
            errorMessage = errorObject.message || errorMessage
          } catch (e) {
            console.error("[HTTP] Impossible de parser le message d'erreur JSON")
          }

          throw new Error(
            `Erreur d'autorisation (403): ${errorMessage}. Vérifiez que votre compte a les droits administrateur.`,
          )
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }

      try {
        data.value = responseText ? (JSON.parse(responseText) as T) : null
        console.log(`[HTTP] Parsed response data:`, data.value)
      } catch (parseError) {
        console.error(`[HTTP] Error parsing response:`, parseError)
        throw new Error(`Error parsing response: ${parseError}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('[HTTP] POST Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value, statusCode }
  },

  async patch<T>(url: string, body: any): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)
    let statusCode: number | undefined = undefined

    try {
      console.log(`[HTTP] PATCH request to ${url}`)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = formatAuthHeader(token)
        console.log(`[HTTP] Using token for PATCH: ${token.substring(0, 15)}...`)
      } else {
        console.log(`[HTTP] WARNING: No token found for authentication on PATCH request to ${url}`)
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(body),
      })

      statusCode = response.status
      console.log(`[HTTP] Response status for PATCH ${url}: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[HTTP] Error response (${response.status}): ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      data.value = await response.json()
      console.log(`[HTTP] Response data:`, data.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('HTTP PATCH Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value, statusCode }
  },

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)
    let statusCode: number | undefined = undefined

    try {
      console.log(`[HTTP] DELETE request to ${url}`)

      // Créer les en-têtes de base avec cache-busting
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }

      // Ajouter le token d'authentification s'il existe
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = formatAuthHeader(token)
        console.log(`[HTTP] Using token for DELETE: ${token.substring(0, 15)}...`)
      } else {
        console.log(`[HTTP] WARNING: No token found for authentication on DELETE request to ${url}`)
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      })

      statusCode = response.status
      console.log(`[HTTP] Response status for DELETE ${url}: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[HTTP] Error response (${response.status}): ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      // Tenter de parser la réponse JSON, mais gérer le cas où la réponse est vide
      let responseText = await response.text()
      
      // Si la réponse est vide ou contient juste des espaces blancs
      if (!responseText || responseText.trim() === '') {
        console.log(`[HTTP] DELETE response is empty, treating as success`)
        data.value = null
      } else {
        try {
          data.value = JSON.parse(responseText) as T
          console.log(`[HTTP] Response data:`, data.value)
        } catch (parseError) {
          console.warn(`[HTTP] Could not parse DELETE response as JSON:`, responseText)
          // Ne pas considérer cela comme une erreur, car la suppression a réussi
          data.value = null
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('[HTTP] DELETE Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value, statusCode }
  },

  // Ajouter une méthode pour upload de fichiers via axios
  async uploadFile(url: string, formData: FormData, options: any = {}): Promise<HttpResponse<any>> {
    console.log(`[HTTP] Trying to upload file to ${url}`)
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const data = ref<any>(null)
    let statusCode: number | undefined = undefined

    try {
      // S'assurer que formData contient un fichier
      if (formData.get('file') === null) {
        console.error('[HTTP] Aucun fichier trouvé dans le formData')
        throw new Error('Aucun fichier trouvé dans le formData')
      }

      // Récupérer le token d'auth pour les logs
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      console.log(`[HTTP] Token for upload: ${token ? 'present' : 'absent'}`)

      // Préparer les en-têtes
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...(options.headers || {}),
      }

      // Vérifier les headers pour déboguer
      console.log('[HTTP] Upload headers:', headers)

      // Utiliser notre instance axios avec intercepteurs
      const response = await axiosInstance.post(url, formData, {
        ...options,
        headers,
      })

      statusCode = response.status
      console.log(`[HTTP] Upload response status: ${response.status}`)
      console.log('[HTTP] Upload response:', response.data)

      data.value = response.data
      return {
        data: data.value,
        error: null,
        loading: false,
        statusCode,
      }
    } catch (err: any) {
      console.error(`[HTTP] Upload error: ${err.message}`)
      if (err.response) {
        console.error(`[HTTP] Error status: ${err.response.status}`)
        console.error(`[HTTP] Error data:`, err.response.data)
        statusCode = err.response.status
      }

      const errorObj = new Error(
        err.response?.data?.message || (typeof err.message === 'string' ? err.message : 'Erreur inconnue'),
      )

      error.value = errorObj
      return {
        data: null,
        error: error.value,
        loading: false,
        statusCode,
      }
    } finally {
      loading.value = false
    }
  },
}
