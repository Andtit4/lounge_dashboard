#!/bin/bash

# Script pour démarrer l'API directement sans PM2
cd "$(dirname "$0")"
echo "Démarrage direct de l'API NestJS"

# Variables d'environnement requises
export NODE_ENV=production
export PORT=6610
export DB_HOST=193.203.166.156
export DB_PORT=3306
export DB_USERNAME=u527740812_lounge_db_user
export DB_PASSWORD="Motdep@sse/2022"
export DB_DATABASE=u527740812_lounge_db
export JWT_SECRET="changeThis-WithSecureSecret"
export UPLOADS_DIR="./uploads"
export API_BASE_URL="https://185-97-146-99.nip.io"

# Lancer l'application via notre script patché
node start-patched.js 