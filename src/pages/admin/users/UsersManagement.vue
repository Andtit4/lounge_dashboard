<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vuestic-ui'
import UserManagementTable from './UserManagementTable.vue'
import UserForm from './UserForm.vue'
import UserDisplay from './UserDisplay.vue'
import SubscriptionForm from './SubscriptionForm.vue'
import SubscriptionHistory from './SubscriptionHistory.vue'
import TransactionForm from './TransactionForm.vue'
import { useUserStore } from '../../../stores/userStore'
import { UserService } from '../../../services/api/userService'
import { SubscriptionService, type ICreateSubscriptionTransactionDto } from '../../../services/api/subscriptionService'
import type { IUser, ICreateUserDto, IUpdateUserDto } from '../../../services/api/userService'

// État de filtrage partagé
const searchQuery = ref('')
const selectedRoleFilter = ref('all')

// Utiliser le store d'utilisateurs
const { createUser, updateUser, error, fetchUsers } = useUserStore()

// État local
const showUserModal = ref(false)
const showSubscriptionModal = ref(false)
const showSubscriptionHistoryModal = ref(false)
const showTransactionModal = ref(false)
const selectedUser = ref<IUser | null>(null)
const selectedUserForSubscription = ref<IUser | null>(null)
const selectedUserForHistory = ref<IUser | null>(null)
const isSubmitting = ref(false)
const testApiStatus = ref<string>('')
const isTestingApi = ref(false)

// Toast notifications
const { init: notify } = useToast()

// Fonction de test de l'API
const testApiConnection = async () => {
  testApiStatus.value = 'Connexion en cours...'
  isTestingApi.value = true

  try {
    console.log("Test de l'API: Récupération des utilisateurs...")
    const users = await UserService.getAllUsers()
    console.log("Test de l'API: Utilisateurs récupérés", users)
    testApiStatus.value = `Succès: ${users.length} utilisateurs récupérés`
    notify({
      message: `Connexion à l'API réussie. ${users.length} utilisateurs récupérés.`,
      color: 'success',
    })

    // Mettre à jour la liste des utilisateurs
    fetchUsers()
  } catch (err) {
    console.error("Test de l'API: Erreur lors de la récupération des utilisateurs", err)
    testApiStatus.value = `Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`
    notify({
      message: `Erreur de connexion à l'API: ${err instanceof Error ? err.message : 'Inconnue'}`,
      color: 'danger',
    })
  } finally {
    isTestingApi.value = false
  }
}

// Gérer l'édition d'un utilisateur
const handleEditUser = (user: IUser) => {
  selectedUser.value = user
  showUserModal.value = true
}

// Gérer la création d'un nouvel utilisateur
const handleCreateUser = () => {
  selectedUser.value = null
  showUserModal.value = true
}

// Gérer la sauvegarde d'un utilisateur (création ou mise à jour)
const handleSaveUser = async (userData: ICreateUserDto | IUpdateUserDto) => {
  isSubmitting.value = true

  try {
    if (selectedUser.value) {
      // Mise à jour d'un utilisateur existant
      await updateUser(selectedUser.value.id, userData as IUpdateUserDto)
      notify({
        message: `L'utilisateur a été mis à jour avec succès`,
        color: 'success',
      })
    } else {
      // Création d'un nouvel utilisateur
      await createUser(userData as ICreateUserDto)
      notify({
        message: `L'utilisateur a été créé avec succès`,
        color: 'success',
      })
    }

    // Fermer la modal après sauvegarde réussie
    showUserModal.value = false
  } catch (err) {
    notify({
      message: `Erreur : ${error.value?.message || 'Une erreur est survenue'}`,
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Gérer la gestion d'abonnement
const handleManageSubscription = (user: IUser) => {
  selectedUserForSubscription.value = user
  showSubscriptionModal.value = true
}

// Gérer la sauvegarde d'un abonnement
const handleSaveSubscription = async (subscriptionData: {
  subscriptionType: string
  subscriptionStartDate: string
  subscriptionExpiryDate: string
  notes?: string
}) => {
  if (!selectedUserForSubscription.value) return

  isSubmitting.value = true

  try {
    // Créer un objet de mise à jour pour l'utilisateur
    const updateData = {
      ...selectedUserForSubscription.value,
      ...subscriptionData,
    }

    // Mettre à jour l'utilisateur avec les nouvelles données d'abonnement
    await updateUser(selectedUserForSubscription.value.id, updateData)

    // Créer une transaction d'abonnement
    const transactionData: ICreateSubscriptionTransactionDto = {
      userId: selectedUserForSubscription.value.id,
      subscriptionType: subscriptionData.subscriptionType,
      amount: getDefaultAmount(subscriptionData.subscriptionType), // Fonction à définir
      paymentMethod: 'card', // Par défaut
      transactionDate: new Date().toISOString(),
      startDate: subscriptionData.subscriptionStartDate,
      endDate: subscriptionData.subscriptionExpiryDate,
      status: 'completed',
      notes: `Abonnement ${subscriptionData.subscriptionType} - Ajouté via la gestion d'abonnement`,
    }

    await SubscriptionService.createTransaction(transactionData)

    notify({
      message: `L'abonnement a été ${subscriptionData.subscriptionType ? 'mis à jour' : 'créé'} avec succès`,
      color: 'success',
    })

    // Fermer la modal après sauvegarde réussie
    showSubscriptionModal.value = false
    selectedUserForSubscription.value = null
  } catch (err) {
    notify({
      message: `Erreur : ${error.value?.message || 'Une erreur est survenue'}`,
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Prix par défaut selon le type d'abonnement
const getDefaultAmount = (type: string): number => {
  const prices = {
    basic: 29.99,
    premium: 59.99,
    enterprise: 99.99,
  }

  return prices[type as keyof typeof prices] || 29.99
}

// Gérer l'affichage de l'historique des abonnements
const handleViewSubscriptionHistory = (user: IUser) => {
  selectedUserForHistory.value = user
  showSubscriptionHistoryModal.value = true
}

// Gérer l'ajout d'une transaction
const handleAddTransaction = () => {
  if (selectedUserForHistory.value) {
    showTransactionModal.value = true
  }
}

// Gérer la sauvegarde d'une transaction
const handleSaveTransaction = async (transactionData: ICreateSubscriptionTransactionDto) => {
  if (!selectedUserForHistory.value) return

  isSubmitting.value = true

  try {
    // Créer la transaction
    await SubscriptionService.createTransaction(transactionData)

    // Mettre à jour également les informations d'abonnement de l'utilisateur
    const updateData = {
      subscriptionType: transactionData.subscriptionType,
      subscriptionStartDate: transactionData.startDate,
      subscriptionExpiryDate: transactionData.endDate,
    }

    await updateUser(selectedUserForHistory.value.id, updateData)

    notify({
      message: 'La transaction a été enregistrée avec succès',
      color: 'success',
    })

    // Fermer la modal après sauvegarde réussie
    showTransactionModal.value = false
    // Ne pas fermer l'historique pour permettre de voir la transaction ajoutée
  } catch (err) {
    notify({
      message: `Erreur : ${err instanceof Error ? err.message : 'Une erreur est survenue'}`,
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Fermer les modals
const handleCancelForm = () => {
  showUserModal.value = false
}

const handleCancelSubscription = () => {
  showSubscriptionModal.value = false
  selectedUserForSubscription.value = null
}

const handleCloseHistory = () => {
  showSubscriptionHistoryModal.value = false
  selectedUserForHistory.value = null
}

const handleCancelTransaction = () => {
  showTransactionModal.value = false
}

// Gérer les changements de filtres
const handleFilterChange = (search: string, role: string) => {
  searchQuery.value = search
  selectedRoleFilter.value = role
}
</script>

<template>
  <div class="users-management">
    <div class="page-header">
      <h1 class="page-title">Gestion des Utilisateurs</h1>
      <p class="page-description">Gérez les utilisateurs de la plateforme</p>

      <!-- Bouton de test de l'API -->
      <div class="api-test-section">
        <VaButton color="info" size="small" :loading="isTestingApi" @click="testApiConnection">
          Tester la connexion à l'API
        </VaButton>
        <span
          v-if="testApiStatus"
          :class="{
            'text-success': testApiStatus.startsWith('Succès'),
            'text-danger': testApiStatus.startsWith('Erreur'),
          }"
        >
          {{ testApiStatus }}
        </span>
      </div>
    </div>

    <!-- Tableau de gestion des utilisateurs -->
    <VaCard class="users-card">
      <VaCardContent>
        <h2 class="section-title">Tableau de gestion avancé</h2>
        <UserManagementTable
          @editUser="handleEditUser"
          @createUser="handleCreateUser"
          @filterChange="handleFilterChange"
        />
      </VaCardContent>
    </VaCard>

    <!-- Liste des utilisateurs simplifiée -->
    <VaCard class="users-card">
      <VaCardContent>
        <UserDisplay
          :search-query="searchQuery"
          :role-filter="selectedRoleFilter"
          @manageSubscription="handleManageSubscription"
          @viewHistory="handleViewSubscriptionHistory"
        />
      </VaCardContent>
    </VaCard>

    <!-- Modal pour ajouter/modifier un utilisateur -->
    <VaModal
      v-model="showUserModal"
      :title="selectedUser ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'"
      size="medium"
      hide-default-actions
      no-outside-dismiss
    >
      <UserForm :user="selectedUser" :is-editing="!!selectedUser" @save="handleSaveUser" @cancel="handleCancelForm" />
    </VaModal>

    <!-- Modal pour gérer l'abonnement -->
    <VaModal
      v-model="showSubscriptionModal"
      title="Gestion d'abonnement"
      size="medium"
      hide-default-actions
      no-outside-dismiss
    >
      <SubscriptionForm
        v-if="selectedUserForSubscription"
        :user="selectedUserForSubscription"
        :is-editing="!!selectedUserForSubscription.subscriptionType"
        @save="handleSaveSubscription"
        @cancel="handleCancelSubscription"
      />
    </VaModal>

    <!-- Modal pour l'historique des abonnements -->
    <VaModal
      v-model="showSubscriptionHistoryModal"
      :title="`Historique des abonnements - ${
        selectedUserForHistory ? selectedUserForHistory.firstName + ' ' + selectedUserForHistory.lastName : ''
      }`"
      size="large"
      hide-default-actions
    >
      <div v-if="selectedUserForHistory" class="history-modal-content">
        <SubscriptionHistory :user="selectedUserForHistory" @addTransaction="handleAddTransaction" />

        <div class="modal-footer">
          <VaButton @click="handleCloseHistory">Fermer</VaButton>
        </div>
      </div>
    </VaModal>

    <!-- Modal pour ajouter une transaction -->
    <VaModal
      v-model="showTransactionModal"
      title="Ajouter une transaction"
      size="medium"
      hide-default-actions
      no-outside-dismiss
    >
      <TransactionForm
        v-if="selectedUserForHistory"
        :user="selectedUserForHistory"
        @save="handleSaveTransaction"
        @cancel="handleCancelTransaction"
      />
    </VaModal>
  </div>
</template>

<style scoped>
.users-management {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-description {
  color: var(--va-text-secondary);
  margin-bottom: 1rem;
}

.api-test-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.text-success {
  color: var(--va-success);
}

.text-danger {
  color: var(--va-danger);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--va-primary);
}

.users-card {
  margin-bottom: 1.5rem;
}

.history-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid var(--va-border);
  margin-top: 1rem;
}
</style>
