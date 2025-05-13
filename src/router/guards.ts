import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
// import { AuthService } from '../services/api/authService'
// import { useAuthStore } from '../stores/auth'

// Garde pour routes qui nécessitent une authentification
export function requireAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // Vérifier l'authentification à partir du localStorage ET du sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!(token && userJson)

  if (isAuthenticated) {
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
  // Vérifier l'authentification à partir du localStorage ET du sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!(token && userJson)

  if (isAuthenticated) {
    let isAdmin = false
    let userRole = 'user'

    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        isAdmin = user.isAdmin === true
        userRole = user.role || 'user'
      } catch (e) {
        console.error('Erreur lors de la lecture des données user:', e)
      }
    }

    // Vérifier à la fois le flag isAdmin et le champ role
    if (isAdmin || userRole === 'admin') {
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
  // Vérifier l'authentification à partir du localStorage ET du sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!(token && userJson)

  if (isAuthenticated) {
    let hasActiveSubscription = false

    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        hasActiveSubscription =
          !!user.subscriptionType && !!user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) > new Date()
      } catch (e) {
        console.error('Erreur lors de la lecture des données user:', e)
      }
    }

    if (hasActiveSubscription) {
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
  // Vérifier l'authentification à partir du localStorage ET du sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!(token && userJson)

  if (isAuthenticated) {
    next({ name: 'lounges' })
  } else {
    next()
  }
}

// Garde pour limiter les utilisateurs normaux aux pages essentielles
export function userOnlyAccess(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // Vérifier l'authentification à partir du localStorage ET du sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!(token && userJson)

  if (isAuthenticated) {
    let isAdmin = false
    let userRole = 'user'

    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        isAdmin = user.isAdmin === true
        userRole = user.role || 'user'
      } catch (e) {
        console.error('Erreur lors de la lecture des données user:', e)
      }
    }

    // Les administrateurs ont accès à tout
    // Vérifier à la fois la propriété isAdmin et le champ role
    if (isAdmin || userRole === 'admin') {
      next()
      return
    }

    // Pages autorisées pour les utilisateurs normaux
    const allowedRoutes = [
      'lounges',
      'lounges-detail',
      'bookings',
      'bookings-detail',
      'bookings-create',
      'subscriptions',
      'subscriptions-detail',
      'subscription-history',
      'profile',
      'payment-methods',
      'billing',
      'faq',
      'preferences',
      'settings',
    ]

    if (allowedRoutes.includes(to.name as string)) {
      next()
    } else {
      // Rediriger vers la liste des salons si l'utilisateur tente d'accéder à une page non autorisée
      next({ name: 'lounges' })
    }
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }
}
