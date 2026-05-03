import { CreditCard, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/use-auth'
import { useCart } from '@/context/use-cart'
import { IYZICO_TEST_CARD } from '@/lib/iyzico-test-card'
import {
  getPaymentCheckoutFormContent,
  getPaymentRedirectUrl,
  payOrder,
  type CreatePaymentPayload,
} from '@/lib/payment-api'
import { createOrder, type CreateOrderPayload, type CreateOrderResponse } from '@/lib/order-api'
import type { CheckoutForm } from '@/types/cart'

const initialForm: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Turkey',
  note: '',
  cardHolderName: IYZICO_TEST_CARD.cardHolderName,
  cardNumber: IYZICO_TEST_CARD.cardNumber,
  expireMonth: IYZICO_TEST_CARD.expireMonth,
  expireYear: IYZICO_TEST_CARD.expireYear,
  cvc: IYZICO_TEST_CARD.cvc,
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts.shift() ?? ''
  const lastName = parts.join(' ') || firstName

  return { firstName, lastName }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function getOrderId(response: CreateOrderResponse) {
  const directOrderId = response.orderId ?? response.id
  if (typeof directOrderId === 'number' && Number.isFinite(directOrderId)) {
    return directOrderId
  }

  if (typeof directOrderId === 'string') {
    const parsedOrderId = Number(directOrderId)
    if (Number.isFinite(parsedOrderId)) {
      return parsedOrderId
    }
  }

  const data = asRecord(response.data)
  const nestedOrderId = data.orderId ?? data.id

  if (typeof nestedOrderId === 'number' && Number.isFinite(nestedOrderId)) {
    return nestedOrderId
  }

  if (typeof nestedOrderId === 'string') {
    const parsedOrderId = Number(nestedOrderId)
    if (Number.isFinite(parsedOrderId)) {
      return parsedOrderId
    }
  }

  return null
}

function openPaymentResult(response: {
  paymentPageUrl?: string
  paymentUrl?: string
  checkoutFormContent?: string
}) {
  const redirectUrl = getPaymentRedirectUrl(response)
  if (redirectUrl) {
    window.location.assign(redirectUrl)
    return true
  }

  const checkoutFormContent = getPaymentCheckoutFormContent(response)
  if (checkoutFormContent) {
    document.open()
    document.write(checkoutFormContent)
    document.close()
    return true
  }

  return false
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { items, itemCount, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<CheckoutForm>(() => ({
    ...initialForm,
    email: user?.email ?? '',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function buildOrderPayload(): CreateOrderPayload {
    const { firstName, lastName } = splitFullName(form.fullName)

    return {
      username: user?.username ?? '',
      firstName,
      lastName,
      streetAddress: form.address,
      city: form.city,
      country: form.country,
      phone: form.phone,
      email: form.email,
      paymentMethod: 'IYZICO',
      items: items.map((item) => ({
        productId: Number(item.product.id),
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      card: {
        cardHolderName: form.cardHolderName,
        cardNumber: form.cardNumber.replace(/\s+/g, ''),
        expireMonth: form.expireMonth,
        expireYear: form.expireYear,
        cvc: form.cvc,
      },
    }
  }

  function buildPaymentPayload(orderId: number): CreatePaymentPayload {
    const { firstName, lastName } = splitFullName(form.fullName)

    return {
      orderId,
      username: user?.username ?? '',
      amount: subtotal,
      paymentMethod: 'IYZICO',
      firstName,
      lastName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      streetAddress: form.address,
      country: form.country,
      address: form.address,
      card: {
        cardHolderName: form.cardHolderName,
        cardNumber: form.cardNumber.replace(/\s+/g, ''),
        expireMonth: form.expireMonth,
        expireYear: form.expireYear,
        cvc: form.cvc,
      },
      items: items.map((item) => ({
        productId: Number(item.product.id),
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category1: item.product.category,
      })),
    }
  }

  async function finalizeSuccessfulCheckout(
    response: {
      paymentPageUrl?: string
      paymentUrl?: string
      checkoutFormContent?: string
    },
    fallbackRedirect: () => void,
  ) {
    await clearCart()

    if (!openPaymentResult(response)) {
      fallbackRedirect()
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const orderResponse = await createOrder(buildOrderPayload(), token)

      if (
        getPaymentRedirectUrl(orderResponse) !== null ||
        getPaymentCheckoutFormContent(orderResponse) !== null
      ) {
        await finalizeSuccessfulCheckout(orderResponse, () => navigate('/order-success'))
        return
      }

      const orderId = getOrderId(orderResponse)

      if (orderId !== null) {
        const paymentResponse = await payOrder(buildPaymentPayload(orderId), token)

        if (
          getPaymentRedirectUrl(paymentResponse) !== null ||
          getPaymentCheckoutFormContent(paymentResponse) !== null
        ) {
          await finalizeSuccessfulCheckout(paymentResponse, () => navigate('/order-success'))
          return
        }
      }

      await clearCart()
      navigate('/order-success')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Sipariş oluşturulamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled =
    itemCount === 0 ||
    !form.fullName ||
    !form.email ||
    !form.phone ||
    !form.address ||
    !form.city ||
    !form.country ||
    !form.cardHolderName ||
    !form.cardNumber ||
    !form.expireMonth ||
    !form.expireYear ||
    !form.cvc ||
    isSubmitting

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Ödeme</h1>
        <p className="mt-2 text-muted-foreground">
          Teslimat ve kart bilgilerini gir, siparişini oluşturup ödemeyi başlat.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submitOrder} className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold">Teslimat bilgileri</h2>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="Ad soyad"
                aria-label="Ad soyad"
                required
              />
              <Input
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                type="email"
                placeholder="E-posta"
                aria-label="E-posta"
                required
              />
              <Input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="Telefon"
                aria-label="Telefon"
                required
              />
              <Input
                className="sm:col-span-2"
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="Adres"
                aria-label="Adres"
                required
              />
              <Input
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Şehir"
                aria-label="Şehir"
                required
              />
              <Input
                value={form.country}
                onChange={(event) => updateField('country', event.target.value)}
                placeholder="Ülke"
                aria-label="Ülke"
                required
              />
              <Input
                className="sm:col-span-2"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Sipariş notu (opsiyonel)"
                aria-label="Sipariş notu"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h2 className="text-base font-semibold">Iyzico kart bilgileri</h2>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                value={form.cardHolderName}
                onChange={(event) => updateField('cardHolderName', event.target.value)}
                placeholder="Kart üzerindeki isim"
                aria-label="Kart üzerindeki isim"
                autoComplete="cc-name"
                required
              />
              <Input
                className="sm:col-span-2"
                value={form.cardNumber}
                onChange={(event) => updateField('cardNumber', event.target.value)}
                placeholder="Kart numarası"
                aria-label="Kart numarası"
                autoComplete="cc-number"
                inputMode="numeric"
                required
              />
              <Input
                value={form.expireMonth}
                onChange={(event) => updateField('expireMonth', event.target.value)}
                placeholder="Ay"
                aria-label="Son kullanma ayı"
                autoComplete="cc-exp-month"
                inputMode="numeric"
                maxLength={2}
                required
              />
              <Input
                value={form.expireYear}
                onChange={(event) => updateField('expireYear', event.target.value)}
                placeholder="Yıl"
                aria-label="Son kullanma yılı"
                autoComplete="cc-exp-year"
                inputMode="numeric"
                maxLength={4}
                required
              />
              <Input
                value={form.cvc}
                onChange={(event) => updateField('cvc', event.target.value)}
                placeholder="CVC"
                aria-label="CVC"
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
                required
              />
              <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Lock className="h-4 w-4 text-accent" />
                  Test ödeme
                </div>
                <p className="mt-2">
                  Kart alanları env üzerinden varsayılan test bilgileriyle doldurulur.
                </p>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitDisabled}>
            {isSubmitting ? 'Sipariş hazırlanıyor...' : 'Siparişi oluştur'}
          </Button>
        </form>

        <CartSummary
          subtotal={subtotal}
          itemCount={items.length === 0 ? 0 : itemCount}
          showCheckoutLink={false}
        />
      </div>
    </div>
  )
}
