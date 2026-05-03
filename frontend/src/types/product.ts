export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  brand?: string
  color?: string
  labels?: string
  features?: string[]
  originalPrice?: number
  rating?: number
  stock?: number
}

export type ProductQuery = {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  color?: string
  label?: string
  page?: number
  pageSize?: number
}

export type ProductPage = {
  products: Product[]
  total: number
  page: number
  pageSize: number
}
