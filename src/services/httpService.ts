import { ref } from 'vue'

interface HttpResponse<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export default {
  async get<T>(url: string): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)

    try {
      console.log(`[HTTP] GET request to ${url}`)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      })

      console.log(`[HTTP] Response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      data.value = await response.json()
      console.log(`[HTTP] Response data:`, data.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('[HTTP] GET Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value }
  },

  async post<T>(url: string, body: any): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)

    try {
      console.log(`[HTTP] POST request to ${url}`, body)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log(`[HTTP] Authorization header added with token: ${token.substring(0, 10)}...`)
      } else {
        console.log(`[HTTP] No token found in storage`)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      })

      console.log(`[HTTP] Response status: ${response.status}`)
      const responseText = await response.text()
      console.log(`[HTTP] Response text: ${responseText}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`)
      }

      try {
        data.value = JSON.parse(responseText) as T
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

    return { data: data.value, error: error.value, loading: loading.value }
  },

  async patch<T>(url: string, body: any): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)

    try {
      console.log(`[HTTP] PATCH request to ${url}`)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(body),
      })

      console.log(`[HTTP] Response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      data.value = await response.json()
      console.log(`[HTTP] Response data:`, data.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('HTTP PATCH Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value }
  },

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref<boolean>(true)

    try {
      console.log(`[HTTP] DELETE request to ${url}`)

      // Créer les en-têtes de base
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Ajouter le token d'authentification s'il existe
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      })

      console.log(`[HTTP] Response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      data.value = await response.json()
      console.log(`[HTTP] Response data:`, data.value)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('HTTP DELETE Error:', error.value)
    } finally {
      loading.value = false
    }

    return { data: data.value, error: error.value, loading: loading.value }
  },
}
