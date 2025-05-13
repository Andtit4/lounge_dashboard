<template>
  <div>
    <VaNotification v-if="error" color="danger" closable>
      {{ error.message }}
    </VaNotification>

    <VaLoading v-if="isInitializing" size="large" color="primary" />

    <RouterView v-else />
  </div>
</template>

<script setup lang="ts">
import { useAppInit } from './composables/useAppInit'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

const { isInitializing, error } = useAppInit()
const { locale } = useI18n()
const { applyPreset } = useColors()

// Fonction simplifiée pour appliquer le thème
const applyTheme = (selectedTheme: string) => {
  if (selectedTheme === 'light' || selectedTheme === 'dark') {
    applyPreset(selectedTheme)
  } else {
    // En cas de valeur non reconnue, utiliser le mode clair par défaut
    applyPreset('light')
  }
}

// Force la réinitialisation de la langue et du thème au démarrage de l'application
onMounted(() => {
  // Récupérer la langue sauvegardée dans localStorage
  const savedLanguage = localStorage.getItem('userLanguage')
  console.log('App - Langue récupérée du localStorage:', savedLanguage)

  // Si une langue est sauvegardée, l'appliquer
  if (savedLanguage) {
    console.log('App - Application de la langue:', savedLanguage)
    // Forcer l'application de la langue
    locale.value = savedLanguage
    console.log('App - Langue appliquée:', locale.value)

    // Forcer une mise à jour du DOM
    document.documentElement.setAttribute('lang', savedLanguage)
  }

  // Récupérer et appliquer le thème sauvegardé
  const savedTheme = localStorage.getItem('userTheme')
  if (savedTheme) {
    console.log('App - Application du thème:', savedTheme)
    applyTheme(savedTheme)
  } else {
    // Par défaut, utiliser le thème clair
    applyTheme('light')
  }
})
</script>

<style lang="scss">
#app {
  font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 20rem;
}
</style>
