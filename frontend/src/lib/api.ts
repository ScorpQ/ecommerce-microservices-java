import { apiFetch, API_BASE_URL } from '@/lib/api-client'
import type { BackendPage, BackendProduct } from '@/types/api'
import type { Product, ProductPage, ProductQuery } from '@/types/product'

let categoriesCache: string[] | null = null
let categoriesPromise: Promise<string[]> | null = null

function resolveImage(img: string | null): string {
  if (!img) return ''
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img
  }
  return `${API_BASE_URL}${img.startsWith('/') ? img : `/${img}`}`
}

function adaptProduct(item: BackendProduct): Product {
  const features = item.labels
    ? item.labels
        .split(',')
        .map((label) => label.trim())
        .filter(Boolean)
    : undefined

  return {
    id: String(item.id),
    name: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    image: resolveImage(item.img),
    brand: item.brand,
    color: item.color,
    labels: item.labels,
    features,
  }
}

function paginateProducts(products: Product[], page: number, pageSize: number): ProductPage {
  const safePage = Math.max(1, page)
  const startIndex = (safePage - 1) * pageSize
  const pagedProducts = products.slice(startIndex, startIndex + pageSize)

  return {
    products: pagedProducts,
    total: products.length,
    page: safePage,
    pageSize,
  }
}

function matchesProductQuery(product: Product, query: ProductQuery) {
  const matchesCategory = query.category ? product.category === query.category : true
  const matchesColor = query.color ? product.color === query.color : true
  const matchesLabel = query.label ? product.features?.includes(query.label) ?? false : true
  const matchesMinPrice =
    typeof query.minPrice === 'number' ? product.price >= query.minPrice : true
  const matchesMaxPrice =
    typeof query.maxPrice === 'number' ? product.price <= query.maxPrice : true

  return matchesCategory && matchesColor && matchesLabel && matchesMinPrice && matchesMaxPrice
}

async function fetchPagedProductsPage(
  query: ProductQuery,
  requestedPage: number,
  requestedSize: number,
): Promise<BackendPage<BackendProduct>> {
  const params = new URLSearchParams()
  params.set('page', String(Math.max(0, requestedPage)))
  params.set('size', String(requestedSize))

  if (query.category) params.set('category', query.category)
  if (typeof query.minPrice === 'number') params.set('minPrice', String(query.minPrice))
  if (typeof query.maxPrice === 'number') params.set('maxPrice', String(query.maxPrice))

  const response = await apiFetch(`/api/product/paged?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Ürünler yüklenemedi.')
  }

  return (await response.json()) as BackendPage<BackendProduct>
}

async function searchProducts(query: ProductQuery): Promise<ProductPage> {
  const requestedPage = query.page ?? 1
  const requestedSize = query.pageSize ?? 6
  const params = new URLSearchParams()
  params.set('q', query.search ?? '')

  const response = await apiFetch(`/api/product/search?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Ürünler yüklenemedi.')
  }

  const data = (await response.json()) as BackendProduct[]
  const products = data.map(adaptProduct)
  const filteredProducts = products.filter((product) => matchesProductQuery(product, query))

  return paginateProducts(filteredProducts, requestedPage, requestedSize)
}

async function getPagedProducts(query: ProductQuery): Promise<ProductPage> {
  const requestedPage = query.page ?? 1
  const requestedSize = query.pageSize ?? 6
  const hasClientOnlyFilters = Boolean(query.color || query.label)

  if (!hasClientOnlyFilters) {
    const data = await fetchPagedProductsPage(query, requestedPage - 1, requestedSize)

    return {
      products: data.items.map(adaptProduct),
      total: data.totalElements,
      page: data.page + 1,
      pageSize: data.size,
    }
  }

  const firstPage = await fetchPagedProductsPage(query, 0, 100)
  const allItems = [...firstPage.items]

  for (let currentPage = 1; currentPage < firstPage.totalPages; currentPage += 1) {
    const nextPage = await fetchPagedProductsPage(query, currentPage, 100)
    allItems.push(...nextPage.items)
  }

  const filteredProducts = allItems.map(adaptProduct).filter((product) => matchesProductQuery(product, query))

  return paginateProducts(filteredProducts, requestedPage, requestedSize)
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const trimmedSearch = query.search?.trim()

  if (trimmedSearch) {
    return searchProducts({ ...query, search: trimmedSearch })
  }

  return getPagedProducts(query)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const response = await apiFetch(`/api/product/${id}`)

  if (response.status === 404) return undefined

  if (!response.ok) {
    throw new Error('Ürün yüklenemedi.')
  }

  const data = (await response.json()) as BackendProduct
  return adaptProduct(data)
}

export async function getCategories(): Promise<string[]> {
  if (categoriesCache) return categoriesCache
  if (categoriesPromise) return categoriesPromise

  categoriesPromise = (async () => {
    try {
      const response = await apiFetch('/api/product/categories')

      if (!response.ok) {
        console.warn('Kategoriler çekilemedi, status:', response.status)
        return []
      }

      const data = (await response.json()) as unknown
      const categories = Array.isArray(data)
        ? data.filter((item): item is string => typeof item === 'string' && item.length > 0)
        : []

      categoriesCache = categories
      return categories
    } catch (error) {
      console.warn('Kategoriler çekilemedi:', error)
      return []
    } finally {
      categoriesPromise = null
    }
  })()

  return categoriesPromise
}
