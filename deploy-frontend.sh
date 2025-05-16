#!/bin/bash

# Script de déploiement pour le frontend Lounge Dashboard
echo "Déploiement du Frontend Lounge Dashboard"

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null
then
    echo "Installation de PM2..."
    npm install -g pm2
fi

# Vérifier si serve est installé
if ! command -v serve &> /dev/null
then
    echo "Installation de serve..."
    npm install -g serve
fi

# Configuration SSH
echo "Configuration des clés SSH pour le déploiement..."
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa

# Préparation du déploiement
echo "Préparation du déploiement..."
# Remplacez votre-username et votre-ip par les valeurs correctes
sed -i 's/votre-username/votre-username-reel/g' ecosystem.config.js
sed -i 's/185.97.146.99/votre-ip/g' ecosystem.config.js

# Déploiement avec PM2
echo "Déploiement du frontend avec PM2 deploy..."
pm2 deploy ecosystem.config.js production setup
pm2 deploy ecosystem.config.js production

echo "Configuration des démarrages automatiques avec PM2..."
# Connexion à distance pour configurer le démarrage automatique
ssh root@votre-ip "cd /var/www/lounge-frontend/current && pm2 startup && pm2 save"

echo "Déploiement du frontend terminé!"
echo "Frontend accessible sur: http://votre-ip:6611"
echo ""
echo "IMPORTANT: N'oubliez pas de configurer le port 6611 dans votre pare-feu!" 