#!/bin/bash

# Script pour démarrer Vite.js en mode développement sur le port 6611
cd "$(dirname "$0")"
exec npx vite --port 6611 --host 