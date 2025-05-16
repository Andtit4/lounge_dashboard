#!/bin/bash

# Script pour construire et démarrer le backend NestJS
cd "$(dirname "$0")"
echo "Répertoire courant: $(pwd)"

# Vérification des dépendances
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Construction du projet
echo "Construction du backend..."
npm run build

# Vérification que le build a bien fonctionné
if [ ! -f "dist/main.js" ]; then
  echo "ERREUR: Le fichier dist/main.js n'a pas été créé. Échec de la construction."
  exit 1
fi

# Démarrage du serveur
echo "Démarrage du serveur backend sur le port 6610..."
NODE_ENV=production npm run start:prod 