// Tipos principais do sistema de aluguel de motos

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  examples: string[]
}

export interface Motorcycle {
  id: string
  name: string
  brand: string
  model: string
  year: number
  categoryId: string
  category: Category
  images: string[]
  pricePerDay: number
  securityDeposit: number
  specifications: {
    engine: string
    power: string
    transmission: string
    fuelCapacity: string
    seatHeight: string
    weight: string
  }
  features: string[]
  available: boolean
}

export interface Insurance {
  id: string
  name: string
  description: string
  pricePerDay: number
  coverage: string[]
  isBasic: boolean
}

export interface Accessory {
  id: string
  name: string
  description: string
  pricePerDay: number
  image?: string
  maxQuantity: number
}

export interface Customer {
  id: string
  fullName: string
  email: string
  phone: string
  cpf: string
  cnh: string
  documents: {
    cnhFront?: string
    cnhBack?: string
    selfie?: string
    verified: boolean
  }
}

export interface ReservationAccessory {
  accessoryId: string
  accessory: Accessory
  quantity: number
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Reservation {
  id: string
  motorcycleId: string
  motorcycle: Motorcycle
  customerId: string
  customer: Customer
  pickupDate: Date
  returnDate: Date
  totalDays: number
  insurance: Insurance
  accessories: ReservationAccessory[]
  pricing: {
    dailyRate: number
    insuranceCost: number
    accessoriesCost: number
    subtotal: number
    securityDeposit: number
    total: number
  }
  status: ReservationStatus
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: Date
}

export interface BookingFormData {
  pickupDate: Date | null
  returnDate: Date | null
  motorcycleId: string
  insuranceId: string
  accessories: { accessoryId: string; quantity: number }[]
  customer: {
    fullName: string
    email: string
    phone: string
    cpf: string
    cnh: string
  }
  documents: {
    cnhFront: File | null
    cnhBack: File | null
    selfie: File | null
  }
}

export interface SearchFilters {
  pickupDate: Date | null
  returnDate: Date | null
  categoryId: string | null
}
