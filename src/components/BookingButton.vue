<template>
  <div>
    <button v-if="hasSubscription" class="btn-primary py-2 px-4 rounded font-semibold" @click="goToBooking">
      Réserver ce salon
    </button>
    <div v-else>
      <button class="btn-secondary py-2 px-4 rounded font-semibold" @click="goToPricingPlans">
        Abonnement requis pour réserver
      </button>
      <p class="text-sm text-gray-600 mt-2">Vous devez avoir un abonnement actif pour accéder à ce salon.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  loungeId: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const hasSubscription = computed(() => authStore.hasActiveSubscription)

const goToBooking = () => {
  router.push({
    name: 'bookings-create',
    query: { loungeId: props.loungeId },
  })
}

const goToPricingPlans = () => {
  router.push({ name: 'pricing-plans' })
}
</script>
