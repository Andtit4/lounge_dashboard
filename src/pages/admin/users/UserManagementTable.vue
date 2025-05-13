<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '../../../stores/userStore'
import { useToast } from 'vuestic-ui'
import { formatDate } from '../../../utils/formatters'
import type { IUser } from '../../../services/api/userService'

// Utiliser le store d'utilisateurs
const { users, isLoading, error, fetchUsers, deleteUser } = useUserStore()

// Logs pour déboguer
console.log('UserManagementTable: Composant initialisé')

// État local
const search = ref('')
const selectedRole = ref('all')

// Toast notifications
const { init: notify } = useToast()

// Émettre les événements
const emit = defineEmits(['edit-user', 'create-user', 'filter-change'])

// Surveiller les changements de filtres pour émettre l'événement
watch(
  [search, selectedRole],
  ([newSearch, newRole]) => {
    emit('filter-change', newSearch, newRole)
  },
  { immediate: true },
)

// Formater les utilisateurs pour l'affichage
const formattedUsers = computed(() => {
  console.log('UserManagementTable: Calcul de formattedUsers, users.value:', users.value)
  return users.value.map((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  }))
})

// Filtrage des utilisateurs
const filteredUsers = computed(() => {
  console.log('UserManagementTable: Calcul de filteredUsers, formattedUsers:', formattedUsers.value)
  let result = formattedUsers.value

  // Filtre par recherche
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(
      (user) => user.fullName.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower),
    )
  }

  // Filtre par rôle
  if (selectedRole.value !== 'all') {
    const isAdmin = selectedRole.value === 'admin'
    result = result.filter((user) => user.isAdmin === isAdmin)
  }

  console.log('UserManagementTable: Résultat filtré:', result)
  return result
})

// Gérer la confirmation de suppression
const userToDelete = ref<IUser | null>(null)
const confirmDelete = ref(false)

// Helper pour obtenir le nom complet
const getUserFullName = (user: IUser): string => {
  return `${user.firstName} ${user.lastName}`
}

const handleDeleteClick = (user: IUser) => {
  userToDelete.value = user
  confirmDelete.value = true
}

const confirmUserDelete = async () => {
  try {
    if (userToDelete.value) {
      await deleteUser(userToDelete.value.id)
      notify({
        message: `L'utilisateur ${getUserFullName(userToDelete.value)} a été supprimé avec succès`,
        color: 'success',
      })
    }
  } catch (err) {
    notify({
      message: `Erreur lors de la suppression : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      color: 'danger',
    })
  } finally {
    confirmDelete.value = false
    userToDelete.value = null
  }
}

// Charger les utilisateurs au montage du composant
onMounted(async () => {
  console.log('UserManagementTable: Composant monté, chargement des utilisateurs...')
  try {
    await fetchUsers()
    console.log('UserManagementTable: Utilisateurs chargés:', users.value)
  } catch (err) {
    console.error('UserManagementTable: Erreur lors du chargement des utilisateurs:', err)
    notify({
      message: `Erreur lors du chargement des utilisateurs : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      color: 'danger',
    })
  }
})

// Fonction pour forcer le rechargement des utilisateurs
const refreshUsers = async () => {
  try {
    await fetchUsers()
    notify({
      message: 'Liste des utilisateurs rafraîchie',
      color: 'success',
    })
  } catch (err) {
    console.error('UserManagementTable: Erreur lors du rafraîchissement des utilisateurs:', err)
    notify({
      message: `Erreur lors du rafraîchissement : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      color: 'danger',
    })
  }
}
</script>

<template>
  <div class="user-management-table">
    <!-- Afficher un message de debug avant le tableau -->
    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 1rem">
      Chargement: {{ isLoading }}
      Erreur: {{ error ? error.message : 'Aucune' }}
      Nombre d'utilisateurs: {{ formattedUsers.length }}
    </pre>

    <!-- Barre d'outils -->
    <div class="table-toolbar">
      <div class="search-filter">
        <VaInput v-model="search" placeholder="Rechercher un utilisateur" class="search-input">
          <template #prependInner>
            <VaIcon name="search" color="secondary" size="small" />
          </template>
        </VaInput>

        <VaSelect
          v-model="selectedRole"
          placeholder="Rôle"
          class="role-select"
          :options="[
            { value: 'all', text: 'Tous les rôles' },
            { value: 'admin', text: 'Admin' },
            { value: 'user', text: 'Utilisateur' },
          ]"
        />
      </div>

      <div class="actions-bar">
        <VaButton
          color="success"
          size="small"
          icon="refresh"
          class="refresh-button"
          :loading="isLoading"
          @click="refreshUsers"
        >
          Rafraîchir
        </VaButton>

        <VaButton color="primary" @click="$emit('create-user')"> Ajouter un utilisateur </VaButton>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="table-wrapper">
      <VaTable :items="filteredUsers" :loading="isLoading" hover striped>
        <VaTableColumn key="fullName" title="Nom">
          <template #cell="{ item }">
            <div class="user-cell">
              <VaAvatar
                :src="item.avatar || 'https://i.pravatar.cc/150?u=' + item.id"
                size="small"
                class="user-avatar"
              />
              <div class="user-info">
                <span class="user-name">{{ item.fullName }}</span>
                <span v-if="item.isAdmin" class="admin-badge">Admin</span>
              </div>
            </div>
          </template>
        </VaTableColumn>

        <VaTableColumn key="email" title="Email" />

        <VaTableColumn key="phoneNumber" title="Téléphone">
          <template #cell="{ item }">
            {{ item.phoneNumber || '-' }}
          </template>
        </VaTableColumn>

        <VaTableColumn key="subscriptionType" title="Abonnement">
          <template #cell="{ item }">
            <VaBadge v-if="item.subscriptionType" color="success" text="text" class="subscription-badge">
              {{ item.subscriptionType }}
            </VaBadge>
            <span v-else>-</span>
          </template>
        </VaTableColumn>

        <VaTableColumn key="createdAt" title="Date d'inscription">
          <template #cell="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
        </VaTableColumn>

        <VaTableColumn key="actions" title="Actions" align="right">
          <template #cell="{ item }">
            <div class="actions-cell">
              <VaButton icon="edit" preset="plain" size="small" @click="$emit('edit-user', item)" />
              <VaButton icon="delete" preset="plain" size="small" color="danger" @click="handleDeleteClick(item)" />
            </div>
          </template>
        </VaTableColumn>
      </VaTable>

      <!-- Message si aucun utilisateur -->
      <div v-if="!isLoading && filteredUsers.length === 0" class="no-data-message">
        <p>Aucun utilisateur trouvé</p>
        <VaButton color="primary" size="small" @click="refreshUsers">Rafraîchir</VaButton>
      </div>
    </div>

    <!-- Message d'erreur -->
    <VaAlert v-if="error" class="error-alert" color="danger" closeable>
      {{ error.message }}
    </VaAlert>

    <!-- Modal de confirmation de suppression -->
    <VaModal
      v-model="confirmDelete"
      title="Confirmer la suppression"
      ok-text="Supprimer"
      cancel-text="Annuler"
      @ok="confirmUserDelete"
    >
      <p>
        Êtes-vous sûr de vouloir supprimer l'utilisateur
        <strong v-if="userToDelete">{{ getUserFullName(userToDelete) }}</strong
        >?
        <br />
        Cette action est irréversible.
      </p>
    </VaModal>
  </div>
</template>

<style scoped>
.user-management-table {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.actions-bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.refresh-button {
  margin-right: 0.5rem;
}

.search-input {
  min-width: 300px;
}

.role-select {
  min-width: 180px;
}

.table-wrapper {
  overflow-x: auto;
}

.no-data-message {
  padding: 2rem;
  text-align: center;
  color: var(--va-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
}

.admin-badge {
  font-size: 0.75rem;
  color: var(--va-primary);
  background-color: rgba(var(--va-primary-rgb), 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
  display: inline-block;
  margin-top: 0.25rem;
}

.subscription-badge {
  font-weight: 600;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.error-alert {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .role-select {
    width: 100%;
    min-width: auto;
  }
}
</style>
