// Script de démarrage avec polyfill intégré
require('./node-crypto'); // Charger d'abord le polyfill crypto

// Utiliser le chemin approprié pour main.js selon l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const mainPath = isProduction ? './dist/main.js' : './src/main.ts';

// Trouver et exécuter la fonction principale
try {
    console.log(`Démarrage de l'application en mode ${isProduction ? 'production' : 'développement'}`);
    console.log(`Chargement de ${mainPath}`);

    if (isProduction) {
        // En production, charger directement le fichier compilé
        require(mainPath);
    } else {
        // En développement, utiliser ts-node pour exécuter TypeScript
        require('ts-node').register();
        require(mainPath);
    }
} catch (error) {
    console.error('Erreur lors du démarrage de l\'application:', error);
    process.exit(1);
}