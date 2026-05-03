import { apiFetch } from '@/lib/api-client'
import { getProductById } from '@/lib/api'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

type AddCartItemPayload = {
  productId: number
  quantity: number
}

type RawCartItem = {
  productId: number
  quantity: number
  price?: number
  productName?: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeRawCartItems(payload: unknown): RawCartItem[] {
  const root = asRecord(payload)
  const rawItems = asArray(root.items ?? root.cartItems ?? root.shoppingCartItems ?? payload)

  return rawItems
    .map((item) => {
      const record = asRecord(item)

      return {
        productId: asNumber(record.productId),
        quantity: asNumber(record.quantity, 1),
        price: asNumber(record.price, 0),
        productName: asString(record.productName ?? record.name),
      }
    })
    .filter((item) => item.productId > 0 && item.quantity > 0)
}

function buildFallbackProduct(item: RawCartItem): Product {
  return {
    id: String(item.productId),
    name: item.productName || `Ürün #${item.productId}`,
    description: '',
    price: item.price ?? 0,
    category: '',
    image: '',
  }
}

async function enrichCartItem(item: RawCartItem): Promise<CartItem> {
  const product = await getProductById(String(item.productId))

  if (!product) {
    return {
      product: buildFallbackProduct(item),
      quantity: item.quantity,
    }
  }

  return {
    product: {
      ...product,
      price: item.price && item.price > 0 ? item.price : product.price,
      name: item.productName || product.name,
    },
    quantity: item.quantity,
  }
}

export async function addShoppingCartItem(token: string, payload: AddCartItemPayload) {
  const response = await apiFetch('/api/shopping-cart/items', {
    method: 'POST',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Sepet güncellenemedi (${response.status}).`)
  }
}

export async function updateShoppingCartItemQuantity(
  token: string,
  productId: number,
  quantity: number,
) {
  const response = await apiFetch(
    `/api/shopping-cart/items/${productId}?quantity=${encodeURIComponent(String(quantity))}`,
    {
      method: 'PUT',
      token,
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Sepet adedi güncellenemedi (${response.status}).`)
  }
}

export async function removeShoppingCartItem(token: string, productId: number) {
  const response = await apiFetch(`/api/shopping-cart/items/${productId}`, {
    method: 'DELETE',
    token,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Ürün sepetten kaldırılamadı (${response.status}).`)
  }
}

export async function getShoppingCartItems(token: string): Promise<CartItem[]> {
  const response = await apiFetch('/api/shopping-cart', {
    token,
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Sepet bilgileri alınamadı (${response.status}).`)
  }

  if (!text) {
    return []
  }

  const parsed = JSON.parse(text) as unknown
  const items = normalizeRawCartItems(parsed)

  return Promise.all(items.map(enrichCartItem))
}
