<template>
  <div class="lounge-image-uploader">
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
                Glissez-déposez une image ici ou <span class="text-primary font-bold">cliquez pour parcourir</span>
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

        <!-- Aperçu de l'image actuelle ou sélectionnée -->
        <div class="image-preview-container mb-4">
          <div
            v-if="currentImageUrl || tempImagePreview"
            class="image-preview rounded-lg overflow-hidden border border-gray-200"
          >
            <img
              :src="tempImagePreview || currentImageUrl"
              alt="Aperçu de l'image"
              class="w-full h-auto"
              @error="handleImageLoadError"
            />

            <div class="mt-3 flex">
              <VaButton size="small" color="danger" class="mr-2" @click="handleRemoveImage">
                <i class="va-icon material-icons mr-1">delete</i>
                Supprimer
              </VaButton>
              <VaButton v-if="tempImageFile" size="small" color="secondary" @click="triggerFileInput">
                <i class="va-icon material-icons mr-1">change_circle</i>
                Changer
              </VaButton>
              <VaButton v-if="tempImageFile" size="small" color="primary" :loading="isUploading" @click="handleUpload">
                <i class="va-icon material-icons mr-1">upload</i>
                Enregistrer
              </VaButton>
            </div>

            <p v-if="tempImageFile" class="text-xs text-gray-500 mt-2">
              <i class="va-icon material-icons text-xs align-middle">check_circle</i>
              Image sélectionnée: {{ tempImageFile.name }} ({{ formatFileSize(tempImageFile.size) }})
            </p>
          </div>
          <div v-else class="no-image-placeholder py-4 text-center text-gray-500">
            <i class="va-icon material-icons text-2xl mb-2">image_not_supported</i>
            <p>Aucune image n'est actuellement définie</p>
          </div>
        </div>
      </div>

      <!-- Section URL manuelle -->
      <div class="flex-1">
        <div class="text-center my-3 md:hidden">
          <div class="relative">
            <hr class="border-t border-gray-300" />
            <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">OU</span>
          </div>
        </div>

        <div class="hidden md:flex items-center justify-center h-full mx-4">
          <div class="h-32 border-r border-gray-300 mx-4"></div>
          <span class="bg-white px-3 text-gray-500">OU</span>
        </div>

        <div class="url-input-container">
          <h4 class="text-lg font-medium mb-3">URL de l'image</h4>
          <VaInput
            v-model="urlInput"
            class="mb-3"
            :error="!!error"
            :error-messages="error"
            placeholder="https://example.com/image.jpg"
            :disabled="!!tempImageFile"
          >
            <template #prepend>
              <i class="va-icon material-icons">link</i>
            </template>
            <template v-if="urlInput" #append>
              <i class="va-icon material-icons cursor-pointer" @click="urlInput = ''">clear</i>
            </template>
          </VaInput>

          <VaButton
            v-if="urlInput && urlInput !== currentImageUrl"
            size="small"
            color="primary"
            :loading="isUpdating"
            @click="updateImageUrl"
          >
            Mettre à jour l'URL
          </VaButton>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="success-message mt-3 p-3 bg-success-lightest text-success rounded">
      <i class="va-icon material-icons mr-1">check_circle</i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../services/api'
import httpService from '../../services/httpService'

const props = defineProps<{
  loungeId?: string
  initialImageUrl?: string
}>()

const emit = defineEmits<{
  'update:image-url': [url: string]
  'upload-success': [response: any]
  'upload-error': [error: any]
}>()

const currentImageUrl = ref(props.initialImageUrl || '')
const urlInput = ref(props.initialImageUrl || '')
const tempImageFile = ref<File | null>(null)
const tempImagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const isUpdating = ref(false)
const error = ref('')
const successMessage = ref('')

// Surveillance des changements de l'URL initiale
watch(
  () => props.initialImageUrl,
  (newValue) => {
    if (newValue && newValue !== currentImageUrl.value) {
      currentImageUrl.value = newValue
      if (!tempImageFile.value) {
        urlInput.value = newValue
      }
    }
  },
)

// Timer pour effacer le message de succès
let successTimer: ReturnType<typeof setTimeout> | null = null

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
    error.value = 'Format invalide. Veuillez sélectionner une image (PNG, JPG ou GIF).'
    return
  }

  // Vérification de la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = "L'image est trop volumineuse. Taille maximale: 5MB."
    return
  }

  // Réinitialiser les erreurs
  error.value = ''
  successMessage.value = ''

  // Enregistrer le fichier temporairement
  tempImageFile.value = file

  // Créer une prévisualisation
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Formater la taille du fichier
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Gestion des erreurs de chargement d'image
const handleImageLoadError = () => {
  if (currentImageUrl.value) {
    error.value = "Impossible de charger l'image actuelle. L'URL peut être invalide."
  }
}

// Supprimer l'image
const handleRemoveImage = () => {
  if (tempImageFile.value) {
    // Si une image temporaire est sélectionnée, la supprimer
    tempImageFile.value = null
    tempImagePreview.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } else {
    // Supprimer l'URL d'image actuelle
    updateImageUrl('')
  }
}

// Upload de l'image sur le serveur
const handleUpload = async () => {
  if (!tempImageFile.value) return

  isUploading.value = true
  error.value = ''
  successMessage.value = ''

  // Vérifier que le fichier est toujours valide
  if (!tempImageFile.value.name || !tempImageFile.value.size) {
    error.value = 'Le fichier semble corrompu. Veuillez sélectionner un autre fichier.'
    isUploading.value = false
    return
  }

  // Vérifier que l'ID du salon est valide
  if (!props.loungeId) {
    error.value = "ID du salon manquant. Impossible d'uploader l'image."
    console.error('[UPLOAD] Erreur: ID du salon manquant', props.loungeId)
    isUploading.value = false
    return
  }

  console.log("[UPLOAD] Début de l'upload pour le salon ID:", props.loungeId)
  console.log('[UPLOAD] Fichier:', tempImageFile.value.name, '(', tempImageFile.value.size, 'bytes )')

  const formData = new FormData()
  formData.append('file', tempImageFile.value)

  // Vérifier que le formulaire contient bien le fichier
  if (formData.get('file') === null) {
    error.value = 'Erreur lors de la préparation du fichier.'
    console.error("[UPLOAD] Le fichier n'a pas été ajouté au FormData")
    isUploading.value = false
    return
  }

  try {
    console.log("[UPLOAD] URL de l'API:", api.uploadLoungeImage(props.loungeId))

    // Utiliser httpService.uploadFile qui utilise l'instance axios avec les intercepteurs
    const response = await httpService.uploadFile(api.uploadLoungeImage(props.loungeId), formData)

    // Vérifier si la requête a réussi
    if (response.error) {
      throw new Error(response.error.message || "Erreur lors de l'upload de l'image")
    }

    // Vérifier que l'URL est bien présente dans la réponse
    if (!response.data?.url) {
      console.error('[UPLOAD] URL manquante dans la réponse:', response.data)
      throw new Error("URL de l'image manquante dans la réponse du serveur")
    }

    console.log('[UPLOAD] Réponse succès:', response.data)

    // Log details of the response
    console.log('[IMAGE UPLOADER] Réponse du serveur:', response)

    if (response.data && response.data.url) {
      // S'assurer que l'URL est complète avant de l'émettre
      let imageUrl = response.data.url

      // Corriger l'URL si elle est relative
      if (!imageUrl.startsWith('http')) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6610'

        if (imageUrl.startsWith('/')) {
          imageUrl = `${apiBaseUrl}${imageUrl}`
        } else {
          imageUrl = `${apiBaseUrl}/${imageUrl}`
        }

        console.log('[IMAGE UPLOADER] URL corrigée:', imageUrl)
      }

      // Mettre à jour les variables locales
      currentImageUrl.value = imageUrl
      tempImageFile.value = null
      tempImagePreview.value = null
      urlInput.value = imageUrl

      isUploading.value = false
      successMessage.value = 'Image uploadée avec succès'
      error.value = ''

      // Émettre l'URL complète
      emit('update:image-url', imageUrl)
      emit('upload-success', response.data)

      return imageUrl
    } else {
      throw new Error('Données de réponse incomplètes ou invalides')
    }
  } catch (err: any) {
    console.error("Erreur lors de l'upload de l'image:", err)
    console.error('Détails:', err.response || err.message)

    if (err.response?.status === 403 || (typeof err.message === 'string' && err.message.includes('403'))) {
      error.value = "Erreur d'autorisation: Vous n'avez pas les droits administrateur nécessaires."
    } else {
      error.value = err.response?.data?.message || err.message || "Erreur lors de l'upload de l'image"
    }

    emit('upload-error', err)
  } finally {
    isUploading.value = false
  }
}

// Mettre à jour l'URL de l'image
const updateImageUrl = async (newUrl?: string) => {
  const url = newUrl !== undefined ? newUrl : urlInput.value

  isUpdating.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (url !== currentImageUrl.value) {
      currentImageUrl.value = url
      urlInput.value = url
      emit('update:image-url', url)

      if (url) {
        showSuccessMessage("L'URL de l'image a été mise à jour!")
      } else {
        showSuccessMessage("L'image a été supprimée!")
      }
    }
  } catch (err: any) {
    console.error("Erreur lors de la mise à jour de l'URL:", err)
    error.value = err.message || "Erreur lors de la mise à jour de l'URL"
  } finally {
    isUpdating.value = false
  }
}

// Afficher un message de succès temporaire
const showSuccessMessage = (message: string) => {
  successMessage.value = message

  // Effacer le message après 3 secondes
  if (successTimer) {
    clearTimeout(successTimer)
  }

  successTimer = setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Nettoyer à la destruction du composant
onMounted(() => {
  return () => {
    if (successTimer) {
      clearTimeout(successTimer)
    }
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

.bg-success-lightest {
  background-color: rgba(var(--va-success), 0.1);
}

.text-success {
  color: var(--va-success);
}

.no-image-placeholder {
  border: 1px dashed var(--va-gray);
  border-radius: 8px;
}
</style>
