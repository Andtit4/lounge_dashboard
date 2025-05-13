// Plugin pour le débogage de l'état des utilisateurs
import type { App } from 'vue'

export default {
  install: (app: App) => {
    // Ajouter une propriété globale pour le débogage
    window.__userDebug = {
      checkState: () => {
        const states = []

        // Parcourir tous les composants pour trouver les états liés aux utilisateurs
        try {
          const appInstance = app._instance
          if (appInstance && appInstance.component) {
            console.log("Composants de l'application:", appInstance)
            states.push({ source: 'App Instance', state: appInstance })
          }
        } catch (error) {
          console.error('Erreur lors du débogage des états utilisateur:', error)
        }

        return states
      },
    }

    console.log(
      "Plugin de débogage des utilisateurs installé. Utilisez window.__userDebug.checkState() pour vérifier l'état.",
    )
  },
}
