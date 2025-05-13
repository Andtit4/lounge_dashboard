<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Log in</h1>
    <p class="text-base mb-4 leading-5">
      New to Vuestic?
      <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary">Sign up</RouterLink>
    </p>
    <VaAlert v-if="error" color="danger" class="mb-4" closable>
      {{ error }}
    </VaAlert>
    <VaInput
      v-model="formData.email"
      :rules="[validators.required, validators.email]"
      class="mb-4"
      label="Email"
      type="email"
    />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="formData.password"
        :rules="[validators.required]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
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

    <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <VaCheckbox v-model="formData.keepLoggedIn" class="mb-2 sm:mb-0" label="Keep me signed in on this device" />
      <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
        Forgot password?
      </RouterLink>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" :loading="loading" @click="submit">Login</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import httpService from '../../services/httpService'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const { validate } = useForm('form')
const { push } = useRouter()
const route = useRoute()
const { init } = useToast()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  if (validate()) {
    loading.value = true
    error.value = null

    try {
      const response = await httpService.post(api.login(), {
        email: formData.email,
        password: formData.password,
      })

      if (response.error) {
        error.value = response.error.message || 'Échec de la connexion'
      } else if (response.data) {
        const userData = response.data

        // Stocker les données de l'utilisateur dans le store d'authentification
        authStore.setUser(userData)

        // Si "Rester connecté" est coché, stocker dans localStorage
        if (formData.keepLoggedIn) {
          localStorage.setItem('user', JSON.stringify(userData.user || userData))
          // Stocker également le token JWT
          if (userData.token) {
            localStorage.setItem('token', userData.token)
          }
        } else {
          // Sinon, utiliser sessionStorage qui persiste uniquement pour la session
          sessionStorage.setItem('user', JSON.stringify(userData.user || userData))
          // Stocker également le token JWT
          if (userData.token) {
            sessionStorage.setItem('token', userData.token)
          }
        }

        init({ message: 'Vous êtes connecté avec succès', color: 'success' })

        // Utiliser le paramètre de redirection de l'URL si disponible
        const redirectPath = route.query.redirect as string
        if (redirectPath) {
          push(redirectPath)
        } else {
          push({ name: 'lounges' }) // Redirection par défaut
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }
}
</script>
