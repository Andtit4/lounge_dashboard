export type PricingPlans = {
  title: string
  model: string
  badges?: string[]
  description: string
  price: number
  priceMonth: number
  features: Feature[]
}

type Feature = {
  description: string
  isAvailable: boolean
}

const loungeFeatures = [
  'Accès aux salons standard',
  'Réservation à tarif réduit',
  'Réservation prioritaire',
  'Accompagnateurs gratuits',
  'Accès aux salons VIP',
  'Boissons gratuites',
  'Service de conciergerie',
]

export const pricingPlans: PricingPlans[] = [
  {
    title: 'Gratuit',
    model: 'Free',
    description: 'Accès basique pour découvrir les salons',
    price: 0,
    priceMonth: 0,
    features: [
      { description: loungeFeatures[0], isAvailable: true },
      { description: loungeFeatures[1], isAvailable: false },
      { description: loungeFeatures[2], isAvailable: false },
      { description: loungeFeatures[3], isAvailable: false },
      { description: loungeFeatures[4], isAvailable: false },
      { description: loungeFeatures[5], isAvailable: false },
      { description: loungeFeatures[6], isAvailable: false },
    ],
  },
  {
    title: 'Classic',
    model: 'Classic',
    description: 'Pour les voyageurs réguliers',
    price: 120,
    priceMonth: 14.99,
    features: [
      { description: loungeFeatures[0], isAvailable: true },
      { description: loungeFeatures[1], isAvailable: true },
      { description: loungeFeatures[2], isAvailable: true },
      { description: loungeFeatures[3], isAvailable: true },
      { description: loungeFeatures[4], isAvailable: false },
      { description: loungeFeatures[5], isAvailable: false },
      { description: loungeFeatures[6], isAvailable: false },
    ],
    badges: ['Populaire'],
  },
  {
    title: 'Premium',
    model: 'Premium',
    description: 'Expérience exclusive pour les voyageurs fréquents',
    price: 240,
    priceMonth: 29.99,
    features: loungeFeatures
      .map(() => ({ description: '', isAvailable: true }))
      .map((item, index) => ({
        description: loungeFeatures[index],
        isAvailable: true,
      })),
  },
]
