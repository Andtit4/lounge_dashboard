#!/bin/bash

# Script de déploiement pour lounge_dashboard
echo "Déploiement de Lounge Dashboard Frontend + Backend"

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

# Déploiement avec PM2
echo "Déploiement avec PM2 deploy..."
pm2 deploy ecosystem.config.js production setup
pm2 deploy ecosystem.config.js production

echo "Configuration des démarrages automatiques avec PM2..."
pm2 startup
pm2 save

echo "Déploiement terminé!"
echo "Frontend accessible sur: http://votre-ip:6611"
echo "API accessible sur: http://votre-ip:6610" 