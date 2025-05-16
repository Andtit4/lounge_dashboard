#!/bin/bash

# Script de déploiement pour l'API Lounge Dashboard (mode développement)
echo "Déploiement de l'API Lounge Dashboard en mode développement"

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null
then
    echo "Installation de PM2..."
    npm install -g pm2
fi

# Configuration SSH
echo "Configuration des clés SSH pour le déploiement..."
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa

# Préparation du déploiement
echo "Préparation du déploiement..."
# Remplacez votre-username et votre-ip par les valeurs correctes
sed -i 's/votre-username/votre-username-reel/g' backend/ecosystem.config.js
sed -i 's/185.97.146.99/votre-ip/g' backend/ecosystem.config.js

# Déploiement avec PM2
echo "Déploiement de l'API avec PM2 deploy..."
cd backend
pm2 deploy ecosystem.config.js production setup
pm2 deploy ecosystem.config.js production
cd ..

echo "Configuration des démarrages automatiques avec PM2..."
# Connexion à distance pour configurer le démarrage automatique
ssh root@votre-ip "cd /var/www/lounge-api/current/backend && pm2 startup && pm2 save"

echo "Déploiement de l'API terminé!"
echo "API accessible sur: http://votre-ip:6610"
echo ""
echo "IMPORTANT: N'oubliez pas de configurer le port 6610 dans votre pare-feu!" 