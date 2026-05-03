import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductImageFrame } from '@/components/product/product-image-frame'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/use-auth'
import { useCart } from '@/context/use-cart'
import { getProductById } from '@/lib/api'
import { formatCategoryLabel } from '@/lib/category-labels'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types/product'

function normalizeColorLabel(value: string) {
  return value
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ã§/g, 'ç')
    .replace(/Åž/g, 'Ş')
    .replace(/ÅŸ/g, 'ş')
    .replace(/Ä±/g, 'ı')
    .replace(/Ä°/g, 'İ')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã–/g, 'Ö')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ãœ/g, 'Ü')
    .replace(/ÄŸ/g, 'ğ')
    .replace(/Äž/g, 'Ğ')
}

function resolveColorSwatch(color?: string) {
  const normalizedColor = normalizeColorLabel(color ?? '').trim().toLowerCase()

  if (!normalizedColor) return 'hsl(215 16% 47%)'
  if (normalizedColor.includes('siyah')) return '#111827'
  if (normalizedColor.includes('beyaz')) return '#f8fafc'
  if (normalizedColor.includes('gri') || normalizedColor.includes('gümüş')) return '#94a3b8'
  if (normalizedColor.includes('lacivert')) return '#1e3a8a'
  if (normalizedColor.includes('mavi')) return '#2563eb'
  if (normalizedColor.includes('kırmızı')) return '#dc2626'
  if (normalizedColor.includes('yeşil')) return '#16a34a'
  if (normalizedColor.includes('pembe')) return '#ec4899'
  if (normalizedColor.includes('mor')) return '#7c3aed'
  if (normalizedColor.includes('turuncu')) return '#ea580c'
  if (normalizedColor.includes('sarı')) return '#facc15'
  if (normalizedColor.includes('bej')) return '#d6c2a1'
  if (normalizedColor.includes('kahverengi') || normalizedColor.includes('ceviz')) return '#7c4a2d'
  if (normalizedColor.includes('haki')) return '#6b7a2f'
  if (normalizedColor.includes('paslanmaz')) return '#9ca3af'
  if (normalizedColor.includes('uzay grisi')) return '#4b5563'
  if (
    normalizedColor.includes('çeşitli') ||
    normalizedColor.includes('renkli') ||
    normalizedColor.includes('çizgili')
  ) {
    return 'linear-gradient(135deg, #2563eb 0%, #ec4899 50%, #f59e0b 100%)'
  }

  return 'hsl(215 16% 47%)'
}

type ProductDetailState = {
  product: Product | null
  productId: string
  isLoading: boolean
  error: string
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState('')
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    productId: '',
    isLoading: true,
    error: '',
  })

  useEffect(() => {
    if (!id) return
    let isCurrentRequest = true

    getProductById(id)
      .then((result) => {
        if (!isCurrentRequest) return

        if (!result) {
          setState({
            product: null,
            productId: id,
            isLoading: false,
            error: 'Ürün bulunamadı.',
          })
          return
        }

        setState({ product: result, productId: id, isLoading: false, error: '' })
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return

        setState({
          product: null,
          productId: id,
          isLoading: false,
          error: requestError instanceof Error ? requestError.message : 'Ürün yüklenemedi.',
        })
      })

    return () => {
      isCurrentRequest = false
    }
  }, [id])

  const product = state.product
  const isLoading = state.isLoading || state.productId !== id
  const error = state.error
  const colorLabel = product?.color ? normalizeColorLabel(product.color) : ''
  const hasProductMeta = Boolean(product?.description || colorLabel || product?.features?.length)

  async function handleAddItem(productToAdd: Product) {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsAddingToCart(true)
    setCartError('')

    try {
      await addItem(productToAdd)
    } catch (addError) {
      setCartError(addError instanceof Error ? addError.message : 'Sepet güncellenemedi.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container grid gap-8 py-8 md:grid-cols-2 md:py-10">
        <Skeleton className="aspect-[4/3] w-full" />
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-5 h-10 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
          <Skeleton className="mt-8 h-11 w-48" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">{error || 'Ürün bulunamadı.'}</h1>
          <Button asChild className="mt-5">
            <Link to="/">Ürünlere dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Ürünlere dön
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <ProductImageFrame
          src={product.image}
          alt={product.name}
          className="aspect-[4/3]"
          enableZoom
        />

        <section>
          <div className="flex items-start justify-between gap-4">
            <h1 className="min-w-0 flex-1 text-3xl font-semibold tracking-tight">{product.name}</h1>
            <Badge className="shrink-0">{formatCategoryLabel(product.category)}</Badge>
          </div>
          {product.brand ? (
            <p className="mt-2 text-sm text-muted-foreground">{product.brand}</p>
          ) : null}

          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            ) : null}
          </div>

          <Button
            className="mt-6 w-full sm:w-auto"
            size="lg"
            onClick={() => void handleAddItem(product)}
            disabled={isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAddingToCart ? 'Ekleniyor...' : 'Sepete ekle'}
          </Button>
          {cartError ? <p className="mt-3 text-sm text-red-700">{cartError}</p> : null}

          {hasProductMeta ? (
            <div className="mt-8 rounded-lg border bg-card p-5">
              <h2 className="font-semibold">Ürün özellikleri</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                {product.description ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Açıklama</p>
                    <p>{product.description}</p>
                  </div>
                ) : null}

                {colorLabel ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Renk</p>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-4 w-4 rounded-full border border-slate-300 shadow-sm"
                        style={{ background: resolveColorSwatch(colorLabel) }}
                      />
                      <span>{colorLabel}</span>
                    </div>
                  </div>
                ) : null}

                {product.features && product.features.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Etiketler</p>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature) => (
                        <Badge key={feature} className="bg-slate-100 text-slate-700 border-slate-200">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
