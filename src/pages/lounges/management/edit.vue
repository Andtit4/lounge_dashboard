<template>
  <div class="lounges-edit">
    <VaCard class="mb-4">
      <VaCardTitle>Modifier le salon VIP</VaCardTitle>
      <VaCardContent>
        <div v-if="isLoading" class="text-center py-6">
          <VaProgressCircle indeterminate />
        </div>

        <form v-else @submit.prevent="submitForm">
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
          </div>

          <div v-if="error" class="mb-4">
            <VaAlert color="danger" closable>{{ error }}</VaAlert>
          </div>

          <div class="form-actions mb-4">
            <VaButton type="button" class="mr-4" :to="{ name: 'lounges-list' }">Annuler</VaButton>
            <VaButton type="submit" color="primary" :loading="isSaving">Enregistrer</VaButton>
          </div>
        </form>
      </VaCardContent>
    </VaCard>

    <VaCard class="mb-4">
      <VaCardTitle>Image du salon</VaCardTitle>
      <VaCardContent>
        <div v-if="isLoading" class="text-center py-6">
          <VaProgressCircle indeterminate />
        </div>
        <LoungeImageUploader
          v-else
          :lounge-id="loungeId"
          :initial-image-url="formData.imageUrl"
          @update:imageUrl="
            formData.imageUrl = $event
            updateLoungeImage($event)
          "
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLoungeStore } from '../../../stores/lounge'
import type { UpdateLoungeDto } from '../../../types'
import LoungeImageUploader from '../../../components/lounges/LoungeImageUploader.vue'
import countriesList from '../../../data/CountriesList'

const router = useRouter()
const route = useRoute()
const loungeStore = useLoungeStore()
const { error } = loungeStore

const loungeId = ref(route.params.id as string)
const isLoading = ref(true)
const isSaving = ref(false)

// Formulaire
const formData = reactive<UpdateLoungeDto>({
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

// Charger les données du salon
const loadLoungeData = async () => {
  isLoading.value = true
  try {
    await loungeStore.fetchLoungeById(loungeId.value)
    const lounge = loungeStore.currentLounge
    if (lounge) {
      Object.keys(formData).forEach((key) => {
        if (key in lounge) {
          formData[key as keyof UpdateLoungeDto] = lounge[key as keyof typeof lounge]
        }
      })
    }
  } catch (err) {
    console.error('Erreur lors du chargement du salon:', err)
  } finally {
    isLoading.value = false
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

  return isValid
}

// Soumission du formulaire
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSaving.value = true
  try {
    await loungeStore.updateLounge(loungeId.value, formData)
    router.push({ name: 'lounges-list' })
  } catch (err) {
    console.error('Erreur lors de la mise à jour du salon:', err)
  } finally {
    isSaving.value = false
  }
}

// Mise à jour uniquement de l'image du salon
const updateLoungeImage = async (imageUrl: string) => {
  try {
    await loungeStore.updateLounge(loungeId.value, { imageUrl })
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'image:", err)
  }
}

// Gestion des événements d'upload
const handleUploadSuccess = (response: any) => {
  console.log('Upload réussi:', response)
}

const handleUploadError = (error: any) => {
  console.error("Erreur d'upload:", error)
}

onMounted(() => {
  loadLoungeData()
})
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
