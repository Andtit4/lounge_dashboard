# Déploiement Simplifié du Backend

Ce guide explique comment déployer simplement le backend sur votre VPS avec PM2.

## Prérequis

- Node.js (version 16+) installé sur votre VPS
- npm installé sur votre VPS
- PM2 installé globalement (`npm install -g pm2`)

## Étapes de déploiement

1. **Copier les fichiers**

   Copiez tous les fichiers du dossier backend sur votre VPS dans le dossier de votre choix, par exemple `/var/www/api`.

2. **Installer les dépendances**

   ```bash
   cd /var/www/api
   npm install
   
   # Si crypto-browserify n'est pas déjà installé
   npm install crypto-browserify
   ```

3. **Créer le dossier uploads**

   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

4. **Démarrer avec PM2**

   Vous avez deux options pour démarrer le backend :

   ### Option 1 : Mode Production (avec build)

   ```bash
   # Construire l'application
   npm run build
   
   # Copier le fichier ecosystem.simple.js
   cp ecosystem.simple.js ecosystem.config.js
   
   # Démarrer l'application en production
   pm2 start ecosystem.config.js --only lounge-api
   ```

   ### Option 2 : Mode Développement (sans build)

   ```bash
   # Copier le fichier ecosystem.simple.js
   cp ecosystem.simple.js ecosystem.config.js
   
   # Démarrer l'application en développement
   pm2 start ecosystem.config.js --only lounge-api-dev
   ```

5. **Configurer le démarrage automatique**

   ```bash
   pm2 startup
   pm2 save
   ```

## Résolution du problème "crypto is not defined"

Le fichier `polyfill.js` inclus résout l'erreur `ReferenceError: crypto is not defined` qui peut se produire avec NestJS et TypeORM. Ce problème est corrigé en :

1. Utilisant `crypto-browserify` comme polyfill pour le module `crypto`
2. Chargeant ce polyfill avant le démarrage de l'application avec `-r ./polyfill.js`

Si vous rencontrez toujours ce problème, assurez-vous que :
- `crypto-browserify` est installé (`npm install crypto-browserify`)
- Le fichier `polyfill.js` existe à la racine du projet
- L'application est démarrée avec l'argument `-r ./polyfill.js` (déjà configuré dans ecosystem.config.js)

## Configuration

Le fichier `ecosystem.simple.js` contient deux configurations :

1. **lounge-api** : Mode production, utilise le build compilé
2. **lounge-api-dev** : Mode développement, démarrage direct sans build

Si vous devez modifier les paramètres, éditez ce fichier avant de démarrer l'application.

## Vérification

Après le déploiement, votre API devrait être accessible à l'adresse :

```
http://votre-ip:6610
```

## Commandes utiles

- Pour voir les logs : `pm2 logs lounge-api` ou `pm2 logs lounge-api-dev`
- Pour redémarrer : `pm2 restart lounge-api` ou `pm2 restart lounge-api-dev`
- Pour arrêter : `pm2 stop lounge-api` ou `pm2 stop lounge-api-dev`
- Pour supprimer : `pm2 delete lounge-api` ou `pm2 delete lounge-api-dev` 