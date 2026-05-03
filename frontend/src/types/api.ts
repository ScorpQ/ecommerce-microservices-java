export type BackendProduct = {
  id: number
  brand: string
  category: string
  color: string
  description: string
  img: string | null
  labels: string
  price: number
  title: string
}

export type BackendPage<T> = {
  items: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  isLast: boolean
}
