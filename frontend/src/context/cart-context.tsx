import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CartContext } from '@/context/cart-state'
import { useAuth } from '@/context/use-auth'
import {
  addShoppingCartItem,
  getShoppingCartItems,
  removeShoppingCartItem,
  updateShoppingCartItemQuantity,
} from '@/lib/cart-api'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

const CART_STORAGE_KEY = 'minimal-commerce-cart'

function getStoredCart() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)

    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const previousTokenRef = useRef<string | null>(token)
  const [hydratedToken, setHydratedToken] = useState<string | null>(token ? '' : null)
  const [items, setItems] = useState<CartItem[]>(() => (token ? getStoredCart() : []))
  const [isMutating, setIsMutating] = useState(false)
  const [cartError, setCartError] = useState('')

  const syncCart = useCallback(async (activeToken: string) => {
    const cartItems = await getShoppingCartItems(activeToken)
    setItems(cartItems)
    setCartError('')
    setHydratedToken(activeToken)
    return cartItems
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    let isCurrentRequest = true

    if (previousTokenRef.current && !token) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      setItems([])
      setCartError('')
      setHydratedToken(null)
    }

    if (token) {
      getShoppingCartItems(token)
        .then((cartItems) => {
          if (!isCurrentRequest) return
          setItems(cartItems)
          setCartError('')
          setHydratedToken(token)
        })
        .catch((error) => {
          if (!isCurrentRequest) return
          setCartError(
            error instanceof Error ? error.message : 'Sepet bilgileri backend üzerinden alınamadı.',
          )
          setHydratedToken(token)
        })
    }

    previousTokenRef.current = token

    return () => {
      isCurrentRequest = false
    }
  }, [syncCart, token])

  const addItem = useCallback(
    async (product: Product) => {
      setCartError('')

      if (!token) {
        const message = 'Sepete eklemek için giriş yapmalısın.'
        setCartError(message)
        throw new Error(message)
      }

      const productId = Number(product.id)

      if (!Number.isFinite(productId)) {
        const message = 'Ürün id geçersiz olduğu için sepet güncellenemedi.'
        setCartError(message)
        throw new Error(message)
      }

      setIsMutating(true)

      try {
        await addShoppingCartItem(token, { productId, quantity: 1 })
        await syncCart(token)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sepet güncellenemedi.'
        setCartError(message)
        throw new Error(message, { cause: error })
      } finally {
        setIsMutating(false)
      }
    },
    [syncCart, token],
  )

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      setCartError('')

      if (!token) {
        const message = 'Sepeti güncellemek için giriş yapmalısın.'
        setCartError(message)
        throw new Error(message)
      }

      const productIdNumber = Number(productId)

      if (!Number.isFinite(productIdNumber)) {
        const message = 'Ürün id geçersiz olduğu için sepet güncellenemedi.'
        setCartError(message)
        throw new Error(message)
      }

      setIsMutating(true)

      try {
        await updateShoppingCartItemQuantity(token, productIdNumber, Math.max(1, quantity))
        await syncCart(token)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sepet adedi güncellenemedi.'
        setCartError(message)
        throw new Error(message, { cause: error })
      } finally {
        setIsMutating(false)
      }
    },
    [syncCart, token],
  )

  const removeItem = useCallback(
    async (productId: string) => {
      setCartError('')

      if (!token) {
        const message = 'Sepetten kaldırmak için giriş yapmalısın.'
        setCartError(message)
        throw new Error(message)
      }

      const productIdNumber = Number(productId)

      if (!Number.isFinite(productIdNumber)) {
        const message = 'Ürün id geçersiz olduğu için ürün kaldırılamadı.'
        setCartError(message)
        throw new Error(message)
      }

      setIsMutating(true)

      try {
        await removeShoppingCartItem(token, productIdNumber)
        await syncCart(token)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ürün sepetten kaldırılamadı.'
        setCartError(message)
        throw new Error(message, { cause: error })
      } finally {
        setIsMutating(false)
      }
    },
    [syncCart, token],
  )

  const clearCart = useCallback(async () => {
    if (!token) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      setItems([])
      return
    }

    setCartError('')
    setIsMutating(true)

    try {
      await Promise.all(items.map((item) => removeShoppingCartItem(token, Number(item.product.id))))
      window.localStorage.removeItem(CART_STORAGE_KEY)
      setItems([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sepet temizlenemedi.'
      setCartError(message)
      throw new Error(message, { cause: error })
    } finally {
      setIsMutating(false)
    }
  }, [items, token])

  const clearCartError = useCallback(() => {
    setCartError('')
  }, [])

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      isSyncing: isMutating || (Boolean(token) && hydratedToken !== token),
      cartError,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      clearCartError,
    }),
    [
      addItem,
      cartError,
      clearCart,
      clearCartError,
      hydratedToken,
      isMutating,
      items,
      removeItem,
      token,
      updateQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
