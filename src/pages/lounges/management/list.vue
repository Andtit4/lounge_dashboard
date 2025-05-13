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
          <VaAlert color="info">Aucun salon trouvé</VaAlert>
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
              <VaButton icon="edit" size="small" color="warning" class="mr-2" @click="editLounge(lounge)">
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

    <!-- Modal d'édition -->
    <VaModal v-model="showEditModal" title="Modifier le salon" size="large" hide-default-actions>
      <LoungeForm
        v-if="loungeToEdit"
        :lounge="loungeToEdit"
        @submit="saveEditedLounge"
        @cancel="showEditModal = false"
      />
    </VaModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted /* , computed */ } from 'vue'
import { useLoungeStore } from '../../../stores/lounge'
import type { Lounge /* , CreateLoungeDto, UpdateLoungeDto */ } from '../../../types'
// Import du formulaire
import LoungeForm from './components/LoungeForm.vue'

const loungeStore = useLoungeStore()
const { lounges, loading, error } = loungeStore

const searchQuery = ref('')
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const loungeToDelete = ref<Lounge | null>(null)
const loungeToEdit = ref<Lounge | null>(null)

// Actions
const search = async () => {
  if (searchQuery.value) {
    await loungeStore.searchLounges(searchQuery.value)
  } else {
    await loungeStore.fetchLounges()
  }
}

const editLounge = (lounge: Lounge) => {
  loungeToEdit.value = JSON.parse(JSON.stringify(lounge)) // Copie profonde
  showEditModal.value = true
}

const saveEditedLounge = async (updatedData: any) => {
  if (loungeToEdit.value) {
    await loungeStore.updateLounge(loungeToEdit.value.id, updatedData)
    showEditModal.value = false
    // Rafraîchir la liste après mise à jour
    await loungeStore.fetchLounges()
  }
}

const confirmDelete = (lounge: Lounge) => {
  loungeToDelete.value = lounge
  showDeleteModal.value = true
}

const deleteLounge = async () => {
  if (loungeToDelete.value) {
    await loungeStore.deleteLounge(loungeToDelete.value.id)
    showDeleteModal.value = false
    // Rafraîchir la liste après suppression
    await loungeStore.fetchLounges()
  }
}

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
}

// Charger les données au montage du composant
onMounted(async () => {
  await loungeStore.fetchLounges()
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
</style>
