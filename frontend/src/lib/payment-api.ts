import { apiFetch } from '@/lib/api-client'

export type CreatePaymentPayload = {
  orderId: number
  username: string
  amount: number
  paymentMethod: 'IYZICO'
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  streetAddress: string
  country: string
  address: string
  card: {
    cardHolderName: string
    cardNumber: string
    expireMonth: string
    expireYear: string
    cvc: string
  }
  items: Array<{
    productId: number
    productName: string
    price: number
    quantity: number
    category1?: string
  }>
}

export type PaymentResponse = {
  paymentPageUrl?: string
  paymentUrl?: string
  checkoutFormContent?: string
  conversationId?: string
  status?: string
  [key: string]: unknown
}

export async function payOrder(
  payload: CreatePaymentPayload,
  token?: string | null,
): Promise<PaymentResponse> {
  const response = await apiFetch('/api/payments/pay', {
    method: 'POST',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Ödeme başlatılamadı (${response.status}).`)
  }

  if (!text) return {}

  try {
    return JSON.parse(text) as PaymentResponse
  } catch {
    return { status: text }
  }
}

export function getPaymentRedirectUrl(response: PaymentResponse) {
  const redirectUrl = response.paymentPageUrl ?? response.paymentUrl

  return typeof redirectUrl === 'string' && redirectUrl.startsWith('http') ? redirectUrl : null
}

export function getPaymentCheckoutFormContent(response: PaymentResponse) {
  return typeof response.checkoutFormContent === 'string' &&
    response.checkoutFormContent.trim().length > 0
    ? response.checkoutFormContent
    : null
}
