import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Garde pour routes qui nécessitent une authentification
export function requireAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const authStore = useAuthStore()
  authStore.refreshAuth()
  
  if (authStore.isAuthenticated) {
    next()
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }
}

// Garde pour routes qui nécessitent un rôle admin
export function requireAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const authStore = useAuthStore()
  authStore.refreshAuth()
  
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next()
    } else {
      next({ name: 'lounges' }) // Redirection vers la page principale pour les non-admins
    }
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }
}

// Garde pour routes qui nécessitent un abonnement actif
export function requireSubscription(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()
  authStore.refreshAuth()
  
  if (authStore.isAuthenticated) {
    if (authStore.hasActiveSubscription) {
      next()
    } else {
      next({ name: 'pricing-plans' }) // Redirection vers la page des plans d'abonnement
    }
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }
}

// Garde pour les routes de connexion, inscription, etc.
// Redirige vers la page d'accueil si l'utilisateur est déjà connecté
export function redirectIfAuthenticated(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()
  authStore.refreshAuth()
  
  if (authStore.isAuthenticated) {
    next({ name: 'lounges' })
  } else {
    next()
  }
}

// Garde pour limiter les utilisateurs normaux aux pages essentielles
export function userOnlyAccess(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const authStore = useAuthStore()
  authStore.refreshAuth()
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return; // Ajouter un return pour empêcher les appels multiples à next()
  }
  
  // Les administrateurs ont accès à tout
  if (authStore.isAdmin) {
    next()
    return; // Ajouter un return pour empêcher les appels multiples à next()
  }

  // Pages autorisées pour les utilisateurs normaux - limité aux salons, réservations et pricing
  const allowedRoutes = [
    'lounges',
    'lounges-detail',
    'bookings',
    'bookings-detail',
    'bookings-create',
    'pricing-plans',
    'profile', // Gardé pour permettre à l'utilisateur de gérer son profil
    'logout'
  ]

  if (allowedRoutes.includes(to.name as string)) {
    next()
  } else {
    // Rediriger vers la liste des salons si l'utilisateur tente d'accéder à une page non autorisée
    next({ name: 'lounges' })
  }
}
