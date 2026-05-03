import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ProductImageFrame } from '@/components/product/product-image-frame'
import { useAuth } from '@/context/use-auth'
import { useCart } from '@/context/use-cart'
import { formatCategoryLabel } from '@/lib/category-labels'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types/product'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleAddItem() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsAdding(true)
    setError('')

    try {
      await addItem(product)
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Sepet güncellenemedi.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200/80 transition-colors hover:border-slate-300">
      <Link to={`/products/${product.id}`} className="block p-3 pb-0">
        <ProductImageFrame
          src={product.image}
          alt={product.name}
          className="aspect-[4/3]"
        />
      </Link>

      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/products/${product.id}`} className="block min-w-0 flex-1">
            <h2 className="line-clamp-2 min-h-11 text-base font-semibold leading-snug">
              {product.name}
            </h2>
          </Link>
          <Badge className="shrink-0">{formatCategoryLabel(product.category)}</Badge>
        </div>

        {product.brand ? (
          <p className="-mt-1 text-xs text-muted-foreground">{product.brand}</p>
        ) : null}

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-baseline gap-2 border-t pt-3">
          <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full">
          <Button className="w-full" onClick={handleAddItem} disabled={isAdding}>
            <ShoppingCart className="h-4 w-4" />
            {isAdding ? 'Ekleniyor...' : 'Sepete ekle'}
          </Button>
          {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
        </div>
      </CardFooter>
    </Card>
  )
}
