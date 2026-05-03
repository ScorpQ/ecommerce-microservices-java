import type { Product } from './product'

export type CartItem = {
  product: Product
  quantity: number
}

export type CheckoutForm = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  note: string
  cardHolderName: string
  cardNumber: string
  expireMonth: string
  expireYear: string
  cvc: string
}
