// Utilisez cette URL directement si la variable d'environnement n'est pas définie
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6610'

// Log l'URL de base pour débogage
console.log('[API] Base URL:', apiBaseUrl)

// Fonction d'aide pour les logs
const logEndpoint = (name: string, url: string) => {
  console.log(`[API] ${name} endpoint: ${url}`)
  return url
}

export default {
  // API ENDPOINTS EXISTANTS ET VÉRIFIÉS
  // Utilisateurs
  allUsers: () => logEndpoint('allUsers', `${apiBaseUrl}/users`),
  user: (id: string) => logEndpoint('user', `${apiBaseUrl}/users/${id}`),
  users: ({ page, pageSize }: { page: number; pageSize: number }) =>
    logEndpoint('users', `${apiBaseUrl}/users/?page=${page}&pageSize=${pageSize}`),

  // Authentification
  login: () => logEndpoint('login', `${apiBaseUrl}/auth/login`),
  signup: () => logEndpoint('signup', `${apiBaseUrl}/auth/signup`),

  // ENDPOINTS NON VÉRIFIÉS (PEUVENT NE PAS EXISTER)
  // Projets
  allProjects: () => `${apiBaseUrl}/projects`,
  project: (id: string) => `${apiBaseUrl}/projects/${id}`,
  projects: ({ page, pageSize }: { page: number; pageSize: number }) =>
    `${apiBaseUrl}/projects/?page=${page}&pageSize=${pageSize}`,
  avatars: () => `${apiBaseUrl}/avatars`,

  // ========== LOUNGE IN AFRICA API (ENDPOINTS NON IMPLÉMENTÉS) ==========
  // Ces endpoints sont prévus mais pas encore implémentés sur le backend
  // Utilisateurs
  loungeUsers: () => `${apiBaseUrl}/api/users`, // N'EXISTE PAS ENCORE
  loungeUser: (id: string) => `${apiBaseUrl}/api/users/${id}`, // N'EXISTE PAS ENCORE

  // Salons
  lounges: () => logEndpoint('lounges', `${apiBaseUrl}/lounges`),
  lounge: (id: string) => logEndpoint('lounge', `${apiBaseUrl}/lounges/${id}`),
  loungesByAirport: (airport: string) => logEndpoint('loungesByAirport', `${apiBaseUrl}/lounges?airport=${airport}`),
  loungesByCountry: (country: string) => logEndpoint('loungesByCountry', `${apiBaseUrl}/lounges?country=${country}`),
  searchLounges: (query: string) => logEndpoint('searchLounges', `${apiBaseUrl}/lounges?query=${query}`),
  createLounge: () => logEndpoint('createLounge', `${apiBaseUrl}/lounges`),
  updateLounge: (id: string) => logEndpoint('updateLounge', `${apiBaseUrl}/lounges/${id}`),
  deleteLounge: (id: string) => logEndpoint('deleteLounge', `${apiBaseUrl}/lounges/${id}`),
  loungeAnalytics: () => logEndpoint('loungeAnalytics', `${apiBaseUrl}/lounges/analytics`),
  loungeStats: (id: string) => logEndpoint('loungeStats', `${apiBaseUrl}/lounges/${id}/stats`),
  uploadLoungeImage: (id: string) => logEndpoint('uploadLoungeImage', `${apiBaseUrl}/lounges/${id}/upload-image`),

  // Réservations
  bookings: () => logEndpoint('bookings', `${apiBaseUrl}/bookings`), // Utilisez cet endpoint au lieu de /api/bookings
  booking: (id: string) => logEndpoint('booking', `${apiBaseUrl}/bookings/${id}`),
  userBookings: () => logEndpoint('userBookings', `${apiBaseUrl}/bookings/user`), // Endpoint pour les réservations de l'utilisateur connecté
  createBooking: () => logEndpoint('createBooking', `${apiBaseUrl}/bookings`),
  updateBooking: (id: string) => logEndpoint('updateBooking', `${apiBaseUrl}/bookings/${id}`),
  loungeBookings: (loungeId: string) => logEndpoint('loungeBookings', `${apiBaseUrl}/bookings?loungeId=${loungeId}`),
  confirmBooking: (id: string) => logEndpoint('confirmBooking', `${apiBaseUrl}/bookings/${id}/confirm`),
  cancelBooking: (id: string) => logEndpoint('cancelBooking', `${apiBaseUrl}/bookings/${id}/cancel`),
  completeBooking: (id: string) => logEndpoint('completeBooking', `${apiBaseUrl}/bookings/${id}/complete`),

  // Abonnements
  subscriptions: () => `${apiBaseUrl}/subscriptions`, // Utilisez cet endpoint au lieu de /api/subscriptions
  subscription: (id: string) => `${apiBaseUrl}/subscriptions/${id}`,
  userSubscriptions: (userId: string) => `${apiBaseUrl}/subscriptions?userId=${userId}`,
  cancelSubscription: (id: string) => `${apiBaseUrl}/subscriptions/${id}/cancel`,
  checkSubscriptionStatus: (id: string) => `${apiBaseUrl}/subscriptions/status/${id}`,
}
