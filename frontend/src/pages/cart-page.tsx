import { Link } from 'react-router-dom'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/use-cart'

export function CartPage() {
  const { items, itemCount, subtotal, cartError, clearCartError } = useCart()

  if (items.length === 0) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border bg-card p-10 text-center">
          <h1 className="text-2xl font-semibold">Sepetin boş</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Beğendiğin ürünleri sepete ekle, adet ve toplam tutarı buradan kolayca yönet.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Alışverişe başla</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Sepet</h1>
        <p className="mt-2 text-muted-foreground">Sepetinde {itemCount} ürün var.</p>
      </div>

      {cartError ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-center justify-between gap-3">
            <p>{cartError}</p>
            <Button variant="ghost" size="sm" onClick={clearCartError}>
              Kapat
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border bg-card px-5">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </section>

        <CartSummary subtotal={subtotal} itemCount={itemCount} />
      </div>
    </div>
  )
}
