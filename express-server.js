const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 6611;

// Servir les fichiers statiques depuis le répertoire dist
app.use(express.static(path.join(__dirname, 'dist')));

// Rediriger toutes les requêtes à index.html (pour les SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur frontend démarré sur http://0.0.0.0:${PORT}`);
});