#!/bin/bash

# Script pour démarrer le backend NestJS en mode développement
cd "$(dirname "$0")"
echo "Répertoire courant: $(pwd)"

# Vérification des dépendances
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Démarrage du serveur en mode développement (watch mode)
echo "Démarrage du serveur backend en mode développement sur le port 6610..."
npm run start:dev 