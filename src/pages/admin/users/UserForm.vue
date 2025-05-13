<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import type { IUser, ICreateUserDto, IUpdateUserDto } from '../../../services/api/userService'

const props = defineProps<{
  user?: IUser | null
  isEditing: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

// Type pour les règles de validation
interface ValidationRules {
  firstName: { required: any }
  lastName: { required: any }
  email: { required: any; email: any }
  phoneNumber: Record<string, any>
  password?: { required: any; minLength: any }
}

// Formulaire réactif
const form = reactive<{
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  isAdmin: boolean
  subscriptionType: string | null
  subscriptionExpiryDate: Date | null
}>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  isAdmin: false,
  subscriptionType: null,
  subscriptionExpiryDate: null,
})

// Variables d'état
const isSubmitting = ref(false)
const passwordVisible = ref(false)
const hasPasswordChanged = ref(false)

// Les règles de validation changent selon qu'on est en mode édition ou création
const rules = computed(() => {
  const baseRules: ValidationRules = {
    firstName: { required: helpers.withMessage('Le prénom est requis', required) },
    lastName: { required: helpers.withMessage('Le nom est requis', required) },
    email: {
      required: helpers.withMessage("L'email est requis", required),
      email: helpers.withMessage('Veuillez entrer un email valide', email),
    },
    phoneNumber: {},
  }

  // Le mot de passe est obligatoire uniquement lors de la création d'un utilisateur
  if (!props.isEditing || hasPasswordChanged.value) {
    baseRules.password = {
      required: helpers.withMessage('Le mot de passe est requis', required),
      minLength: helpers.withMessage('Le mot de passe doit contenir au moins 6 caractères', minLength(6)),
    }
  }

  return baseRules
})

const v$ = useVuelidate(rules, form)

// Initialiser le formulaire avec les données de l'utilisateur si on est en mode édition
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.firstName = newUser.firstName
      form.lastName = newUser.lastName
      form.email = newUser.email
      form.password = ''
      form.phoneNumber = newUser.phoneNumber || ''
      form.isAdmin = newUser.isAdmin
      form.subscriptionType = newUser.subscriptionType || null
      form.subscriptionExpiryDate = newUser.subscriptionExpiryDate || null

      // Réinitialiser l'état du mot de passe
      hasPasswordChanged.value = false
    } else {
      // Réinitialiser le formulaire
      Object.assign(form, {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        isAdmin: false,
        subscriptionType: null,
        subscriptionExpiryDate: null,
      })
      hasPasswordChanged.value = true
    }
  },
  { immediate: true },
)

// Détecter les changements de mot de passe
const onPasswordInput = () => {
  hasPasswordChanged.value = true
}

// Types d'abonnement disponibles
const subscriptionTypes = [
  { value: null, text: 'Aucun' },
  { value: 'basic', text: 'Basic' },
  { value: 'premium', text: 'Premium' },
  { value: 'enterprise', text: 'Enterprise' },
]

// Gérer la soumission du formulaire
const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    const isValid = await v$.value.$validate()

    if (!isValid) {
      return
    }

    // Extraction des valeurs pour éviter d'envoyer des objets complets
    let userData: ICreateUserDto | IUpdateUserDto

    if (props.isEditing) {
      // Pour la mise à jour, on n'inclut que les champs modifiés
      userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        // Envoyer uniquement la valeur du type d'abonnement, pas l'objet complet
        subscriptionType: form.subscriptionType,
        subscriptionExpiryDate: form.subscriptionExpiryDate,
      }

      // N'inclure le mot de passe que s'il a été modifié
      if (hasPasswordChanged.value && form.password) {
        userData.password = form.password
      }
    } else {
      // Pour la création, on inclut tous les champs
      userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
        // Envoyer uniquement la valeur du type d'abonnement, pas l'objet complet
        subscriptionType: form.subscriptionType,
        subscriptionExpiryDate: form.subscriptionExpiryDate,
      }
    }

    emit('save', userData)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="user-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <VaInput
        v-model="form.firstName"
        :error="v$.firstName.$error"
        error-messages=""
        :error-message="v$.firstName.$error ? v$.firstName.$errors[0].$message : ''"
        label="Prénom"
        :disabled="isSubmitting"
        @blur="v$.firstName.$touch()"
      />

      <VaInput
        v-model="form.lastName"
        :error="v$.lastName.$error"
        error-messages=""
        :error-message="v$.lastName.$error ? v$.lastName.$errors[0].$message : ''"
        label="Nom"
        :disabled="isSubmitting"
        @blur="v$.lastName.$touch()"
      />
    </div>

    <VaInput
      v-model="form.email"
      :error="v$.email.$error"
      error-messages=""
      :error-message="v$.email.$error ? v$.email.$errors[0].$message : ''"
      label="Email"
      type="email"
      :disabled="isSubmitting"
      @blur="v$.email.$touch()"
    />

    <VaInput
      v-model="form.password"
      :error="v$.password && v$.password.$error"
      error-messages=""
      :error-message="v$.password && v$.password.$error ? v$.password.$errors[0].$message : ''"
      :label="isEditing ? 'Nouveau mot de passe' : 'Mot de passe'"
      :placeholder="isEditing ? 'Laisser vide pour ne pas modifier' : ''"
      :type="passwordVisible ? 'text' : 'password'"
      :disabled="isSubmitting"
      @input="onPasswordInput"
      @blur="hasPasswordChanged && v$.password && v$.password.$touch()"
    >
      <template #appendInner>
        <VaButton preset="plain" size="small" @click="passwordVisible = !passwordVisible">
          <VaIcon :name="passwordVisible ? 'visibility_off' : 'visibility'" />
        </VaButton>
      </template>
    </VaInput>

    <VaInput v-model="form.phoneNumber" label="Téléphone" type="tel" :disabled="isSubmitting" />

    <VaCheckbox v-model="form.isAdmin" label="Administrateur" :disabled="isSubmitting" />

    <div class="form-row">
      <VaSelect
        v-model="form.subscriptionType"
        label="Type d'abonnement"
        :options="subscriptionTypes"
        :disabled="isSubmitting"
      />

      <VaDateInput
        v-model="form.subscriptionExpiryDate"
        label="Date d'expiration de l'abonnement"
        :disabled="!form.subscriptionType || isSubmitting"
      />
    </div>

    <div class="form-actions">
      <VaButton preset="secondary" :disabled="isSubmitting" @click="emit('cancel')"> Annuler </VaButton>

      <VaButton type="submit" preset="primary" :loading="isSubmitting">
        {{ isEditing ? 'Mettre à jour' : 'Créer' }}
      </VaButton>
    </div>
  </form>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
