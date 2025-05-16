#!/usr/bin/env node

// Script pour démarrer Vite.js en mode développement
const { spawn } = require('child_process');
const { join } = require('path');

// Chemin vers le binaire Vite dans node_modules
const viteBin = join(__dirname, 'node_modules', '.bin', 'vite');

// Options de démarrage
const args = ['--port', '6611', '--host'];

// Démarrer Vite
const viteProcess = spawn(viteBin, args, {
    stdio: 'inherit',
    shell: true
});

// Gestion des erreurs
viteProcess.on('error', (err) => {
    console.error('Erreur lors du démarrage de Vite:', err);
    process.exit(1);
});

// Gestion de la sortie
viteProcess.on('exit', (code) => {
    console.log(`Vite s'est arrêté avec le code ${code}`);
    process.exit(code);
});