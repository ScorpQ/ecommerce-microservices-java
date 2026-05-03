import type { Order } from '@/types/order'

const ORDERS_KEY = 'atelier-orders'

function readOrders(): Order[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function saveOrder(order: Order) {
  const orders = readOrders()
  writeOrders([order, ...orders])
}

export function getOrdersByUser(userId: string): Order[] {
  return readOrders().filter((order) => order.userId === userId)
}
