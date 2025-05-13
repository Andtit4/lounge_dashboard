<template>
  <div class="lounges-create">
    <VaCard class="mb-4">
      <VaCardTitle>Ajouter un nouveau salon VIP</VaCardTitle>
      <VaCardContent>
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
              <VaInput
                v-model="formData.country"
                label="Pays"
                class="mb-4"
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
              <VaInput
                v-model="formData.imageUrl"
                label="URL de l'image"
                class="mb-4"
                :error="!!errors.imageUrl"
                :error-messages="errors.imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="flex xs12">
              <div v-if="formData.imageUrl" class="image-preview mb-4">
                <img :src="formData.imageUrl" alt="Aperçu du salon" />
              </div>
            </div>
          </div>

          <div v-if="error" class="mb-4">
            <VaAlert color="danger" closable>{{ error }}</VaAlert>
          </div>

          <div class="form-actions">
            <VaButton type="button" class="mr-4" :to="{ name: 'lounges-list' }">Annuler</VaButton>
            <VaButton type="submit" color="primary" :loading="loading">Enregistrer</VaButton>
          </div>
        </form>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { /* ref,  */ reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLoungeStore } from '../../../stores/lounge'
import type { CreateLoungeDto } from '../../../types'

const router = useRouter()
const loungeStore = useLoungeStore()
const { loading, error } = loungeStore

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

  if (formData.price <= 0) {
    errors.price = 'Le prix doit être supérieur à 0'
    isValid = false
  }

  if (formData.classicDiscountPrice <= 0) {
    errors.classicDiscountPrice = 'Le prix Classic doit être supérieur à 0'
    isValid = false
  }

  if (formData.premiumDiscountPrice <= 0) {
    errors.premiumDiscountPrice = 'Le prix Premium doit être supérieur à 0'
    isValid = false
  }

  // Vérifier la cohérence des prix
  if (formData.premiumDiscountPrice >= formData.classicDiscountPrice) {
    errors.premiumDiscountPrice = 'Le prix Premium doit être inférieur au prix Classic'
    isValid = false
  }

  if (formData.classicDiscountPrice >= formData.price) {
    errors.classicDiscountPrice = 'Le prix Classic doit être inférieur au prix standard'
    isValid = false
  }

  return isValid
}

// Soumission du formulaire
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  const newLounge = await loungeStore.createLounge(formData)

  if (newLounge) {
    router.push({ name: 'lounges-list' })
  }
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
