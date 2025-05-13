import { createI18n } from 'vue-i18n'

import br from './locales/br.json'
import cn from './locales/cn.json'
import es from './locales/es.json'
import gb from './locales/gb.json'
import ir from './locales/ir.json'
import fr from './locales/fr.json'

type MessageSchema = typeof gb

const messages = {
  br,
  cn,
  es,
  gb,
  ir,
  fr,
}

// Liste des locales valides
const validLocales = ['br', 'cn', 'es', 'gb', 'ir', 'fr']

// Récupérer la langue sauvegardée dans localStorage ou utiliser l'anglais par défaut
let savedLanguage = localStorage.getItem('userLanguage') || 'gb'
console.log('Langue récupérée du localStorage:', savedLanguage)

// Vérifier si la locale est valide
if (!validLocales.includes(savedLanguage)) {
  console.log('Langue invalide, utilisation de gb par défaut')
  savedLanguage = 'gb'
  localStorage.setItem('userLanguage', 'gb')
} else {
  console.log('Langue valide:', savedLanguage)
}

// Créer l'instance i18n
const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'gb',
  messages,
})

console.log('Langue configurée pour i18n:', i18n.global.locale.value)

export default i18n
