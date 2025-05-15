<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import type { IUser } from '../../../services/api/userService'
import {
  formatSubscriptionDate,
  getSubscriptionStatus,
  getStatusColor,
  getStatusText,
} from '../../../utils/subscriptionUtils'

// Définir les props
const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  roleFilter: {
    type: String,
    default: 'all',
  },
})

// Émission d'événements
const emit = defineEmits(['manage-subscription', 'view-history'])

// Utiliser le store d'utilisateurs
const { users, isLoading, error, fetchUsers } = useUserStore()

// Déboguer pour voir si les données arrivent correctement
console.log('UserDisplay - Initialisation du composant')

onMounted(() => {
  console.log('UserDisplay - Composant monté, données initiales:', users.value)
  // Vérifier si le chargement des utilisateurs est nécessaire
  if (users.value.length === 0) {
    fetchUsers()
  }

  // Ajouter un log pour vérifier si les dates d'abonnement sont présentes
  users.value.forEach((user) => {
    console.log(
      `Utilisateur ${user.id} - Date début: ${user.subscriptionStartDate}, Date fin: ${user.subscriptionExpiryDate}`,
    )
  })
})

// Surveiller les changements dans les données
watch(
  users,
  (newUsers) => {
    console.log('UserDisplay - Users mis à jour:', newUsers)
  },
  { deep: true },
)

// Formater les utilisateurs pour l'affichage
const formattedUsers = computed(() => {
  console.log('UserDisplay - Calcul de formattedUsers, users.value:', users.value)
  return users.value.map((user) => {
    console.log(`Formatage utilisateur ${user.id}:`, user)

    // Calculer le statut de l'abonnement
    const status = getSubscriptionStatus(user.subscriptionStartDate, user.subscriptionExpiryDate)

    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      formattedSubscriptionStartDate: formatSubscriptionDate(user.subscriptionStartDate),
      formattedSubscriptionExpiryDate: formatSubscriptionDate(user.subscriptionExpiryDate),
      subscriptionStatus: status,
      statusColor: getStatusColor(status),
      statusText: getStatusText(status),
    }
  })
})

// Filtrer les utilisateurs selon les mêmes critères que UserManagementTable
const filteredUsers = computed(() => {
  let result = formattedUsers.value

  // Filtre par recherche
  if (props.searchQuery) {
    const searchLower = props.searchQuery.toLowerCase()
    result = result.filter(
      (user) => user.fullName.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower),
    )
  }

  // Filtre par rôle
  if (props.roleFilter !== 'all') {
    const isAdmin = props.roleFilter === 'admin'
    result = result.filter((user) => user.isAdmin === isAdmin)
  }

  console.log('UserDisplay - Utilisateurs filtrés:', result)
  return result
})

// Gérer l'abonnement d'un utilisateur
const handleManageSubscription = (user: IUser) => {
  emit('manage-subscription', user)
}

// Afficher l'historique des abonnements d'un utilisateur
const handleViewHistory = (user: IUser) => {
  emit('view-history', user)
}
</script>

<template>
  <div class="user-display">
    <div class="user-display-header">
      <h3 class="display-title">Liste des utilisateurs et abonnements</h3>
      <span class="user-count">{{ filteredUsers.length }} utilisateur(s)</span>
    </div>

    <div v-if="isLoading" class="loading-state">
      <VaProgress indeterminate />
      <span>Chargement des utilisateurs...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <p>Erreur: {{ error.message }}</p>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      Aucun utilisateur trouvé avec les filtres actuels.
    </div>

    <div v-else class="users-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Type d'abonnement</th>
            <th>Statut</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <VaBadge v-if="user.subscriptionType" color="success" text="text">
                {{ user.subscriptionType }}
              </VaBadge>
              <span v-else>-</span>
            </td>
            <td>
              <VaBadge v-if="user.subscriptionType" :color="user.statusColor">
                {{ user.statusText }}
              </VaBadge>
              <span v-else>-</span>
            </td>
            <td class="subscription-date">
              {{ user.formattedSubscriptionStartDate }}
            </td>
            <td class="subscription-date">
              {{ user.formattedSubscriptionExpiryDate }}
            </td>
            <td>
              <div class="action-buttons">
                <VaButton
                  size="small"
                  preset="secondary"
                  icon="card_membership"
                  @click="handleManageSubscription(user)"
                >
                  {{ user.subscriptionType ? 'Modifier' : 'Souscrire' }}
                </VaButton>

                <VaButton
                  size="small"
                  preset="plain"
                  icon="history"
                  title="Voir l'historique des abonnements"
                  @click="handleViewHistory(user)"
                >
                  Historique
                </VaButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.user-display {
  padding: 1.5rem;
  background-color: #f5f7fa;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.display-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.user-count {
  font-size: 0.9rem;
  color: #607d8b;
  background-color: #e3f2fd;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
}

.loading-state,
.error-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  margin-top: 1rem;
  background-color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-state {
  color: #d32f2f;
  background-color: #ffebee;
}

.empty-state {
  color: #666;
  font-style: italic;
}

.users-list {
  margin-top: 1rem;
  overflow-x: auto;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #e0e0e0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

tr:hover {
  background-color: #f5f5f5;
}

.subscription-date {
  font-family: monospace;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
