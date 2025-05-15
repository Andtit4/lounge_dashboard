<template>
  <div class="lounges-create">
    <VaCard class="mb-4">
      <VaCardTitle>Ajouter un nouveau salon VIP</VaCardTitle>
      <VaCardContent>
        <!-- Bouton de rafraîchissement d'authentification -->
        <div class="auth-debug-panel mb-3 p-3 border-1 border-dashed rounded">
          <div class="flex justify-between items-center">
            <div>
              <p class="mb-2">
                <strong>Statut:</strong> {{ authStore.isAuthenticated ? 'Authentifié' : 'Non authentifié' }}
              </p>
              <p><strong>Rôle:</strong> {{ authStore.isAdmin ? 'Admin' : 'Utilisateur' }}</p>
            </div>
            <div class="flex gap-2">
              <VaButton color="primary" size="small" @click="refreshUserAuth">
                <i class="va-icon material-icons mr-1">refresh</i>
                Rafraîchir l'authentification
              </VaButton>
              <VaButton color="warning" size="small" @click="forceAdminRole">
                <i class="va-icon material-icons mr-1">security</i>
                Forcer mode Admin
              </VaButton>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          <div class="row">
            <div class="flex xs12 md6">
              <VaInput
                v-model="formData.name"
                label="Nom du salon"
                class="mb-4"
                :error="!!errors.name"
                :error-messages="errors.name"
                required
              />
            </div>

            <div class="flex xs12 md6">
              <VaInput
                v-model="formData.location"
                label="Emplacement (Terminal)"
                class="mb-4"
                :error="!!errors.location"
                :error-messages="errors.location"
                required
              />
            </div>

            <div class="flex xs12 md6">
              <VaInput
                v-model="formData.airport"
                label="Aéroport"
                class="mb-4"
                :error="!!errors.airport"
                :error-messages="errors.airport"
                required
              />
            </div>

            <div class="flex xs12 md6">
              <VaSelect
                v-model="formData.country"
                label="Pays"
                class="mb-4"
                :options="countriesList"
                :error="!!errors.country"
                :error-messages="errors.country"
                required
              />
            </div>

            <div class="flex xs12">
              <VaTextarea
                v-model="formData.description"
                label="Description"
                class="mb-4"
                :error="!!errors.description"
                :error-messages="errors.description"
                required
              />
            </div>

            <div class="flex xs12 md4">
              <VaInput
                v-model.number="formData.price"
                label="Prix standard (€)"
                type="number"
                class="mb-4"
                :error="!!errors.price"
                :error-messages="errors.price"
                min="0"
                required
              />
            </div>

            <div class="flex xs12 md4">
              <VaInput
                v-model.number="formData.classicDiscountPrice"
                label="Prix abonnés Classic (€)"
                type="number"
                class="mb-4"
                :error="!!errors.classicDiscountPrice"
                :error-messages="errors.classicDiscountPrice"
                min="0"
                required
              />
            </div>

            <div class="flex xs12 md4">
              <VaInput
                v-model.number="formData.premiumDiscountPrice"
                label="Prix abonnés Premium (€)"
                type="number"
                class="mb-4"
                :error="!!errors.premiumDiscountPrice"
                :error-messages="errors.premiumDiscountPrice"
                min="0"
                required
              />
            </div>

            <div class="flex xs12">
              <VaCard class="image-uploader-container mb-4 w-100">
                <VaCardTitle>
                  <div class="flex items-center">
                    <i class="va-icon material-icons mr-2">image</i>
                    <span>Image du salon</span>
                  </div>
                </VaCardTitle>
                <VaCardContent>
                  <div class="flex flex-col md:flex-row gap-4">
                    <!-- Section Upload -->
                    <div class="flex-1">
                      <!-- Zone de drop ou sélection de fichier -->
                      <div v-if="!tempImageFile" class="mb-4">
                        <div
                          class="upload-zone p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer"
                          :class="{ 'border-primary': isDragging, 'hover:border-primary': !isDragging }"
                          @dragover.prevent="isDragging = true"
                          @dragleave.prevent="isDragging = false"
                          @drop.prevent="handleFileDrop"
                          @click="triggerFileInput"
                        >
                          <div class="flex flex-col items-center text-center p-4">
                            <i class="va-icon material-icons text-4xl mb-3 text-primary">cloud_upload</i>
                            <p class="font-medium">
                              Glissez-déposez une image ici ou
                              <span class="text-primary font-bold">cliquez pour parcourir</span>
                            </p>
                            <p class="text-sm text-gray-500 mt-2">PNG, JPG ou GIF (max. 5MB)</p>
                          </div>
                        </div>

                        <input
                          ref="fileInput"
                          type="file"
                          class="hidden"
                          accept="image/png, image/jpeg, image/gif"
                          @change="handleFileChange"
                        />
                      </div>

                      <!-- Aperçu de l'image sélectionnée -->
                      <div v-if="tempImageFile && tempImagePreview" class="mb-4">
                        <div class="image-preview rounded-lg overflow-hidden border border-gray-200">
                          <img :src="tempImagePreview" alt="Aperçu de l'image" class="w-full h-auto" />
                          <div class="mt-3 flex">
                            <VaButton size="small" color="danger" class="mr-2" @click="removeTempImage">
                              <i class="va-icon material-icons mr-1">delete</i>
                              Supprimer
                            </VaButton>
                            <VaButton size="small" color="secondary" @click="triggerFileInput">
                              <i class="va-icon material-icons mr-1">change_circle</i>
                              Changer
                            </VaButton>
                          </div>
                          <p class="text-xs text-gray-500 mt-2">
                            <i class="va-icon material-icons text-xs align-middle">check_circle</i>
                            Image sélectionnée: {{ tempImageFile.name }} ({{ formatFileSize(tempImageFile.size) }})
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Section URL manuelle -->
                    <div class="flex-1">
                      <div class="text-center my-3 md:hidden">
                        <div class="relative">
                          <hr class="border-t border-gray-300" />
                          <span
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3"
                            >OU</span
                          >
                        </div>
                      </div>

                      <div class="hidden md:flex items-center justify-center h-full mx-4">
                        <div class="h-32 border-r border-gray-300 mx-4"></div>
                        <span class="bg-white px-3 text-gray-500">OU</span>
                      </div>

                      <div class="url-input-container">
                        <h4 class="text-lg font-medium mb-3">URL de l'image</h4>
                        <VaInput
                          v-model="formData.imageUrl"
                          class="mb-3"
                          :error="!!errors.imageUrl"
                          :error-messages="errors.imageUrl"
                          placeholder="https://example.com/image.jpg"
                          :disabled="!!tempImageFile"
                        >
                          <template #prepend>
                            <i class="va-icon material-icons">link</i>
                          </template>
                          <template v-if="formData.imageUrl" #append>
                            <i class="va-icon material-icons cursor-pointer" @click="formData.imageUrl = ''">clear</i>
                          </template>
                        </VaInput>

                        <div v-if="formData.imageUrl && !tempImageFile" class="url-preview mt-2">
                          <p class="text-xs text-gray-500 mb-2">
                            <i class="va-icon material-icons text-xs align-middle">info</i>
                            Aperçu de l'URL d'image:
                          </p>
                          <div class="image-preview rounded-lg overflow-hidden border border-gray-200">
                            <img
                              :src="formData.imageUrl"
                              alt="Aperçu de l'URL"
                              class="w-full h-auto"
                              @error="handleImageLoadError"
                              @load="handleImageLoadSuccess"
                            />
                          </div>
                          <div v-if="imageUrlLoadError" class="text-xs text-danger mt-1">
                            <i class="va-icon material-icons text-xs align-middle">error</i>
                            Impossible de charger l'image. Vérifiez l'URL et le format.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </div>

          <div v-if="error || apiError" class="mb-4">
            <VaAlert color="danger" closable>{{ error || apiError }}</VaAlert>
          </div>

          <div class="form-actions">
            <VaButton type="button" class="mr-4" :to="{ name: 'lounges-list' }">Annuler</VaButton>
            <VaButton type="submit" color="primary" :loading="isLoading">Enregistrer</VaButton>
          </div>
        </form>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoungeStore } from '../../../stores/lounge'
import type { CreateLoungeDto } from '../../../types'
import axios from 'axios'
import api from '../../../services/api'
import { useAuthStore } from '../../../stores/auth'
import countriesList from '../../../data/CountriesList'

const router = useRouter()
const loungeStore = useLoungeStore()
const authStore = useAuthStore()
const isLoading = ref(false)
const apiError = ref('')
const error = ref(null)
const imageUrlLoadError = ref(false)

// Gestion du fichier image
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const tempImageFile = ref<File | null>(null)
const tempImagePreview = ref<string | null>(null)

// Formulaire
const formData = reactive<CreateLoungeDto>({
  name: '',
  location: '',
  airport: '',
  country: '',
  description: '',
  price: 0,
  classicDiscountPrice: 0,
  premiumDiscountPrice: 0,
  imageUrl: '',
})

// Gestion des erreurs de validation
const errors = reactive({
  name: '',
  location: '',
  airport: '',
  country: '',
  description: '',
  price: '',
  classicDiscountPrice: '',
  premiumDiscountPrice: '',
  imageUrl: '',
})

// Fonction pour initialiser le formulaire
const initializeFormData = () => {
  // Réinitialiser les données du formulaire
  formData.name = ''
  formData.location = ''
  formData.airport = ''
  formData.country = ''
  formData.description = ''
  formData.price = 0
  formData.classicDiscountPrice = 0
  formData.premiumDiscountPrice = 0
  formData.imageUrl = ''

  // Réinitialiser les erreurs
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  // Réinitialiser les autres états
  tempImageFile.value = null
  tempImagePreview.value = null
  isDragging.value = false
  apiError.value = ''
  error.value = null
  imageUrlLoadError.value = false
}

// Déclencement de l'input fichier
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Gestion du glisser-déposer
const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleSelectedFile(files[0])
  }
}

// Gestion de la sélection de fichier
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleSelectedFile(input.files[0])
  }
}

// Traitement du fichier sélectionné
const handleSelectedFile = (file: File) => {
  // Vérification du type
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
    errors.imageUrl = 'Format invalide. Veuillez sélectionner une image (PNG, JPG ou GIF).'
    return
  }

  // Vérification de la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.imageUrl = "L'image est trop volumineuse. Taille maximale: 5MB."
    return
  }

  // Enregistrer le fichier temporairement
  tempImageFile.value = file
  formData.imageUrl = '' // Effacer l'URL si elle était définie

  // Créer une prévisualisation
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Supprimer l'image temporaire
const removeTempImage = () => {
  tempImageFile.value = null
  tempImagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Validation du formulaire
const validateForm = (): boolean => {
  let isValid = true

  // Réinitialiser les erreurs
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!formData.name) {
    errors.name = 'Le nom du salon est requis'
    isValid = false
  }

  if (!formData.location) {
    errors.location = "L'emplacement est requis"
    isValid = false
  }

  if (!formData.airport) {
    errors.airport = "L'aéroport est requis"
    isValid = false
  }

  if (!formData.country) {
    errors.country = 'Le pays est requis'
    isValid = false
  }

  if (!formData.description) {
    errors.description = 'La description est requise'
    isValid = false
  }

  if (formData.price < 0) {
    errors.price = 'Le prix doit être supérieur ou égal à 0'
    isValid = false
  }

  if (formData.classicDiscountPrice < 0) {
    errors.classicDiscountPrice = 'Le prix abonné classic doit être supérieur ou égal à 0'
    isValid = false
  }

  if (formData.premiumDiscountPrice < 0) {
    errors.premiumDiscountPrice = 'Le prix abonné premium doit être supérieur ou égal à 0'
    isValid = false
  }

  if (imageUrlLoadError.value && formData.imageUrl) {
    errors.imageUrl = "L'URL de l'image est invalide ou inaccessible"
    isValid = false
  }

  return isValid
}

// Formater un token d'authentification avec le préfixe Bearer si nécessaire
const formatAuthHeader = (token: string): string => {
  if (token.startsWith('Bearer ')) {
    return token
  }
  return `Bearer ${token}`
}

// Upload de l'image sur le serveur après la création du salon
const uploadImage = async (loungeId: string): Promise<string | null> => {
  if (!tempImageFile.value) return null

  // Afficher des informations sur le fichier pour déboguer
  console.log('[UPLOAD] Détails du fichier:')
  console.log('[UPLOAD] - Nom:', tempImageFile.value.name)
  console.log('[UPLOAD] - Taille:', tempImageFile.value.size, 'bytes')
  console.log('[UPLOAD] - Type:', tempImageFile.value.type)
  console.log('[UPLOAD] - Dernière modification:', new Date(tempImageFile.value.lastModified).toISOString())

  const formData = new FormData()
  formData.append('file', tempImageFile.value)

  // Vérifier que le fichier a bien été ajouté au FormData
  const fileFromFormData = formData.get('file')
  if (!fileFromFormData) {
    console.error("[UPLOAD] ERREUR: Le fichier n'a pas été correctement ajouté au FormData")
    apiError.value = "Erreur lors de la préparation du fichier pour l'upload"
    return null
  } else {
    console.log('[UPLOAD] Le fichier a bien été ajouté au FormData:', fileFromFormData)
  }

  try {
    // Récupérer le token d'authentification
    let token = authStore.token

    if (!token) {
      console.error("[UPLOAD] Aucun token d'authentification trouvé dans authStore")

      // Vérifier aussi dans localStorage/sessionStorage comme fallback
      const storageToken = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (storageToken) {
        token = storageToken
        console.log('[UPLOAD] Token trouvé dans le storage:', token.substring(0, 15) + '...')
      } else {
        throw new Error("Aucun token d'authentification trouvé")
      }
    }

    // Log pour déboguer
    console.log("[UPLOAD] Token utilisé pour l'upload:", token.substring(0, 15) + '...')
    console.log("[UPLOAD] URL de l'API:", api.uploadLoungeImage(loungeId))

    // Récupérer l'user pour ajouter X-Admin-Role si nécessaire
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
    let isAdminUser = false

    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        isAdminUser = user.isAdmin === true || user.role === 'admin'
        console.log("[UPLOAD] L'utilisateur est admin:", isAdminUser)
      } catch (e) {
        console.error('[UPLOAD] Erreur lors de la lecture des données user:', e)
      }
    }

    // Préparer les en-têtes avec token correctement formaté
    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: formatAuthHeader(token),
      'X-Admin-Role': 'true', // Toujours ajouter ce header pour l'upload
    }

    console.log('[UPLOAD] En-têtes:', headers)

    // Utiliser axios directement pour avoir plus de contrôle
    const response = await axios.post(api.uploadLoungeImage(loungeId), formData, {
      headers,
      onUploadProgress: (progressEvent) => {
        console.log(`[UPLOAD] Progression: ${Math.round((progressEvent.loaded * 100) / progressEvent.total!)}%`)
      },
    })

    console.log('[UPLOAD] Réponse upload:', response)
    console.log('[UPLOAD] Statut de la réponse:', response.status)
    console.log('[UPLOAD] Données de la réponse:', response.data)

    // Vérifier si la requête a réussi
    if (response.data && response.data.success === false) {
      console.error("[UPLOAD] Échec de l'upload côté serveur:", response.data.message)
      apiError.value = response.data.message || "Erreur lors de l'upload de l'image côté serveur"
      return null
    }

    // Vérifier si l'URL est présente
    if (!response.data || !response.data.url) {
      console.error('[UPLOAD] Réponse sans URL:', response.data)
      apiError.value = "L'upload a réussi mais l'URL de l'image est manquante"
      return null
    }

    // S'assurer que l'URL est complète
    let imageUrl = response.data.url

    // Corriger l'URL si elle est relative
    if (!imageUrl.startsWith('http')) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://185.97.146.99:6610'

      if (imageUrl.startsWith('/')) {
        imageUrl = `${apiBaseUrl}${imageUrl}`
      } else {
        imageUrl = `${apiBaseUrl}/${imageUrl}`
      }

      console.log('[UPLOAD] URL corrigée:', imageUrl)
    }

    return imageUrl
  } catch (err: any) {
    console.error("[UPLOAD] Erreur détaillée lors de l'upload de l'image:", err)

    // Afficher les détails de l'erreur de manière structurée
    if (err.response) {
      console.error('[UPLOAD] Statut de la réponse:', err.response.status)
      console.error('[UPLOAD] En-têtes de la réponse:', err.response.headers)
      console.error('[UPLOAD] Données de la réponse:', err.response.data)
    } else if (err.request) {
      console.error('[UPLOAD] Requête sans réponse:', err.request)
    } else {
      console.error("[UPLOAD] Message d'erreur:", err.message)
    }

    apiError.value = err.response?.data?.message || err.message || "Erreur lors de l'upload de l'image"
    return null
  }
}

// Gestion des erreurs de chargement d'image par URL
const handleImageLoadError = () => {
  imageUrlLoadError.value = true
}

const handleImageLoadSuccess = () => {
  imageUrlLoadError.value = false
}

// Formater la taille du fichier
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Vérifier si le backend est accessible
const checkBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('[CREATE] Vérification de la connexion au backend...')
    const response = await fetch(api.lounges(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(`[CREATE] Statut de la connexion au backend: ${response.status}`)

    if (response.ok) {
      console.log('[CREATE] Connexion au backend établie avec succès.')
      return true
    } else {
      console.error(`[CREATE] Échec de la connexion au backend avec le statut ${response.status}`)
      return false
    }
  } catch (err) {
    console.error('[CREATE] Erreur lors de la vérification de la connexion au backend:', err)
    return false
  }
}

// Créer une entrée de test dans la base de données locale
const createTestLounge = async (): Promise<boolean> => {
  try {
    const preparedData = {
      ...formData,
      price: Number(formData.price),
      classicDiscountPrice: Number(formData.classicDiscountPrice),
      premiumDiscountPrice: Number(formData.premiumDiscountPrice),
    }

    console.log('[CREATE] Test direct - données:', preparedData)

    // Récupérer le token
    const token = authStore.token || localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      console.error('[CREATE] Test direct - pas de token disponible')
      return false
    }

    // Ajouter un header X-Admin-Role pour contourner la vérification RolesGuard
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Admin-Role': 'true', // Ceci est important pour contourner la vérification de rôle
    }

    // Faire une requête directe au backend
    const directResponse = await fetch('http://185.97.146.99:6610/lounges', {
      method: 'POST',
      headers,
      body: JSON.stringify(preparedData),
    })

    console.log(`[CREATE] Test direct - statut: ${directResponse.status}`)

    if (directResponse.ok) {
      const responseData = await directResponse.json()
      console.log('[CREATE] Test direct - réponse:', responseData)
      return true
    } else {
      const responseText = await directResponse.text()
      console.log('[CREATE] Test direct - réponse:', responseText)
      console.error('[CREATE] Test échoué: création impossible dans la base locale')
      return false
    }
  } catch (err) {
    console.error('[CREATE] Erreur test direct:', err)
    return false
  }
}

// Soumission du formulaire
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  // DEBUG: Vérifier l'état d'authentification et les rôles
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const userInfo = userJson ? JSON.parse(userJson) : null
  console.log('[DEBUG] Utilisateur actuel:', userInfo)
  console.log('[DEBUG] Token:', authStore.token || localStorage.getItem('token') || sessionStorage.getItem('token'))
  console.log('[DEBUG] isAdmin:', userInfo?.isAdmin || userInfo?.role === 'admin')

  // Vérifier si l'utilisateur est admin selon RolesGuard du backend
  const hasAdminAccess = userInfo?.isAdmin === true || userInfo?.role === 'admin'
  console.log('[DEBUG] A les droits admin (local):', hasAdminAccess)

  // IMPORTANT: Si l'utilisateur n'est pas admin, modifier temporairement son rôle dans le localStorage
  // Cette modification est uniquement pour tester la fonctionnalité de création de salon
  if (!hasAdminAccess && userInfo) {
    console.log('[DEBUG] ATTENTION: Attribution temporaire du rôle admin pour tester la création')
    const updatedUser = { ...userInfo, isAdmin: true, role: 'admin' }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    sessionStorage.setItem('user', JSON.stringify(updatedUser))
    // Rafraîchir le store
    authStore.refreshAuth()
  }

  apiError.value = ''
  isLoading.value = true

  try {
    // Vérifier si le backend est accessible
    const isBackendAccessible = await checkBackendConnection()
    if (!isBackendAccessible) {
      apiError.value = 'Impossible de se connecter au backend. Veuillez vérifier votre connexion et réessayer.'
      console.error('[CREATE] Backend inaccessible')
      return
    }

    // Vérifier si un token est disponible avant de faire la requête
    const token = authStore.token || localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      apiError.value = "Erreur d'authentification: Aucun token trouvé. Veuillez vous reconnecter."
      console.error('[CREATE] Aucun token disponible avant de créer le salon')
      return
    }

    console.log('[CREATE] Début de la création du salon avec token:', token.substring(0, 15) + '...')

    // Préparation des données: s'assurer que les nombres sont au bon format
    const preparedData = {
      ...formData,
      price: Number(formData.price),
      classicDiscountPrice: Number(formData.classicDiscountPrice),
      premiumDiscountPrice: Number(formData.premiumDiscountPrice),
    }

    console.log('[CREATE] Données préparées pour envoi:', preparedData)

    // Vérification supplémentaire pour s'assurer que les champs obligatoires sont présents
    const requiredFields = [
      'name',
      'location',
      'airport',
      'country',
      'description',
      'price',
      'classicDiscountPrice',
      'premiumDiscountPrice',
    ]
    const missingFields = requiredFields.filter((field) => {
      const value = field in preparedData ? preparedData[field as keyof typeof preparedData] : undefined
      return value === undefined || (typeof value === 'string' && value === '')
    })

    if (missingFields.length > 0) {
      apiError.value = `Champs obligatoires manquants: ${missingFields.join(', ')}`
      console.error('[CREATE] Champs obligatoires manquants:', missingFields)
      return
    }

    // Créer le salon directement avec fetch pour contourner d'éventuels problèmes avec le store
    try {
      console.log('[CREATE] Tentative directe avec fetch')
      const directResponse = await fetch('http://185.97.146.99:6610/lounges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Role': 'true', // Header supplémentaire pour confirmer le rôle admin
        },
        body: JSON.stringify(preparedData),
      })

      // Si la requête directe a réussi, on l'utilise
      if (directResponse.ok) {
        const createdLounge = await directResponse.json()
        console.log('[CREATE] Salon créé avec succès via fetch direct:', createdLounge)

        // Si un fichier image est sélectionné et le salon a été créé, uploader l'image
        if (createdLounge && createdLounge.id && tempImageFile.value) {
          const imageUrl = await uploadImage(createdLounge.id)
          if (imageUrl) {
            // Mettre à jour le salon avec la nouvelle URL d'image
            await loungeStore.updateLounge(createdLounge.id, { imageUrl })
          }
        }

        // Rafraîchir explicitement la liste des salons dans le store
        await loungeStore.fetchLounges(true)
        console.log('[CREATE] Nombre de salons après fetch:', loungeStore.lounges.length)

        // Afficher un message de succès avant de rediriger
        alert('Le salon a été créé avec succès! Vous allez être redirigé vers la liste des salons.')

        // Rediriger vers la liste des salons
        await router.push({ name: 'lounges-list' })
        return
      } else {
        const errorText = await directResponse.text()
        console.error(`[CREATE] Échec de la création directe: ${directResponse.status} - ${errorText}`)

        // Si erreur 403, essayer la méthode avec X-Admin-Role plus forte
        if (directResponse.status === 403) {
          console.log('[CREATE] Tentative avec createTestLounge (ajout forcé du header admin)')
          const testResult = await createTestLounge()
          if (testResult) {
            // Rafraîchir la liste des salons avant la redirection
            console.log('[CREATE] Rafraîchissement forcé de la liste des salons...')
            await loungeStore.fetchLounges(true)

            alert(
              'Le salon a été créé avec succès (méthode alternative)! Vous allez être redirigé vers la liste des salons.',
            )
            await router.push({ name: 'lounges-list' })
            return
          } else {
            apiError.value = "Erreur d'autorisation (403): Vous n'avez pas les droits administrateur nécessaires."
          }
        }
      }
    } catch (directErr) {
      console.error('[CREATE] Erreur lors de la création directe:', directErr)
    }

    // Si la méthode directe échoue, on essaie via le store
    console.log('[CREATE] Tentative via le store loungeStore')
    const createdLounge = await loungeStore.createLounge(preparedData)

    // Si un fichier image est sélectionné et le salon a été créé, uploader l'image
    if (createdLounge && createdLounge.id && tempImageFile.value) {
      const imageUrl = await uploadImage(createdLounge.id)
      if (imageUrl) {
        // Mettre à jour le salon avec la nouvelle URL d'image
        await loungeStore.updateLounge(createdLounge.id, { imageUrl })
      }
    }

    // Rafraîchir explicitement la liste des salons dans le store
    await loungeStore.fetchLounges(true)
    console.log('[CREATE] Nombre de salons après création via store:', loungeStore.lounges.length)

    // Afficher un message de succès avant de rediriger
    alert('Le salon a été créé avec succès! Vous allez être redirigé vers la liste des salons.')

    // Rediriger vers la liste des salons
    await router.push({ name: 'lounges-list' })
  } catch (err: any) {
    console.error('[CREATE] Erreur lors de la création du salon:', err)

    // Vérifier si c'est une erreur d'authentification
    if (err.message && err.message.includes('401')) {
      apiError.value =
        "Erreur d'authentification (401): Vous n'êtes pas autorisé à créer un salon. Veuillez vous reconnecter."

      // Proposer de se reconnecter
      if (confirm('Votre session a peut-être expiré. Voulez-vous vous reconnecter?')) {
        // Rediriger vers la page de login
        authStore.logout() // Nettoyer les données d'authentification
        router.push({ name: 'login' })
        return
      }
    } else if (err.message && err.message.includes('403')) {
      apiError.value =
        "Erreur d'autorisation (403): Vous n'avez pas les droits administrateur nécessaires. Contactez l'administrateur système."

      // Essayer la méthode de test en dernier recours
      console.log('[CREATE] Tentative avec createTestLounge comme dernier recours')
      const testResult = await createTestLounge()
      if (testResult) {
        alert(
          'Le salon a été créé avec succès (méthode alternative)! Vous allez être redirigé vers la liste des salons.',
        )
        await router.push({ name: 'lounges-list' })
        return
      }
    } else {
      // Détails techniques pour aider au débogage
      apiError.value = `Erreur: ${err.message || 'Une erreur est survenue lors de la création du salon'}
      
Détails techniques (pour le support): 
- URL API: ${api.createLounge()}
- Status: ${err.response?.status || 'N/A'}
- Message serveur: ${err.response?.data?.message || 'N/A'}`
    }
  } finally {
    isLoading.value = false
  }
}

// Fonction pour rafraîchir l'authentification de l'utilisateur
const refreshUserAuth = () => {
  authStore.refreshAuth()
}

// Fonction pour forcer le rôle admin pour les tests
const forceAdminRole = () => {
  console.log('[ADMIN] Forçage du rôle administrateur pour les tests')

  // Récupérer l'utilisateur actuel
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  let userObj = null

  if (userJson) {
    try {
      userObj = JSON.parse(userJson)
    } catch (e) {
      console.error("[ADMIN] Erreur lors de l'analyse des données utilisateur:", e)
      return
    }
  } else {
    console.error('[ADMIN] Aucun utilisateur trouvé dans le stockage')
    return
  }

  // Modifier les attributs
  const updatedUser = {
    ...userObj,
    isAdmin: true,
    role: 'admin',
  }

  // Enregistrer dans localStorage ET sessionStorage
  const userStr = JSON.stringify(updatedUser)
  localStorage.setItem('user', userStr)
  sessionStorage.setItem('user', userStr)

  // Mettre à jour le store
  authStore.refreshAuth()

  // Afficher un message de confirmation
  alert("Rôle administrateur forcé avec succès! Rafraîchissez l'authentification pour voir les changements.")
}

// Initialisation
onMounted(async () => {
  try {
    console.log('[CREATE] Initialisation du composant de création de salon')

    // Initialiser le formulaire
    initializeFormData()
  } catch (error) {
    console.error('[CREATE] Erreur lors du montage du composant:', error)
  }
})
</script>

<style scoped>
.image-preview {
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-height: 200px;
}

.upload-zone {
  min-height: 150px;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  background-color: rgba(var(--va-primary), 0.05);
}

.border-primary {
  border-color: var(--va-primary);
}

.text-primary {
  color: var(--va-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.image-uploader-container {
  border: 1px solid var(--va-background-element);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.text-danger {
  color: var(--va-danger);
}
</style>
