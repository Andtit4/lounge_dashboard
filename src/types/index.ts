// Types pour l'API LoungeInAfrica

export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  isAdmin: boolean
  role?: UserRole
  subscriptionType?: string | null
  subscriptionExpiryDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Lounge {
  id: string
  name: string
  location: string
  airport: string
  country: string
  description: string
  price: number
  classicDiscountPrice: number
  premiumDiscountPrice: number
  imageUrl?: string
  amenities?: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  userId: string
  user?: User
  loungeId: string
  lounge?: Lounge
  bookingDate: Date
  numberOfGuests: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  specialRequests?: string
  paymentId?: string
  isPaid: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  user?: User
  type: 'CLASSIC' | 'PREMIUM'
  startDate: Date
  endDate: Date
  price: number
  isActive: boolean
  paymentId?: string
  isPaid: boolean
  hasUsedFreeLoungeAccess: boolean
  createdAt: Date
  updatedAt: Date
}

// DTOs pour la création et la mise à jour

export interface CreateUserDto {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  role?: UserRole
  isAdmin?: boolean
  subscriptionType?: string | null
  subscriptionExpiryDate?: Date | null
}

export interface CreateLoungeDto {
  name: string
  location: string
  airport: string
  country: string
  description: string
  price: number
  classicDiscountPrice: number
  premiumDiscountPrice: number
  imageUrl?: string
  amenities?: string
}

export interface CreateBookingDto {
  userId: string
  loungeId: string
  bookingDate: Date
  numberOfGuests: number
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalPrice?: number
  specialRequests?: string
}

export interface CreateSubscriptionDto {
  userId: string
  type: 'CLASSIC' | 'PREMIUM'
  startDate: Date
  endDate: Date
  price: number
  isActive?: boolean
}

// Étendre avec les types UpdateDto si nécessaire
export type UpdateUserDto = Partial<CreateUserDto>
export type UpdateLoungeDto = Partial<CreateLoungeDto>
export type UpdateBookingDto = Partial<CreateBookingDto>
export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>

// Réponse du statut d'abonnement
export interface SubscriptionStatus {
  isActive: boolean
  daysRemaining: number
}
