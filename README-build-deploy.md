# Compilation et Déploiement de l'API Backend

Ce guide explique comment compiler l'API backend et la déployer sur votre VPS.

## Méthode recommandée (compilation locale, déploiement du build)

Cette méthode compile l'application sur votre machine de développement puis déploie uniquement les fichiers nécessaires sur votre VPS. C'est l'approche recommandée car elle :
- Réduit le temps de déploiement
- Évite les problèmes de compilation sur le serveur
- Permet de tester le build avant le déploiement

### Étape 1: Compiler l'API localement

```bash
# Rendre le script exécutable
chmod +x build-api.sh

# Exécuter le script de compilation
./build-api.sh
```

Ce script va :
- Installer les dépendances si nécessaire
- Vérifier que crypto-browserify est installé
- Nettoyer le dossier de build existant
- Compiler l'application
- Vérifier que la compilation a réussi

### Étape 2: Déployer le build sur le VPS

1. Modifiez les variables dans `deploy-api-built.sh` :
   ```bash
   VPS_USER="root"  # Votre utilisateur SSH
   VPS_HOST="votre-ip"  # L'IP de votre VPS
   VPS_PORT="22"  # Port SSH
   REMOTE_DIR="/var/www/api"  # Dossier sur le VPS
   ```

2. Déployez l'API :
   ```bash
   # Rendre le script exécutable
   chmod +x deploy-api-built.sh
   
   # Exécuter le script de déploiement
   ./deploy-api-built.sh
   ```

Ce script va :
- Créer une archive du code compilé
- Transférer cette archive sur le VPS
- Extraire l'archive dans le dossier de destination
- Installer uniquement les dépendances de production
- Configurer et démarrer l'application avec PM2

## Architecture du déploiement

Une fois déployée, l'API aura la structure suivante sur le VPS :

```
/var/www/api/
├── dist/            # Code compilé de l'API
│   ├── main.js      # Point d'entrée de l'application
│   └── ...
├── node_modules/    # Dépendances de production uniquement
├── uploads/         # Dossier pour les fichiers uploadés
├── ecosystem.simple.js  # Configuration PM2
├── polyfill.js      # Polyfill pour crypto
└── ...
```

## Vérification du déploiement

Après le déploiement, votre API devrait être accessible à l'adresse :
```
http://votre-ip:6610
```

Vous pouvez vérifier son état avec :
```bash
ssh root@votre-ip "pm2 status"
ssh root@votre-ip "pm2 logs lounge-api"
```

## Résolution des problèmes

Si vous rencontrez des problèmes lors du déploiement :

1. **Erreur de compilation** : Vérifiez les logs dans la console locale lors de l'exécution de `build-api.sh`

2. **Erreur de déploiement** : Vérifiez les logs de déploiement et assurez-vous que SSH est correctement configuré

3. **Erreur au démarrage de l'API** : Vérifiez les logs PM2 sur le VPS avec `pm2 logs lounge-api`

4. **Problème crypto** : Vérifiez que le fichier polyfill.js est bien présent et que ecosystem.simple.js utilise l'option `node_args: "-r ./polyfill.js"` 