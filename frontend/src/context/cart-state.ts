import { createContext } from 'react'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

export type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isSyncing: boolean
  cartError: string
  addItem: (product: Product) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  clearCartError: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
