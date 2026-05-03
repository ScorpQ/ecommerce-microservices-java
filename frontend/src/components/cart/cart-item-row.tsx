import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/use-cart'
import { formatCategoryLabel } from '@/lib/category-labels'
import { formatCurrency } from '@/lib/format'
import type { CartItem } from '@/types/cart'

type CartItemRowProps = {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { product, quantity } = item
  const { updateQuantity, removeItem, isSyncing } = useCart()

  async function handleUpdateQuantity(nextQuantity: number) {
    try {
      await updateQuantity(product.id, nextQuantity)
    } catch {
      // cart error state is handled centrally in cart context
    }
  }

  async function handleRemoveItem() {
    try {
      await removeItem(product.id)
    } catch {
      // cart error state is handled centrally in cart context
    }
  }

  return (
    <article className="grid gap-4 border-b py-5 last:border-b-0 sm:grid-cols-[96px_1fr_auto]">
      <Link to={`/products/${product.id}`} className="block overflow-hidden rounded-md bg-muted">
        <img src={product.image} alt={product.name} className="h-24 w-full object-cover" />
      </Link>

      <div>
        <Link to={`/products/${product.id}`}>
          <h2 className="font-semibold">{product.name}</h2>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCategoryLabel(product.category)}
        </p>
        <p className="mt-3 text-sm font-medium">{formatCurrency(product.price)}</p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleUpdateQuantity(quantity - 1)}
            disabled={quantity === 1 || isSyncing}
            aria-label="Adedi azalt"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleUpdateQuantity(quantity + 1)}
            disabled={isSyncing || (product.stock !== undefined && quantity >= product.stock)}
            aria-label="Adedi artır"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => void handleRemoveItem()} disabled={isSyncing}>
          <Trash2 className="h-4 w-4" />
          Kaldır
        </Button>
      </div>
    </article>
  )
}
