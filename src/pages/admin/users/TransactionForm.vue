<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { IUser } from '../../../services/api/userService'

// Définir l'interface pour les transactions d'abonnement
interface ISubscriptionTransaction {
  id: string
  userId: string
  subscriptionType: string
  amount: number
  paymentMethod: string
  transactionDate: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

// Props
const props = defineProps({
  user: {
    type: Object as () => IUser,
    required: true,
  },
  transaction: {
    type: Object as () => ISubscriptionTransaction,
    default: null,
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

// Liste des méthodes de paiement
const paymentMethods = [
  { value: 'card', text: 'Carte bancaire' },
  { value: 'transfer', text: 'Virement bancaire' },
  { value: 'cash', text: 'Espèces' },
  { value: 'check', text: 'Chèque' },
]

// Liste des statuts de transaction
const transactionStatuses = [
  { value: 'completed', text: 'Payé' },
  { value: 'pending', text: 'En attente' },
  { value: 'failed', text: 'Échoué' },
  { value: 'refunded', text: 'Remboursé' },
]

// Prix suggérés par type d'abonnement (en euros)
const suggestedPrices: Record<string, number> = {
  basic: 29.99,
  premium: 59.99,
  enterprise: 99.99,
}

// Formulaire
const form = ref({
  userId: props.user.id,
  subscriptionType:
    props.isEditing && props.transaction ? props.transaction.subscriptionType : props.user.subscriptionType || 'basic',
  amount: props.isEditing && props.transaction ? props.transaction.amount : suggestedPrices['basic'],
  paymentMethod: props.isEditing && props.transaction ? props.transaction.paymentMethod : 'card',
  transactionDate: props.isEditing && props.transaction ? new Date(props.transaction.transactionDate) : new Date(),
  startDate:
    props.isEditing && props.transaction
      ? new Date(props.transaction.startDate)
      : props.user.subscriptionStartDate
        ? new Date(props.user.subscriptionStartDate)
        : new Date(),
  endDate:
    props.isEditing && props.transaction
      ? new Date(props.transaction.endDate)
      : props.user.subscriptionExpiryDate
        ? new Date(props.user.subscriptionExpiryDate)
        : getDefaultEndDate(),
  status: props.isEditing && props.transaction ? props.transaction.status : 'completed',
  notes: props.isEditing && props.transaction ? props.transaction.notes || '' : '',
})

// Erreurs de validation
const errors = ref({
  subscriptionType: '',
  amount: '',
  paymentMethod: '',
  transactionDate: '',
  startDate: '',
  endDate: '',
  status: '',
})

// Options pour les durées prédéfinies
const durations = [
  { label: '1 mois', value: 1 },
  { label: '3 mois', value: 3 },
  { label: '6 mois', value: 6 },
  { label: '1 an', value: 12 },
]

// Title du formulaire
const formTitle = computed(() => {
  return props.isEditing ? 'Modifier la transaction' : 'Ajouter une nouvelle transaction'
})

// Méthodes
function getDefaultEndDate() {
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  return endDate
}

// Mettre à jour le montant suggéré quand le type d'abonnement change
function updateSuggestedAmount() {
  const type = form.value.subscriptionType
  if (type && type in suggestedPrices) {
    form.value.amount = suggestedPrices[type]
  }
}

// Appliquer une durée prédéfinie
function applyDuration(months: number) {
  const startDate = form.value.startDate || new Date()
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)
  form.value.endDate = endDate
}

// Calculer la durée en jours
const durationDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate) {
    return 0
  }

  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)

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

// Valider le formulaire
function validateForm() {
  let isValid = true
  errors.value = {
    subscriptionType: '',
    amount: '',
    paymentMethod: '',
    transactionDate: '',
    startDate: '',
    endDate: '',
    status: '',
  }

  if (!form.value.subscriptionType) {
    errors.value.subscriptionType = "Le type d'abonnement est requis"
    isValid = false
  }

  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount = 'Un montant valide est requis'
    isValid = false
  }

  if (!form.value.paymentMethod) {
    errors.value.paymentMethod = 'La méthode de paiement est requise'
    isValid = false
  }

  if (!form.value.transactionDate) {
    errors.value.transactionDate = 'La date de transaction est requise'
    isValid = false
  }

  if (!form.value.startDate) {
    errors.value.startDate = 'La date de début est requise'
    isValid = false
  }

  if (!form.value.endDate) {
    errors.value.endDate = 'La date de fin est requise'
    isValid = false
  } else if (form.value.endDate <= form.value.startDate) {
    errors.value.endDate = 'La date de fin doit être postérieure à la date de début'
    isValid = false
  }

  if (!form.value.status) {
    errors.value.status = 'Le statut de paiement est requis'
    isValid = false
  }

  return isValid
}

// Événements
const emit = defineEmits(['save', 'cancel'])

// Soumettre le formulaire
function submitForm() {
  if (validateForm()) {
    const transactionData = {
      userId: form.value.userId,
      subscriptionType: form.value.subscriptionType,
      amount: form.value.amount,
      paymentMethod: form.value.paymentMethod,
      transactionDate: form.value.transactionDate.toISOString(),
      startDate: form.value.startDate.toISOString(),
      endDate: form.value.endDate.toISOString(),
      status: form.value.status,
      notes: form.value.notes,
    }

    emit('save', transactionData)
  }
}

// Annuler
function cancelForm() {
  emit('cancel')
}

// Initialisation
onMounted(() => {
  if (!props.isEditing) {
    updateSuggestedAmount()
  }
})
</script>

<template>
  <div class="transaction-form">
    <h3 class="form-title">{{ formTitle }}</h3>

    <div class="form-content">
      <!-- Première ligne: Type d'abonnement et Montant -->
      <div class="form-row">
        <div class="form-group form-group-half">
          <label class="form-label">Type d'abonnement <span class="required">*</span></label>
          <VaSelect
            v-model="form.subscriptionType"
            :options="subscriptionTypes"
            :error="!!errors.subscriptionType"
            :error-messages="errors.subscriptionType"
            class="form-control"
            @update:modelValue="updateSuggestedAmount"
          />
        </div>

        <div class="form-group form-group-half">
          <label class="form-label">Montant (€) <span class="required">*</span></label>
          <VaInput
            v-model="form.amount"
            type="number"
            :error="!!errors.amount"
            :error-messages="errors.amount"
            class="form-control"
          />
        </div>
      </div>

      <!-- Deuxième ligne: Date de transaction et Statut de paiement -->
      <div class="form-row">
        <div class="form-group form-group-half">
          <label class="form-label">Date de transaction <span class="required">*</span></label>
          <VaDateInput
            v-model="form.transactionDate"
            :error="!!errors.transactionDate"
            :error-messages="errors.transactionDate"
            class="form-control"
          />
        </div>

        <div class="form-group form-group-half">
          <label class="form-label">Statut du paiement <span class="required">*</span></label>
          <VaSelect
            v-model="form.status"
            :options="transactionStatuses"
            :error="!!errors.status"
            :error-messages="errors.status"
            class="form-control"
          />
        </div>
      </div>

      <!-- Troisième ligne: Méthode de paiement -->
      <div class="form-group">
        <label class="form-label">Méthode de paiement <span class="required">*</span></label>
        <VaSelect
          v-model="form.paymentMethod"
          :options="paymentMethods"
          :error="!!errors.paymentMethod"
          :error-messages="errors.paymentMethod"
          class="form-control"
        />
      </div>

      <!-- Quatrième ligne: Date de début et Date de fin -->
      <div class="form-row">
        <div class="form-group form-group-half">
          <label class="form-label">Date de début <span class="required">*</span></label>
          <VaDateInput
            v-model="form.startDate"
            :error="!!errors.startDate"
            :error-messages="errors.startDate"
            class="form-control"
          />
        </div>

        <div class="form-group form-group-half">
          <label class="form-label">Date de fin <span class="required">*</span></label>
          <VaDateInput
            v-model="form.endDate"
            :error="!!errors.endDate"
            :error-messages="errors.endDate"
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
          {{ errors.endDate || 'La date de fin doit être postérieure à la date de début' }}
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
          rows="3"
          placeholder="Informations supplémentaires sur cette transaction"
          class="form-control"
        />
      </div>
    </div>

    <!-- Actions du formulaire -->
    <div class="form-actions">
      <VaButton preset="secondary" @click="cancelForm"> Annuler </VaButton>

      <VaButton preset="primary" @click="submitForm">
        {{ props.isEditing ? 'Mettre à jour' : 'Enregistrer' }}
      </VaButton>
    </div>
  </div>
</template>

<style scoped>
.transaction-form {
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

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.duration-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.duration-button {
  flex: 0 0 auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--va-border);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }
}
</style>
