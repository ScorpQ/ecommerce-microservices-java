import { apiFetch } from '@/lib/api-client'

export type OrderHistoryItem = {
  id: string
  status: string
  createdAt: string
  city: string
  total: number
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
    image?: string
  }>
}

export type CreateOrderPayload = {
  username: string
  firstName: string
  lastName: string
  streetAddress: string
  city: string
  country: string
  phone: string
  email: string
  paymentMethod: 'IYZICO'
  items: Array<{
    productId: number
    productName: string
    price: number
    quantity: number
  }>
  card: {
    cardHolderName: string
    cardNumber: string
    expireMonth: string
    expireYear: string
    cvc: string
  }
}

export type CreateOrderResponse = {
  id?: number | string
  orderId?: number | string
  paymentPageUrl?: string
  paymentUrl?: string
  checkoutFormContent?: string
  conversationId?: string
  status?: string
  data?: unknown
  [key: string]: unknown
}

export async function createOrder(
  payload: CreateOrderPayload,
  token?: string | null,
): Promise<CreateOrderResponse> {
  const response = await apiFetch('/api/orders/create', {
    method: 'POST',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Sipariş oluşturulamadı (${response.status}).`)
  }

  if (!text) return {}

  try {
    return JSON.parse(text) as CreateOrderResponse
  } catch {
    return { status: text }
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function getOrderItems(rawOrder: Record<string, unknown>) {
  const rawItems = rawOrder.items ?? rawOrder.orderItems ?? rawOrder.products
  const items = Array.isArray(rawItems) ? rawItems : []

  return items.map((rawItem) => {
    const item = asRecord(rawItem)
    const product = asRecord(item.product)

    return {
      productId: String(item.productId ?? product.id ?? ''),
      productName: asString(item.productName ?? item.name ?? product.title ?? product.name, 'Ürün'),
      price: asNumber(item.price ?? product.price),
      quantity: asNumber(item.quantity, 1),
      image: asString(item.image ?? item.img ?? product.img),
    }
  })
}

function normalizeOrderHistoryItem(rawValue: unknown): OrderHistoryItem {
  const rawOrder = asRecord(rawValue)
  const items = getOrderItems(rawOrder)
  const totalFromItems = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return {
    id: String(rawOrder.id ?? rawOrder.orderId ?? rawOrder.uuid ?? ''),
    status: asString(rawOrder.status ?? rawOrder.orderStatus, 'COMPLETED'),
    createdAt: asString(rawOrder.createdAt ?? rawOrder.createdDate ?? rawOrder.orderDate, ''),
    city: asString(rawOrder.city ?? rawOrder.shippingCity ?? rawOrder.deliveryCity),
    total: asNumber(rawOrder.total ?? rawOrder.totalPrice ?? rawOrder.amount, totalFromItems),
    items,
  }
}

export async function getCompletedOrders(token: string): Promise<OrderHistoryItem[]> {
  const response = await apiFetch('/api/orders/my/completed', {
    token,
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Sipariş geçmişi yüklenemedi (${response.status}).`)
  }

  if (!text) return []

  const parsed = JSON.parse(text) as unknown
  const parsedRecord = asRecord(parsed)
  const records = Array.isArray(parsed)
    ? parsed
    : asArray(parsedRecord.items).length > 0
      ? asArray(parsedRecord.items)
      : asArray(parsedRecord.content)

  return records.map(normalizeOrderHistoryItem)
}
