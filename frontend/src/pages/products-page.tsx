import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductGrid } from '@/components/product/product-grid'
import { Pagination } from '@/components/product/pagination'
import { Button } from '@/components/ui/button'
import { getCategories, getProducts } from '@/lib/api'
import type { ProductPage } from '@/types/product'

const PAGE_SIZE = 6

function collectUniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort(
    (left, right) => left.localeCompare(right, 'tr'),
  )
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const color = searchParams.get('color') ?? ''
  const label = searchParams.get('label') ?? ''
  const search = searchParams.get('search') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const page = Number(searchParams.get('page')) || 1
  const [productPage, setProductPage] = useState<ProductPage | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [settledQueryKey, setSettledQueryKey] = useState('')
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState(search)

  function patchParams(patch: Record<string, string>) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(patch).forEach(([key, value]) => {
          if (value) {
            next.set(key, value)
          } else {
            next.delete(key)
          }
        })
        return next
      },
      { replace: true },
    )
  }

  const query = useMemo(
    () => ({
      search,
      category,
      color,
      label,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [category, color, label, maxPrice, minPrice, page, search],
  )
  const queryKey = useMemo(() => JSON.stringify(query), [query])

  useEffect(() => {
    let isCurrentRequest = true

    getCategories()
      .then((result) => {
        if (isCurrentRequest) {
          setCategories(result)
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setCategories([])
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [])

  useEffect(() => {
    let isCurrentRequest = true

    getProducts(query)
      .then((result) => {
        if (isCurrentRequest) {
          setProductPage(result)
          setError('')
          setSettledQueryKey(queryKey)
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrentRequest) {
          setError(requestError instanceof Error ? requestError.message : 'Bir hata oluştu.')
          setSettledQueryKey(queryKey)
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [query, queryKey])

  const availableColors = useMemo(
    () => collectUniqueValues((productPage?.products ?? []).map((product) => product.color)),
    [productPage],
  )
  const availableLabels = useMemo(
    () =>
      collectUniqueValues(
        (productPage?.products ?? []).flatMap((product) => product.features ?? []),
      ),
    [productPage],
  )

  const isLoading = settledQueryKey !== queryKey
  const activeError = settledQueryKey === queryKey ? error : ''
  const pageCount = productPage ? Math.ceil(productPage.total / productPage.pageSize) : 0

  function resetFilters() {
    setSearchParams({}, { replace: true })
  }

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateSearch(value: string) {
    setSearchInput(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      patchParams({ search: value, page: '' })
    }, 500)
  }

  function updateCategory(value: string) {
    patchParams({ category: value, page: '' })
  }

  function updateColor(value: string) {
    patchParams({ color: value, page: '' })
  }

  function updateLabel(value: string) {
    patchParams({ label: value, page: '' })
  }

  function updateMinPrice(value: string) {
    patchParams({ minPrice: value, page: '' })
  }

  function updateMaxPrice(value: string) {
    patchParams({ maxPrice: value, page: '' })
  }

  function updatePage(value: number) {
    patchParams({ page: value === 1 ? '' : String(value) })
  }

  return (
    <div className="container py-8 md:py-10">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-accent">Yeni sezon</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Günlük hayata yakışan, özenle seçilmiş ürünler.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Çanta, ev, aksesuar ve giyim kategorilerinde sade tasarım ve dayanıklı
          malzemeyle öne çıkan ürünleri keşfet.
        </p>
      </section>

      <div className="space-y-6">
        <ProductFilters
          categories={categories}
          colors={availableColors}
          labels={availableLabels}
          search={searchInput}
          category={category}
          color={color}
          label={label}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSearchChange={updateSearch}
          onCategoryChange={updateCategory}
          onColorChange={updateColor}
          onLabelChange={updateLabel}
          onMinPriceChange={updateMinPrice}
          onMaxPriceChange={updateMaxPrice}
          onReset={resetFilters}
        />

        {activeError ? (
          <div className="rounded-lg border border-destructive/30 bg-red-50 p-6 text-sm text-red-800">
            <p>{activeError}</p>
            <Button className="mt-4" variant="outline" onClick={resetFilters}>
              Tekrar dene
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>{productPage?.total ?? 0} ürün</span>
              <span>Sayfa {productPage?.page ?? page}</span>
            </div>
            <ProductGrid products={productPage?.products ?? []} isLoading={isLoading} />
            <Pagination page={page} pageCount={pageCount} onPageChange={updatePage} />
          </>
        )}
      </div>
    </div>
  )
}
