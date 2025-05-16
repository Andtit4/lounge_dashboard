#!/bin/bash

# Script pour démarrer le frontend en production ou développement
cd "$(dirname "$0")"
echo "Répertoire courant: $(pwd)"

# Assurer que node_modules est installé
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Vérifier l'environnement
if [ "$NODE_ENV" == "production" ]; then
  echo "Démarrage du frontend en mode PRODUCTION sur le port ${PORT:-6611}..."
  
  # Vérifier que le build existe
  if [ ! -d "dist" ]; then
    echo "Build non trouvé, création du build..."
    npm run build
  fi
  
  # Utiliser un serveur statique pour servir les fichiers compilés
  npx serve -s dist -l ${PORT:-6611}
else
  echo "Démarrage du frontend en mode DÉVELOPPEMENT sur le port ${PORT:-6611}..."
  
  # Vérifier que vite est installé
  if [ ! -f "node_modules/.bin/vite" ]; then
    echo "Installation de Vite..."
    npm install vite
  fi
  
  # Lancer Vite 
  export PORT=${PORT:-6611}
  node_modules/.bin/vite --port ${PORT} --host 
fi 