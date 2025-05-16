#!/bin/bash

# Script pour déployer l'API backend précompilée sur le VPS
echo "Déploiement de l'API backend précompilée sur le VPS"

# Variables à configurer
VPS_USER="root"  # Modifier si nécessaire
VPS_HOST="185.97.146.99"  # Remplacer par l'IP de votre VPS
VPS_PORT="22"  # Port SSH, généralement 22
REMOTE_DIR="/var/www/api"  # Dossier de destination sur le VPS
LOCAL_DIR="./backend"  # Dossier source local

# Vérifier que le build existe
if [ ! -f "$LOCAL_DIR/dist/main.js" ]; then
  echo "ERREUR: Le build n'existe pas. Compilez d'abord l'API avec ./build-api.sh"
  exit 1
fi

# Création du répertoire distant s'il n'existe pas
echo "Création du répertoire distant..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $REMOTE_DIR"

# Création d'une archive pour optimiser le transfert
echo "Création d'une archive temporaire..."
TEMP_ARCHIVE="/tmp/api_build_$(date +%s).tar.gz"
tar --exclude="node_modules" --exclude=".git" -czf $TEMP_ARCHIVE -C $LOCAL_DIR .

# Transfert de l'archive sur le VPS
echo "Transfert de l'archive sur le VPS..."
scp -P $VPS_PORT $TEMP_ARCHIVE $VPS_USER@$VPS_HOST:/tmp/

# Extraction de l'archive sur le VPS
echo "Extraction de l'archive sur le VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "tar -xzf /tmp/$(basename $TEMP_ARCHIVE) -C $REMOTE_DIR && rm /tmp/$(basename $TEMP_ARCHIVE)"

# Suppression de l'archive locale temporaire
rm $TEMP_ARCHIVE

# Installation des dépendances de production sur le VPS
echo "Installation des dépendances de production sur le VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $REMOTE_DIR && npm install --production"

# Création du dossier uploads s'il n'existe pas
echo "Création du dossier uploads..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $REMOTE_DIR/uploads && chmod 755 $REMOTE_DIR/uploads"

# Configuration de PM2
echo "Configuration de PM2 sur le VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $REMOTE_DIR && \
    npm install -g pm2 && \
    pm2 delete lounge-api 2>/dev/null || true && \
    pm2 start ecosystem.simple.js --only lounge-api && \
    pm2 startup && \
    pm2 save"

echo "Déploiement terminé avec succès!"
echo "L'API est maintenant accessible sur http://$VPS_HOST:6610" 