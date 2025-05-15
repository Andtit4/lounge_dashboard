<template>
  <div>
    <VaAlert v-if="redirectMessage" closable color="warning" class="mb-6">
      {{ redirectMessage }}
    </VaAlert>

    <VaAlert v-if="error" closable color="danger" class="mb-6">
      {{ error.message }}
    </VaAlert>

    <h1 class="page-title">Choisissez votre abonnement</h1>
    <div class="py-4 text-lg leading-[26px]">
      Un abonnement actif est nécessaire pour accéder à toutes les fonctionnalités de nos salons.
      <span v-if="isAuthenticated" class="text-primary underline cursor-pointer" @click="showFeatures"
        >Voir les avantages</span
      >
      <span v-else class="text-primary underline cursor-pointer" @click="goToLogin">Connectez-vous d'abord</span>
    </div>

    <div class="flex flex-col p-4 bg-backgroundSecondary">
      <div class="flex justify-center">
        <VaButtonToggle
          v-model="selectedDuration"
          color="background-element"
          border-color="background-element"
          :options="[
            { label: 'Mensuel', value: 'Monthly' },
            { label: 'Annuel', value: 'Annual' },
          ]"
        />
      </div>
      <div class="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-x-6 md:space-y-0 mt-6">
        <VaCard
          v-for="plan in pricingPlans"
          :key="plan.model"
          :class="{
            'md:!py-10 !bg-backgroundCardSecondary': plan.model === 'Premium',
            '!bg-backgroundCardPrimary': plan.model !== 'Premium',
            'ring-2 ring-primary ring-offset-2':
              plan.model === selectedPlan || (userSubscriptionType !== null && plan.model === userSubscriptionType),
          }"
          class="flex w-[326px] md:w-[349px] h-fit p-6 rounded-[13px]"
        >
          <div :class="{ '!space-y-10': plan.model === 'Premium' }" class="space-y-8 md:space-y-10">
            <div class="space-y-4 text-center">
              <h2 class="pricing-plan-card-title">
                {{ plan.title }}
              </h2>
              <VaBadge v-for="badge in plan.badges" :key="badge" :style="badgeStyles" :text="badge" color="primary" />
              <p class="text-lg leading-[26px] text-secondary">
                {{ plan.description }}
              </p>
              <div class="flex space-x-1 justify-center items-baseline text-lg leading-[26px]">
                <span>€</span
                ><span class="text-[32px] md:text-5xl leading-[110%] md:leading-[56px] font-bold">{{
                  selectedDuration === 'Annual' ? plan.price : plan.priceMonth
                }}</span
                ><span>/ {{ selectedDuration === 'Annual' ? 'an' : 'mois' }}</span>
              </div>
            </div>
            <div class="space-y-6">
              <div
                v-for="feature in plan.features"
                :key="feature.description"
                class="flex justify-between items-center text-lg leading-[26px]"
              >
                <p :class="{ 'text-secondary': !feature.isAvailable }">
                  {{ feature.description }}
                </p>
                <VaIcon v-if="feature.isAvailable" color="primary" name="mso-check" size="20px" />
                <VaIcon v-else color="backgroundBorder" name="mso-block" size="20px" />
              </div>
            </div>
            <div class="flex justify-center">
              <VaButton
                :disabled="
                  !isAuthenticated ||
                  (userSubscriptionType !== null && plan.model === userSubscriptionType) ||
                  isLoading
                "
                :loading="isLoading && plan.model === processingPlan"
                :style="selectButtonStyles"
                @click="createModal(plan.model)"
              >
                {{ getButtonText(plan) }}
              </VaButton>
            </div>
          </div>
        </VaCard>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useToast, useModal } from 'vuestic-ui'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useSubscriptionStore } from '../../stores/subscriptionStore'

import { badgeStyles, selectButtonStyles } from './styles'
import { pricingPlans, type PricingPlans } from './options'

// Alias du type existant pour une meilleure lisibilité
type PricingPlan = PricingPlans

const { init } = useToast()
const { init: initModal } = useModal()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentSubscriptionType = computed(() => authStore.subscriptionType)
// Variable locale pour stocker la valeur déballée du computed
const userSubscriptionType = ref<string | null>(null)

const { error, isLoading } = subscriptionStore

const selectedDuration = ref<string>('Annual')
const selectedPlan = ref<string | null>(null)
const redirectMessage = ref<string | null>(null)
const processingPlan = ref<string | null>(null)

// Mettre à jour la variable locale quand le computed change
watch(
  currentSubscriptionType,
  (newValue) => {
    // Extraire la valeur du ComputedRef
    userSubscriptionType.value = newValue instanceof Object && 'value' in newValue ? newValue.value : newValue
  },
  { immediate: true },
)

onMounted(() => {
  // Si l'utilisateur est connecté, on récupère son abonnement actuel
  if (isAuthenticated.value) {
    // Extraire la valeur du ComputedRef
    userSubscriptionType.value =
      currentSubscriptionType.value instanceof Object && 'value' in currentSubscriptionType.value
        ? currentSubscriptionType.value.value
        : currentSubscriptionType.value

    if (userSubscriptionType.value !== null) {
      selectedPlan.value = userSubscriptionType.value
    }
    subscriptionStore.fetchUserSubscriptions()
  }

  // Si l'utilisateur a été redirigé avec un message
  if (route.query.message) {
    redirectMessage.value = route.query.message as string
  } else if (route.query.redirect) {
    redirectMessage.value = 'Un abonnement actif est nécessaire pour accéder à cette fonctionnalité.'
  }
})

const getButtonText = (plan: PricingPlan) => {
  if (!isAuthenticated.value) {
    return "Connectez-vous d'abord"
  }

  if (userSubscriptionType.value !== null && plan.model === userSubscriptionType.value) {
    return 'Abonnement actuel'
  }
  if (plan.model === 'Free') {
    return 'Plan gratuit'
  }
  return 'Sélectionner'
}

const createModal = (planModel: string) => {
  if (!isAuthenticated.value) {
    goToLogin()
    return
  }

  if (planModel === 'Free') {
    init({ message: 'Le plan gratuit est automatiquement disponible', color: 'info' })
    return
  }

  initModal({
    title: "Confirmation d'abonnement",
    message: `Êtes-vous sûr de vouloir souscrire à l'abonnement ${planModel} ${
      selectedDuration.value === 'Annual' ? 'annuel' : 'mensuel'
    }?`,
    mobileFullscreen: false,
    maxWidth: '380px',
    size: 'small',
    onOk: () => selectPlan(planModel),
  })
}

const selectPlan = async (planModel: string) => {
  processingPlan.value = planModel
  try {
    const durationMonths = selectedDuration.value === 'Annual' ? 12 : 1
    await subscriptionStore.subscribe(planModel, durationMonths)

    init({ message: `Vous avez souscrit avec succès à l'abonnement ${planModel}!`, color: 'success' })
    selectedPlan.value = planModel

    // Si l'utilisateur a été redirigé depuis une autre page, le renvoyer à cette page
    if (route.query.redirect) {
      setTimeout(() => {
        router.push(route.query.redirect as string)
      }, 1500)
    }
  } catch (err) {
    init({
      message: `Erreur lors de la souscription: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      color: 'danger',
    })
  } finally {
    processingPlan.value = null
  }
}

const showFeatures = () => {
  initModal({
    title: 'Avantages des abonnements',
    message: `
      <h3>Abonnement Classic</h3>
      <ul>
        <li>Accès à tous les salons avec réduction</li>
        <li>Réservations jusqu'à 3 jours en avance</li>
        <li>Accompagnement gratuit d'une personne</li>
      </ul>
      <h3>Abonnement Premium</h3>
      <ul>
        <li>Accès à tous les salons VIP inclus</li>
        <li>Réservations jusqu'à 7 jours en avance</li>
        <li>Accompagnement gratuit de deux personnes</li>
        <li>Boissons gratuites</li>
      </ul>
    `,
    mobileFullscreen: false,
    maxWidth: '500px',
    size: 'medium',
  })
}

const goToLogin = () => {
  router.push({
    name: 'login',
    query: { redirect: route.fullPath },
  })
}
</script>
