#!/bin/bash

# Script pour compiler l'API backend avant déploiement
echo "Compilation de l'API backend pour le déploiement"

# Se déplacer dans le dossier backend
cd "$(dirname "$0")/backend" || { echo "Erreur: Le dossier backend n'existe pas."; exit 1; }
echo "Répertoire courant: $(pwd)"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
else
  echo "Les dépendances sont déjà installées."
fi

# Vérifier que crypto-browserify est installé
if ! grep -q "crypto-browserify" package.json; then
  echo "Installation de crypto-browserify..."
  npm install crypto-browserify --save
fi

# Nettoyer le dossier dist s'il existe
if [ -d "dist" ]; then
  echo "Nettoyage du dossier dist existant..."
  rm -rf dist
fi

# Compiler l'application
echo "Compilation de l'application..."
npm run build

# Vérifier que la compilation a réussi
if [ ! -f "dist/main.js" ]; then
  echo "ERREUR: La compilation a échoué, dist/main.js n'existe pas."
  exit 1
fi

echo "Compilation terminée avec succès!"
echo "Vous pouvez maintenant déployer le contenu du dossier backend sur votre VPS."
echo ""
echo "Instructions de déploiement:"
echo "1. Copier tous les fichiers du backend vers votre VPS"
echo "2. Installer les dépendances sur le VPS: npm install --production"
echo "3. Utilisez le fichier ecosystem.simple.js pour démarrer l'API en mode production"
echo "   pm2 start ecosystem.simple.js --only lounge-api" 