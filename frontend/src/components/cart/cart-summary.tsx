import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

type CartSummaryProps = {
  subtotal: number
  itemCount: number
  showCheckoutLink?: boolean
}

const SHIPPING_COST = 0

export function CartSummary({
  subtotal,
  itemCount,
  showCheckoutLink = true,
}: CartSummaryProps) {
  const total = subtotal + SHIPPING_COST

  return (
    <Card className="h-fit">
      <CardHeader>
        <h2 className="text-base font-semibold">Sipariş özeti</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ara toplam</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kargo</span>
            <span>{SHIPPING_COST === 0 ? 'Ücretsiz' : formatCurrency(SHIPPING_COST)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>Toplam</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Sepetinde {itemCount} ürün var. Tahmini teslimat 2-4 iş günü.
        </p>

        {showCheckoutLink ? (
          <Button asChild className="w-full" disabled={itemCount === 0}>
            <Link to="/checkout">Ödemeye geç</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
