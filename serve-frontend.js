#!/usr/bin/env node

// Script pour servir l'application frontend Vite.js
const express = require('express');
const { createServer: createViteServer } = require('vite');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 6611;
const HOST = '0.0.0.0';

// Option 1: Mode développement - Démarrer Vite directement
const startViteDev = async() => {
    console.log(`Démarrage de Vite en mode développement sur ${HOST}:${PORT}...`);

    // Déterminer le chemin vers l'exécutable Vite
    const viteBin = path.join(__dirname, 'node_modules', '.bin', 'vite');

    // Options de démarrage avec le port spécifié
    const args = [`--port=${PORT}`, '--host'];

    console.log(`Exécution de: ${viteBin} ${args.join(' ')}`);

    // Démarrer Vite avec les arguments
    const viteProcess = spawn(viteBin, args, {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            PORT: PORT.toString()
        }
    });

    viteProcess.on('error', (err) => {
        console.error('Erreur lors du démarrage de Vite:', err);
        process.exit(1);
    });

    viteProcess.on('exit', (code) => {
        console.log(`Vite s'est arrêté avec le code ${code}`);
        process.exit(code);
    });
};

// Démarrer en mode développement
startViteDev();