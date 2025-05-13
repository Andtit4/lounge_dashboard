<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Sign up</h1>
    <p class="text-base mb-4 leading-5">
      Have an account?
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">Login</RouterLink>
    </p>
    <VaAlert v-if="error" color="danger" class="mb-4" closable>
      {{ error }}
    </VaAlert>
    <div class="row">
      <div class="flex xs12 md6 pr-md-2">
        <VaInput
          v-model="formData.firstName"
          :rules="[(v) => !!v || 'First name is required']"
          class="mb-4"
          label="First Name"
        />
      </div>
      <div class="flex xs12 md6 pl-md-2">
        <VaInput
          v-model="formData.lastName"
          :rules="[(v) => !!v || 'Last name is required']"
          class="mb-4"
          label="Last Name"
        />
      </div>
    </div>
    <VaInput
      v-model="formData.email"
      :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
      class="mb-4"
      label="Email"
      type="email"
    />
    <VaInput v-model="formData.phoneNumber" class="mb-4" label="Phone Number (optional)" />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        ref="password1"
        v-model="formData.password"
        :rules="passwordRules"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
        messages="Password should be 8+ characters: letters, numbers, and special characters."
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
      <VaInput
        ref="password2"
        v-model="formData.repeatPassword"
        :rules="[
          (v) => !!v || 'Repeat Password field is required',
          (v) => v === formData.password || 'Passwords don\'t match',
        ]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Repeat Password"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" :loading="loading" @click="submit">Create account</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import httpService from '../../services/httpService'
import api from '../../services/api'
import type { CreateUserDto } from '../../types'
import { useAuthStore } from '../../stores/auth'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const authStore = useAuthStore()

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  repeatPassword: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  if (validate()) {
    loading.value = true
    error.value = null

    try {
      const userData: CreateUserDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
        role: 'user',
        isAdmin: false,
      }

      // Utiliser l'endpoint d'inscription du backend
      const url = api.signup()
      console.log("URL d'inscription:", url)

      const response = await httpService.post(url, userData)

      if (response.error) {
        if (
          response.error.message.includes('Email already exists') ||
          response.error.message.includes('Conflict') ||
          response.error.message.includes('409')
        ) {
          error.value = 'Cette adresse email est déjà utilisée'
        } else {
          error.value = response.error.message || 'Échec de la création du compte'
        }
      } else if (response.data) {
        handleSuccessfulSignup(response.data)
      }
    } catch (err) {
      if (err instanceof Error) {
        // Vérifier si l'erreur est due à un conflit d'email
        if (err.message.includes('409') || err.message.includes('Conflict')) {
          error.value = 'Cette adresse email est déjà utilisée'
        } else {
          error.value = err.message
        }
      } else {
        error.value = 'Une erreur est survenue lors de la création du compte'
      }
    } finally {
      loading.value = false
    }
  }
}

// Fonction pour gérer l'inscription réussie
const handleSuccessfulSignup = async (userData: any) => {
  init({
    message: 'Votre compte a été créé avec succès',
    color: 'success',
  })

  // Les données d'authentification sont déjà incluses dans la réponse d'inscription
  if (userData.token && userData.user) {
    // Stocker les données de l'utilisateur et le token
    authStore.setUser(userData)

    // Par défaut les utilisateurs sont créés sans abonnement,
    // donc on les redirige vers la page des abonnements
    if (
      userData.user.subscriptionType &&
      userData.user.subscriptionExpiryDate &&
      new Date(userData.user.subscriptionExpiryDate) > new Date()
    ) {
      // Si l'utilisateur a un abonnement actif (cas rare), rediriger vers les salons
      push({ name: 'lounges' })
    } else {
      // Sinon rediriger vers la page de tarification
      push({ name: 'pricing-plans' })
    }
  } else {
    // Si les données d'authentification ne sont pas complètes, rediriger vers la page de connexion
    push({ name: 'login' })
  }
}

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Password field is required',
  (v) => (v && v.length >= 8) || 'Password must be at least 8 characters long',
  (v) => (v && /[A-Za-z]/.test(v)) || 'Password must contain at least one letter',
  (v) => (v && /\d/.test(v)) || 'Password must contain at least one number',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'Password must contain at least one special character',
]
</script>
