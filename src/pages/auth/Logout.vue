<template>
  <div class="flex justify-center items-center h-full">
    <VaLoading size="large" color="primary" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const { init } = useToast()
const authStore = useAuthStore()

onMounted(() => {
  // Effectuer la déconnexion
  authStore.logout()

  // Afficher un message de confirmation
  init({ message: 'Vous avez été déconnecté avec succès', color: 'success' })

  // Rediriger vers la page de connexion après un court délai
  setTimeout(() => {
    router.push({ name: 'login' })
  }, 500)
})
</script>
