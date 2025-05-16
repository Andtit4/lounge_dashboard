#!/bin/bash

# Script de déploiement pour l'API backend sur Hostinger VPS
echo "Déploiement de l'API backend sur Hostinger VPS"

# Variables à configurer
VPS_USER="root"  # Modifier si nécessaire
VPS_HOST="votre-ip"  # Remplacer par l'IP de votre VPS Hostinger
VPS_PORT="22"  # Port SSH, généralement 22
REMOTE_DIR="/var/www/api"  # Dossier de destination sur le VPS
LOCAL_DIR="./backend"  # Dossier source local

# Base de données et configurations
DB_HOST="193.203.166.156"  # Votre hôte de base de données
DB_PORT="3306"  # Port de la base de données
DB_USER="u527740812_lounge_db_user"  # Utilisateur de la base de données
DB_PASS="Motdep@sse/2022"  # Mot de passe de la base de données
DB_NAME="u527740812_lounge_db"  # Nom de la base de données
API_PORT="6610"  # Port sur lequel l'API écoutera

# Création du répertoire distant s'il n'existe pas
echo "Création du répertoire distant..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $REMOTE_DIR"

# Synchronisation des fichiers (sans node_modules)
echo "Copie des fichiers vers le serveur..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
      -e "ssh -p $VPS_PORT" \
      $LOCAL_DIR/ $VPS_USER@$VPS_HOST:$REMOTE_DIR/

# Installation des dépendances sur le serveur
echo "Installation des dépendances sur le serveur..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $REMOTE_DIR && npm install"

# Création d'un fichier .env sur le serveur
echo "Création du fichier .env sur le serveur..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cat > $REMOTE_DIR/.env << EOF
NODE_ENV=production
PORT=$API_PORT
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS
DB_DATABASE=$DB_NAME
JWT_SECRET=changeThis-WithSecureSecret
UPLOADS_DIR=./uploads
API_BASE_URL=http://$VPS_HOST:$API_PORT
EOF"

# Création du dossier uploads s'il n'existe pas
echo "Création du dossier uploads..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $REMOTE_DIR/uploads && chmod 755 $REMOTE_DIR/uploads"

# Construction du projet sur le serveur
echo "Construction du projet sur le serveur..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $REMOTE_DIR && npm run build"

# Configuration du script de démarrage pour PM2
echo "Création d'un script de démarrage pour PM2..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cat > $REMOTE_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'lounge-api',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $API_PORT,
      DB_HOST: '$DB_HOST',
      DB_PORT: $DB_PORT,
      DB_USERNAME: '$DB_USER',
      DB_PASSWORD: '$DB_PASS',
      DB_DATABASE: '$DB_NAME',
      JWT_SECRET: 'changeThis-WithSecureSecret',
      UPLOADS_DIR: './uploads',
      API_BASE_URL: 'http://$VPS_HOST:$API_PORT',
    }
  }]
}
EOF"

# Configuration de PM2
echo "Configuration de PM2 sur le serveur..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $REMOTE_DIR && \
    npm install -g pm2 && \
    pm2 startup && \
    pm2 delete lounge-api 2>/dev/null || true && \
    pm2 start ecosystem.config.js && \
    pm2 save"

echo "Déploiement terminé!"
echo "L'API devrait maintenant être accessible sur http://$VPS_HOST:$API_PORT" 