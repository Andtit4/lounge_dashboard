/**
 * Formate une date en format localisé (jour/mois/année)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '-'
  }

  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '-'

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) return '-'

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numAmount)
}
