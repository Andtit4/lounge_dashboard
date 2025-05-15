<template>
  <div class="lounges-list">
    <VaCard class="mb-4">
      <VaCardTitle>Liste des Salons VIP</VaCardTitle>
      <VaCardContent>
        <div class="row">
          <div class="flex xs12 md6 lg4">
            <VaInput v-model="searchQuery" placeholder="Rechercher par nom, aéroport ou pays" clearable>
              <template #append>
                <VaIcon name="search" @click="search" />
              </template>
            </VaInput>
          </div>
          <div class="flex xs12 md6 lg8 text-right">
            <VaButton color="primary" icon="refresh" class="mr-2" @click="forceRefreshLounges" :loading="loading">
              Rafraîchir
            </VaButton>
            <VaButton color="success" icon="add" :to="{ name: 'lounges-create' }"> Ajouter un salon </VaButton>
          </div>
        </div>

        <div v-if="loading" class="text-center my-4">
          <VaLoading />
        </div>

        <div v-else-if="error" class="my-4">
          <VaAlert color="danger" closable>{{ error }}</VaAlert>
        </div>

        <div v-else-if="!lounges.length" class="my-4">
          <VaCard class="empty-state-card text-center py-5">
            <div class="mb-4">
              <i class="va-icon material-icons text-6xl text-gray-400">airline_seat_individual_suite</i>
            </div>
            <h3 class="text-xl font-bold mb-2">Aucun salon VIP enregistré</h3>
            <p class="text-gray-500 mb-4">Commencez par ajouter votre premier salon pour les voyageurs</p>
            <VaButton color="success" icon="add" :to="{ name: 'lounges-create' }"> Ajouter un salon </VaButton>
          </VaCard>
        </div>

        <div v-else class="lounges-grid">
          <VaCard v-for="lounge in lounges" :key="lounge.id" class="lounge-card mb-4">
            <VaCardTitle>{{ lounge.name }}</VaCardTitle>
            <VaCardContent>
              <p><strong>Emplacement:</strong> {{ lounge.location }}</p>
              <p><strong>Aéroport:</strong> {{ lounge.airport }}</p>
              <p><strong>Pays:</strong> {{ lounge.country }}</p>
              <p><strong>Prix:</strong> {{ formatPrice(lounge.price) }}</p>
            </VaCardContent>
            <VaCardActions>
              <RouterLink :to="`/lounges/${lounge.id}`" class="mr-2">
                <VaButton icon="visibility" size="small" color="primary"> Détails </VaButton>
              </RouterLink>
              <VaButton
                icon="edit"
                size="small"
                color="warning"
                class="mr-2"
                :to="{ name: 'lounges-edit', params: { id: lounge.id } }"
              >
                Modifier
              </VaButton>
              <VaButton icon="delete" size="small" color="danger" @click="confirmDelete(lounge)"> Supprimer </VaButton>
            </VaCardActions>
          </VaCard>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Modal de confirmation de suppression -->
    <VaModal v-model="showDeleteModal" title="Confirmer la suppression" hide-default-actions>
      <div class="mb-4">
        Êtes-vous sûr de vouloir supprimer le salon "{{ loungeToDelete?.name }}" ?
        <br />
        Cette action est irréversible.
      </div>
      <div class="d-flex justify-end">
        <VaButton class="mr-3" @click="showDeleteModal = false">Annuler</VaButton>
        <VaButton color="danger" @click="deleteLounge">Confirmer la suppression</VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onActivated, onBeforeMount } from 'vue'
import { useLoungeStore } from '../../../stores/lounge'
import type { Lounge } from '../../../types'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loungeStore = useLoungeStore()
const { lounges, loading, error } = loungeStore

const searchQuery = ref('')
const showDeleteModal = ref(false)
const loungeToDelete = ref<Lounge | null>(null)

// Force un rechargement complet des données au chargement de la page 
// et avant même que le composant soit monté
onBeforeMount(async () => {
  console.log('[LOUNGES-LIST] Avant montage du composant, chargement des salons...')
  await refreshLoungesList()
})

// Forcer le rechargement des données à chaque activation de la page
onActivated(async () => {
  console.log('[LOUNGES-LIST] Composant activé, rechargement des données...')
  await refreshLoungesList()
})

// Surveiller les changements de route pour recharger les données
watch(() => route.fullPath, async () => {
  console.log('[LOUNGES-LIST] Changement de route détecté, rechargement des données...')
  await refreshLoungesList()
})

// Fonction pour rafraîchir la liste des salons
const refreshLoungesList = async () => {
  console.log('[LOUNGES-LIST] Rafraîchissement de la liste des salons...')
  try {
    if (searchQuery.value) {
      await loungeStore.searchLounges(searchQuery.value)
    } else {
      // Forcer un rafraîchissement sans cache
      await loungeStore.fetchLounges(true)
    }
    console.log('[LOUNGES-LIST] Nombre de salons récupérés:', lounges.length)
  } catch (error) {
    console.error('[LOUNGES-LIST] Erreur lors du chargement des salons:', error)
  }
}

// Ajouter un bouton pour forcer le rechargement des données
const forceRefreshLounges = async () => {
  console.log('[LOUNGES-LIST] Rafraîchissement forcé des salons...')
  await loungeStore.fetchLounges(true)
  console.log('[LOUNGES-LIST] Nombre de salons après rafraîchissement forcé:', lounges.length)
}

// Actions
const search = async () => {
  await refreshLoungesList()
}

const confirmDelete = (lounge: Lounge) => {
  loungeToDelete.value = lounge
  showDeleteModal.value = true
}

const deleteLounge = async () => {
  if (loungeToDelete.value) {
    try {
      console.log('[LOUNGES-LIST] Suppression du salon:', loungeToDelete.value.name)
      
      // Attendre que la suppression soit terminée
      const result = await loungeStore.deleteLounge(loungeToDelete.value.id)
      
      if (result) {
        console.log('[LOUNGES-LIST] Salon supprimé avec succès')
        // Fermer la modale de confirmation
        showDeleteModal.value = false
        
        // Force un rafraîchissement complet des données depuis le serveur
        console.log('[LOUNGES-LIST] Rafraîchissement de la liste après suppression...')
        await loungeStore.fetchLounges(true)
        
        // Afficher une confirmation
        alert('Le salon a été supprimé avec succès.')
      } else {
        console.error('[LOUNGES-LIST] Échec de la suppression du salon')
        alert('La suppression du salon a échoué. Veuillez réessayer.')
      }
    } catch (err) {
      console.error('[LOUNGES-LIST] Erreur lors de la suppression du salon:', err)
      alert('Une erreur est survenue lors de la suppression du salon.')
      showDeleteModal.value = false
    }
  }
}

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Charger les données au montage du composant et à chaque changement de route
onMounted(async () => {
  console.log('[LOUNGES-LIST] Composant monté, chargement initial des salons...')
  await refreshLoungesList()
})
</script>

<style scoped>
.action-buttons {
  display: flex;
}

.lounges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.lounge-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.lounge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.empty-state-card {
  max-width: 500px;
  margin: 0 auto;
  border: 1px dashed #ddd;
  background-color: #f9f9f9;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-6xl {
  font-size: 3.75rem; /* 60px */
  line-height: 1;
}
</style>
