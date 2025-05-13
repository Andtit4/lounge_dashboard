<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import SubscriptionHistory from '../admin/users/SubscriptionHistory.vue'
import TransactionForm from '../admin/users/TransactionForm.vue'
import { useUserStore } from '../../stores/userStore'
import { SubscriptionService, type ICreateSubscriptionTransactionDto } from '../../services/api/subscriptionService'
import type { IUser } from '../../services/api/userService'

// État
const showTransactionModal = ref(false)
const selectedUser = ref<IUser | null>(null)
const isSubmitting = ref(false)

// Toast notifications
const { init: notify } = useToast()

// Store utilisateur
const userStore = useUserStore()

// Créer un computed pour accéder aux utilisateurs
const usersList = computed(() => {
  const users = userStore.users
  return Array.isArray(users) ? users : []
})

// Charger les utilisateurs au montage si nécessaire
onMounted(async () => {
  await userStore.fetchUsers()

  // Par défaut, sélectionner le premier utilisateur
  if (usersList.value.length > 0) {
    selectedUser.value = usersList.value[0]
  }
})

// Gérer l'ajout d'une transaction
const handleAddTransaction = () => {
  if (selectedUser.value) {
    showTransactionModal.value = true
  }
}

// Gérer la sauvegarde d'une transaction
const handleSaveTransaction = async (transactionData: ICreateSubscriptionTransactionDto) => {
  if (!selectedUser.value) return

  isSubmitting.value = true

  try {
    // Créer la transaction
    await SubscriptionService.createTransaction(transactionData)

    // Mettre à jour les informations d'abonnement de l'utilisateur
    const updateData = {
      subscriptionType: transactionData.subscriptionType,
      subscriptionStartDate: transactionData.startDate,
      subscriptionExpiryDate: transactionData.endDate,
    }

    await userStore.updateUser(selectedUser.value.id, updateData)

    notify({
      message: 'La transaction a été enregistrée avec succès',
      color: 'success',
    })

    // Fermer la modal après sauvegarde réussie
    showTransactionModal.value = false
  } catch (err) {
    notify({
      message: `Erreur: ${err instanceof Error ? err.message : 'Une erreur est survenue'}`,
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Fermer la modal de transaction
const handleCancelTransaction = () => {
  showTransactionModal.value = false
}

// Changer l'utilisateur sélectionné
const handleChangeUser = (user: IUser) => {
  selectedUser.value = user
}
</script>

<template>
  <div class="subscription-history-page">
    <VaCard>
      <VaCardTitle>
        <h1 class="page-title">Historique des abonnements</h1>
      </VaCardTitle>

      <VaCardContent>
        <!-- Sélecteur d'utilisateur -->
        <div v-if="usersList.length > 0" class="user-selector">
          <VaSelect
            v-model="selectedUser"
            label="Sélectionner un utilisateur"
            text-by="email"
            track-by="id"
            :options="usersList"
            @update:modelValue="handleChangeUser"
          />
        </div>

        <!-- Message si aucun utilisateur n'est disponible -->
        <div v-else class="no-users-message">
          <p>Aucun utilisateur disponible. Veuillez d'abord ajouter des utilisateurs.</p>
        </div>

        <!-- Affichage de l'historique si un utilisateur est sélectionné -->
        <SubscriptionHistory v-if="selectedUser" :user="selectedUser" @addTransaction="handleAddTransaction" />
      </VaCardContent>
    </VaCard>

    <!-- Modal pour ajouter une transaction -->
    <VaModal
      v-model="showTransactionModal"
      title="Ajouter une transaction"
      size="medium"
      hide-default-actions
      no-outside-dismiss
    >
      <TransactionForm
        v-if="selectedUser"
        :user="selectedUser"
        @save="handleSaveTransaction"
        @cancel="handleCancelTransaction"
      />
    </VaModal>
  </div>
</template>

<style scoped>
.subscription-history-page {
  padding: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.user-selector {
  margin-bottom: 2rem;
  max-width: 500px;
}

.no-users-message {
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}
</style>
