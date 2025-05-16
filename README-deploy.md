# Guide de déploiement du Lounge Dashboard

Ce guide vous explique comment déployer séparément le frontend et l'API de Lounge Dashboard sur votre VPS.

## Prérequis

- Un VPS avec Ubuntu/Debian
- Node.js 16+ et npm installés sur le VPS
- Git installé sur le VPS
- Clé SSH configurée pour l'accès à votre dépôt Git
- Ports 6610 et 6611 ouverts dans le pare-feu du VPS

## Configuration du déploiement

### Frontend (Mode Développement)

1. **Préparation du fichier ecosystem.config.js**

   Modifiez le fichier `ecosystem.config.js` à la racine du projet avec vos informations:
   
   ```javascript
   // Remplacez ces valeurs avec vos informations
   user: 'root', // Votre utilisateur SSH
   host: 'votre-ip', // L'adresse IP de votre VPS
   repo: 'git@github.com:votre-username/lounge_dashboard.git', // Votre dépôt Git
   ```

2. **Préparation du script deploy-frontend.sh**

   Modifiez le fichier `deploy-frontend.sh` avec vos informations:
   
   ```bash
   # Remplacez ces valeurs
   sed -i 's/votre-username/votre-username-reel/g' ecosystem.config.js
   sed -i 's/185.97.146.99/votre-ip/g' ecosystem.config.js
   ssh root@votre-ip "cd /var/www/lounge-frontend/current && pm2 startup && pm2 save"
   ```

### Backend (API)

1. **Préparation du fichier ecosystem.config.js pour le backend**

   Modifiez le fichier `backend/ecosystem.config.js` avec vos informations:
   
   ```javascript
   // Remplacez ces valeurs avec vos informations
   user: 'root', // Votre utilisateur SSH
   host: 'votre-ip', // L'adresse IP de votre VPS
   repo: 'git@github.com:votre-username/lounge_dashboard.git', // Votre dépôt Git
   ```

2. **Préparation du script deploy-backend.sh**

   Modifiez le fichier `deploy-backend.sh` avec vos informations:
   
   ```bash
   # Remplacez ces valeurs
   sed -i 's/votre-username/votre-username-reel/g' backend/ecosystem.config.js
   sed -i 's/185.97.146.99/votre-ip/g' backend/ecosystem.config.js
   ssh root@votre-ip "cd /var/www/lounge-api/current/backend && pm2 startup && pm2 save"
   ```

## Processus de déploiement

### Déploiement du Frontend

1. **Rendez le script de déploiement exécutable**

   ```bash
   chmod +x deploy-frontend.sh
   ```

2. **Exécutez le script de déploiement**

   ```bash
   ./deploy-frontend.sh
   ```

   Ce script va:
   - Installer PM2 si nécessaire
   - Configurer les clés SSH
   - Préparer le déploiement avec vos informations
   - Déployer le frontend avec PM2 deploy
   - Configurer le démarrage automatique du service

   Note: Le frontend sera déployé en mode développement avec `npm run dev`

### Déploiement du Backend (API)

1. **Rendez le script de déploiement exécutable**

   ```bash
   chmod +x deploy-backend.sh
   ```

2. **Exécutez le script de déploiement**

   ```bash
   ./deploy-backend.sh
   ```

   Ce script va:
   - Installer PM2 si nécessaire
   - Configurer les clés SSH
   - Préparer le déploiement avec vos informations
   - Déployer l'API avec PM2 deploy
   - Configurer le démarrage automatique du service

## Vérification du déploiement

Une fois déployée, votre application sera accessible sur:
- Frontend: http://votre-ip:6611
- API: http://votre-ip:6610

## Structure du déploiement

Le déploiement aura la structure suivante sur le VPS:

### Frontend
```
/var/www/lounge-frontend/
├── current/            # Version actuelle du frontend
│   ├── src/            # Code source du frontend
│   └── ...
├── shared/             # Fichiers partagés
└── source/             # Code source cloné
```

### Backend (API)
```
/var/www/lounge-api/
├── current/            # Version actuelle du backend
│   ├── backend/        # Code du backend
│   │   └── dist/       # Build du backend
│   └── ...
├── shared/             # Fichiers partagés
└── source/             # Code source cloné
```

## Dépannage

Si vous rencontrez des problèmes lors du déploiement:

### Frontend

```bash
# Vérifier les logs
ssh root@votre-ip "cd /var/www/lounge-frontend/current && pm2 logs lounge-frontend"

# Vérifier le statut
ssh root@votre-ip "pm2 status"

# Redémarrer manuellement
ssh root@votre-ip "cd /var/www/lounge-frontend/current && pm2 reload ecosystem.config.js"
```

### Backend (API)

```bash
# Vérifier les logs
ssh root@votre-ip "cd /var/www/lounge-api/current/backend && pm2 logs lounge-api"

# Vérifier le statut
ssh root@votre-ip "pm2 status"

# Redémarrer manuellement
ssh root@votre-ip "cd /var/www/lounge-api/current/backend && pm2 reload ecosystem.config.js"
``` 