<template>
  <div class="lounges-management">
    <VaCard class="mb-4">
      <VaCardTitle>Gestion des Salons VIP</VaCardTitle>
      <VaCardContent>
        <p>Bienvenue dans l'interface de gestion des salons VIP. Sélectionnez une action ci-dessous:</p>

        <div class="row">
          <div class="flex xs12 md4">
            <VaCard class="action-card" :to="{ name: 'lounges-list' }">
              <VaCardContent>
                <div class="d-flex align-center justify-center flex-column">
                  <VaIcon name="list" size="large" color="primary" />
                  <h3>Liste des salons</h3>
                  <p>Visualiser et modifier les salons existants</p>
                </div>
              </VaCardContent>
            </VaCard>
          </div>

          <div class="flex xs12 md4">
            <VaCard class="action-card" :to="{ name: 'lounges-create' }">
              <VaCardContent>
                <div class="d-flex align-center justify-center flex-column">
                  <VaIcon name="add_circle" size="large" color="success" />
                  <h3>Ajouter un salon</h3>
                  <p>Créer un nouveau salon VIP</p>
                </div>
              </VaCardContent>
            </VaCard>
          </div>

          <div class="flex xs12 md4">
            <VaCard class="action-card" :to="{ name: 'lounges-analytics' }">
              <VaCardContent>
                <div class="d-flex align-center justify-center flex-column">
                  <VaIcon name="bar_chart" size="large" color="info" />
                  <h3>Statistiques</h3>
                  <p>Analyser les performances des salons</p>
                </div>
              </VaCardContent>
            </VaCard>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
// Aucune logique particulière nécessaire pour cette page d'accueil
</script>

<style scoped>
.action-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  height: 100%;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 16px 0 8px 0;
}

p {
  text-align: center;
  color: #666;
}

.va-icon {
  font-size: 48px;
}
</style>
