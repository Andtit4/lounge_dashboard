<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { IUser } from '../../../services/api/userService'
import { formatDate } from '../../../utils/formatters'

// Définition des props
const props = defineProps({
  user: {
    type: Object as () => IUser,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

// Liste des types d'abonnement disponibles
const subscriptionTypes = [
  { value: 'basic', text: 'Basique' },
  { value: 'premium', text: 'Premium' },
  { value: 'enterprise', text: 'Entreprise' },
]

// Formulaire local
const form = ref({
  subscriptionType: props.user.subscriptionType || '',
  subscriptionStartDate: props.user.subscriptionStartDate ? new Date(props.user.subscriptionStartDate) : new Date(),
  subscriptionExpiryDate: props.user.subscriptionExpiryDate ? new Date(props.user.subscriptionExpiryDate) : new Date(),
  notes: props.user.notes || '',
})

// Durée calculée en jours
const durationDays = computed(() => {
  if (!form.value.subscriptionStartDate || !form.value.subscriptionExpiryDate) {
    return 0
  }

  const start = new Date(form.value.subscriptionStartDate)
  const end = new Date(form.value.subscriptionExpiryDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }

  // Différence en millisecondes
  const diffMs = end.getTime() - start.getTime()
  // Convertir en jours
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
})

// Texte de durée pour l'affichage
const durationText = computed(() => {
  const days = durationDays.value

  if (days <= 0) {
    return 'Date de fin invalide'
  }

  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remainingDays = days % 30

  let text = ''
  if (years > 0) {
    text += `${years} an${years > 1 ? 's' : ''} `
  }
  if (months > 0) {
    text += `${months} mois `
  }
  if (remainingDays > 0) {
    text += `${remainingDays} jour${remainingDays > 1 ? 's' : ''}`
  }

  return text.trim()
})

// Validation du formulaire
const isValid = ref(true)
const errors = ref({
  subscriptionType: '',
  subscriptionStartDate: '',
  subscriptionExpiryDate: '',
})

// Configuration des durées prédéfinies
const durations = [
  { label: '1 mois', value: 1 },
  { label: '3 mois', value: 3 },
  { label: '6 mois', value: 6 },
  { label: '1 an', value: 12 },
]

// Appliquer une durée prédéfinie
const applyDuration = (months: number) => {
  const startDate = form.value.subscriptionStartDate || new Date()
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)

  form.value.subscriptionExpiryDate = endDate
}

// Valider le formulaire
const validateForm = () => {
  let valid = true
  errors.value = {
    subscriptionType: '',
    subscriptionStartDate: '',
    subscriptionExpiryDate: '',
  }

  if (!form.value.subscriptionType) {
    errors.value.subscriptionType = "Le type d'abonnement est requis"
    valid = false
  }

  if (!form.value.subscriptionStartDate) {
    errors.value.subscriptionStartDate = 'La date de début est requise'
    valid = false
  }

  if (!form.value.subscriptionExpiryDate) {
    errors.value.subscriptionExpiryDate = 'La date de fin est requise'
    valid = false
  } else if (
    form.value.subscriptionExpiryDate &&
    form.value.subscriptionStartDate &&
    form.value.subscriptionExpiryDate <= form.value.subscriptionStartDate
  ) {
    errors.value.subscriptionExpiryDate = 'La date de fin doit être postérieure à la date de début'
    valid = false
  }

  isValid.value = valid
  return valid
}

// Titre du formulaire
const formTitle = computed(() => {
  return props.isEditing
    ? `Modifier l'abonnement de ${props.user.firstName} ${props.user.lastName}`
    : `Créer un abonnement pour ${props.user.firstName} ${props.user.lastName}`
})

// Événements
const emit = defineEmits(['save', 'cancel'])

// Soumettre le formulaire
const submitForm = () => {
  if (validateForm()) {
    // Créer un objet de mise à jour à envoyer au parent
    const subscriptionData = {
      subscriptionType: form.value.subscriptionType,
      subscriptionStartDate: form.value.subscriptionStartDate.toISOString(),
      subscriptionExpiryDate: form.value.subscriptionExpiryDate.toISOString(),
      notes: form.value.notes,
    }

    emit('save', subscriptionData)
  }
}

// Annuler
const cancelForm = () => {
  emit('cancel')
}

// Surveiller les changements de dates pour valider en temps réel
watch([() => form.value.subscriptionStartDate, () => form.value.subscriptionExpiryDate], () => {
  validateForm()
})

// Initialiser le formulaire au montage
onMounted(() => {
  // Si c'est un nouvel abonnement, définir la date de début à aujourd'hui
  // et la date de fin à 1 mois plus tard par défaut
  if (!props.isEditing || !props.user.subscriptionStartDate) {
    form.value.subscriptionStartDate = new Date()

    if (!props.user.subscriptionExpiryDate) {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      form.value.subscriptionExpiryDate = endDate
    }
  }

  // Valider les données initiales
  validateForm()

  console.log('SubscriptionForm - Form initialisé:', form.value)
})
</script>

<template>
  <div class="subscription-form">
    <h3 class="form-title">{{ formTitle }}</h3>

    <div class="form-content">
      <!-- Type d'abonnement -->
      <div class="form-group">
        <label class="form-label">Type d'abonnement <span class="required">*</span></label>
        <VaSelect
          v-model="form.subscriptionType"
          :options="subscriptionTypes"
          :error="!!errors.subscriptionType"
          :error-messages="errors.subscriptionType"
          class="form-control"
          placeholder="Sélectionnez un type d'abonnement"
        />
      </div>

      <!-- Période d'abonnement -->
      <div class="form-row">
        <div class="form-group form-group-half">
          <label class="form-label">Date de début <span class="required">*</span></label>
          <VaDateInput
            v-model="form.subscriptionStartDate"
            :error="!!errors.subscriptionStartDate"
            :error-messages="errors.subscriptionStartDate"
            class="form-control"
          />
        </div>

        <div class="form-group form-group-half">
          <label class="form-label">Date d'expiration <span class="required">*</span></label>
          <VaDateInput
            v-model="form.subscriptionExpiryDate"
            :error="!!errors.subscriptionExpiryDate"
            :error-messages="errors.subscriptionExpiryDate"
            class="form-control"
          />
        </div>
      </div>

      <!-- Durée calculée -->
      <div class="duration-info" :class="{ 'duration-error': durationDays <= 0 }">
        <VaIcon name="schedule" />
        <span v-if="durationDays > 0">
          Durée: <strong>{{ durationText }}</strong> ({{ durationDays }} jours)
        </span>
        <span v-else class="error-text">
          {{ errors.subscriptionExpiryDate || 'La date de fin doit être postérieure à la date de début' }}
        </span>
      </div>

      <!-- Raccourcis pour la durée -->
      <div class="form-group">
        <label class="form-label">Appliquer une durée prédéfinie</label>
        <div class="duration-buttons">
          <VaButton
            v-for="duration in durations"
            :key="duration.value"
            size="small"
            preset="secondary"
            class="duration-button"
            @click="applyDuration(duration.value)"
          >
            {{ duration.label }}
          </VaButton>
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">Notes</label>
        <VaTextarea
          v-model="form.notes"
          class="form-control"
          placeholder="Informations supplémentaires sur cet abonnement"
          rows="3"
        />
      </div>
    </div>

    <!-- Actions du formulaire -->
    <div class="form-actions">
      <VaButton preset="secondary" @click="cancelForm"> Annuler </VaButton>

      <VaButton preset="primary" :disabled="!isValid" @click="submitForm">
        {{ props.isEditing ? 'Mettre à jour' : "Créer l'abonnement" }}
      </VaButton>
    </div>
  </div>
</template>

<style scoped>
.subscription-form {
  padding: 1rem;
}

.form-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--va-primary);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group-half {
  flex: 1;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.required {
  color: var(--va-danger);
}

.form-control {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-border);
}

.duration-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.duration-button {
  flex: 0 0 auto;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  color: #0d47a1;
}

.duration-error {
  background-color: #ffebee;
  color: #d32f2f;
}

.error-text {
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }
}
</style>
