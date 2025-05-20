import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { vuestic } from '@vuestic/compiler/vite'

// URL du serveur backend
const BACKEND_URL = 'http://185.97.146.99:6610'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    port: 6611,
    host: '0.0.0.0', // Écouter sur toutes les interfaces réseau pour être accessible depuis l'extérieur
    proxy: {
      // Configuration du proxy pour éviter les problèmes CORS avec l'API
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erreur de proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        }
      },
      // Proxy pour les fichiers d'images
      '/uploads': {
        target: BACKEND_URL,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erreur de proxy (uploads):', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying upload:', req.method, req.url, '→', proxyReq.path);
          });
        }
      }
    }
  },
  plugins: [
    vuestic({
      devtools: true,
      cssLayers: true,
    }),
    vue(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
    }),
  ],
})
