# Déployer l'API NestJS avec PM2

Ce document explique comment déployer l'API NestJS (backend) en utilisant le fichier ecosystem.config.js.

## Sur votre machine de développement

1. **Construire l'application**

   ```bash
   # Dans le dossier backend
   npm install
   npm run build
   ```

2. **Vérifier que le build existe**

   Assurez-vous que le dossier `dist` a été créé avec le fichier `main.js`.

## Sur votre VPS

1. **Copier les fichiers**

   Transférez les fichiers suivants sur votre VPS (par exemple dans `/var/www/api`):
   - Dossier `dist/` (le build compilé)
   - Fichier `ecosystem.config.js`
   - Fichier `polyfill.js`
   - Fichier `package.json`
   - Fichier `package-lock.json` (ou `yarn.lock`)

   Vous pouvez utiliser SCP, SFTP ou toute autre méthode de transfert de fichiers.

2. **Installer les dépendances**

   Sur votre VPS, exécutez:
   ```bash
   cd /var/www/api
   npm install --production
   ```

3. **Créer le dossier d'uploads**

   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

4. **Démarrer avec PM2**

   ```bash
   # Installer PM2 si ce n'est pas déjà fait
   npm install -g pm2

   # Démarrer l'application
   pm2 start ecosystem.config.js

   # Configurer le démarrage automatique
   pm2 startup
   pm2 save
   ```

## Vérification du déploiement

Après le déploiement, votre API devrait être accessible à l'adresse:
```
http://votre-ip:6610
```

Vous pouvez vérifier les logs avec:
```bash
pm2 logs lounge-api
```

## Commandes PM2 utiles

- **Voir le statut**: `pm2 status`
- **Voir les logs**: `pm2 logs lounge-api`
- **Redémarrer**: `pm2 restart lounge-api`
- **Arrêter**: `pm2 stop lounge-api`
- **Supprimer de PM2**: `pm2 delete lounge-api`

## Résolution des problèmes

Si vous rencontrez l'erreur `crypto is not defined`:
- Vérifiez que le fichier `polyfill.js` est présent dans le répertoire de déploiement
- Assurez-vous que `crypto-browserify` est installé: `npm install crypto-browserify` 