import { formatDate } from './formatters'

/**
 * Vérifie si la date d'abonnement fournie est valide
 * @param dateStr Chaîne de date à vérifier
 */
export function isValidSubscriptionDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false

  try {
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  } catch (error) {
    console.error('Date de format invalide:', dateStr, error)
    return false
  }
}

/**
 * Formatte une date d'abonnement pour l'affichage
 * @param dateStr Chaîne de date à formater
 */
export function formatSubscriptionDate(dateStr: string | null | undefined): string {
  if (!isValidSubscriptionDate(dateStr)) return '-'

  try {
    return formatDate(dateStr)
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', dateStr, error)
    return '-'
  }
}

/**
 * Calcule le statut d'un abonnement en fonction des dates
 * @param startDate Date de début de l'abonnement
 * @param endDate Date de fin de l'abonnement
 */
export function getSubscriptionStatus(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): 'active' | 'expired' | 'pending' | 'unknown' {
  if (!startDate || !endDate) return 'unknown'

  try {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'unknown'
    }

    if (now < start) return 'pending'
    if (now > end) return 'expired'
    return 'active'
  } catch (error) {
    console.error("Erreur lors du calcul du statut d'abonnement:", error)
    return 'unknown'
  }
}

/**
 * Obtient la couleur associée à un statut d'abonnement
 * @param status Statut de l'abonnement
 */
export function getStatusColor(status: 'active' | 'expired' | 'pending' | 'unknown'): string {
  switch (status) {
    case 'active':
      return 'success'
    case 'expired':
      return 'danger'
    case 'pending':
      return 'info'
    default:
      return 'secondary'
  }
}

/**
 * Obtient le texte associé à un statut d'abonnement
 * @param status Statut de l'abonnement
 */
export function getStatusText(status: 'active' | 'expired' | 'pending' | 'unknown'): string {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'expired':
      return 'Expiré'
    case 'pending':
      return 'À venir'
    default:
      return 'Inconnu'
  }
}
