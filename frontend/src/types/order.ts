export type OrderItem = {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

export type OrderStatus = 'preparing' | 'shipped' | 'delivered'

export type ShippingInfo = {
  fullName: string
  email: string
  address: string
  city: string
  note?: string
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  total: number
  shipping: ShippingInfo
  createdAt: string
  status: OrderStatus
}
