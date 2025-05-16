#!/bin/bash

# Script pour démarrer le frontend directement avec Vite
cd "$(dirname "$0")"
echo "Répertoire courant: $(pwd)"

# Assurer que node_modules est installé
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Vérifier que vite est installé
if [ ! -f "node_modules/.bin/vite" ]; then
  echo "Installation de Vite..."
  npm install vite
fi

# Lancer Vite avec le port explicitement défini
echo "Démarrage du frontend sur le port 6611..."
export PORT=6611
node_modules/.bin/vite --port 6611 --host 