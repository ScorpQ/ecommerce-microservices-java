import { LogOut, Package, ShoppingCart, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/use-auth'
import { useCart } from '@/context/use-cart'
import { getCategories } from '@/lib/api'
import { formatCategoryLabel } from '@/lib/category-labels'

type UnderlineState = { left: number; top: number; width: number; opacity: number }
type NavKey = 'products' | 'categories' | 'support'

export function SiteHeader() {
  const { itemCount } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState<string[]>([])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)

  const navRef = useRef<HTMLElement | null>(null)
  const productsRef = useRef<HTMLAnchorElement | null>(null)
  const categoriesRef = useRef<HTMLDivElement | null>(null)
  const supportRef = useRef<HTMLAnchorElement | null>(null)
  const [hoveredKey, setHoveredKey] = useState<NavKey | null>(null)
  const [hasMeasured, setHasMeasured] = useState(false)
  const [underline, setUnderline] = useState<UnderlineState>({
    left: 0,
    top: 0,
    width: 0,
    opacity: 0,
  })

  const isOnHome = location.pathname === '/'
  const hasCategoryParam = searchParams.has('category')
  const isProductsActive = isOnHome && !hasCategoryParam
  const isCategoriesActive = isOnHome && hasCategoryParam
  const activeKey: NavKey | null = isProductsActive
    ? 'products'
    : isCategoriesActive
      ? 'categories'
      : null
  const targetKey = hoveredKey ?? activeKey

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function recalculate() {
      const targetEl =
        targetKey === 'products'
          ? productsRef.current
          : targetKey === 'categories'
            ? categoriesRef.current
            : targetKey === 'support'
              ? supportRef.current
              : null

      if (!targetEl || !navRef.current) {
        setUnderline((current) => ({ ...current, opacity: 0 }))
        return
      }

      const navRect = navRef.current.getBoundingClientRect()
      const itemRect = targetEl.getBoundingClientRect()
      setUnderline({
        left: itemRect.left - navRect.left,
        top: itemRect.bottom - navRect.top + 4,
        width: itemRect.width,
        opacity: 1,
      })
      setHasMeasured(true)
    }

    recalculate()
    window.addEventListener('resize', recalculate)
    return () => window.removeEventListener('resize', recalculate)
  }, [targetKey])

  function selectCategory(category: string) {
    setIsCategoryOpen(false)
    navigate(`/?category=${encodeURIComponent(category)}`)
  }

  function handleLogout() {
    logout()
    setIsAccountOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Atelier ana sayfa">
          <img
            src="/atelier-logo.png"
            alt=""
            className="block h-10 w-auto object-contain md:h-11"
          />
          <span className="sr-only">Atelier</span>
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-6 text-sm text-muted-foreground md:flex"
          onMouseLeave={() => setHoveredKey(null)}
        >
          <Link
            to="/"
            ref={productsRef}
            onMouseEnter={() => setHoveredKey('products')}
            className={
              isProductsActive ? 'text-foreground' : 'transition-colors hover:text-foreground'
            }
          >
            Ürünler
          </Link>

          <div
            ref={categoriesRef}
            className="relative"
            onMouseEnter={() => {
              setIsCategoryOpen(true)
              setHoveredKey('categories')
            }}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <button
              type="button"
              aria-expanded={isCategoryOpen}
              aria-haspopup="menu"
              className={
                isCategoriesActive
                  ? 'text-foreground'
                  : 'transition-colors hover:text-foreground'
              }
            >
              Kategoriler
            </button>

            {isCategoryOpen ? (
              <div
                role="menu"
                className="absolute left-1/2 top-full z-30 w-[520px] -translate-x-1/2 pt-3"
              >
                <div className="grid grid-cols-3 gap-x-6 gap-y-1 rounded-md border bg-background p-4 shadow-lg">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => selectCategory('')}
                    className="group flex w-full items-center py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground"
                  >
                    <span className="inline-flex border-b border-transparent pb-0.5 transition-colors group-hover:border-foreground">
                      Tümü
                    </span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      role="menuitem"
                      onClick={() => selectCategory(category)}
                      className="group flex w-full items-center py-2 text-left text-sm text-foreground transition-colors hover:text-foreground"
                    >
                      <span className="inline-flex border-b border-transparent pb-0.5 transition-colors group-hover:border-foreground">
                        {formatCategoryLabel(category)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <a
            ref={supportRef}
            href="#support"
            onMouseEnter={() => setHoveredKey('support')}
            className="transition-colors hover:text-foreground"
          >
            Destek
          </a>

          <span
            aria-hidden
            className={`pointer-events-none absolute h-[2px] rounded-full bg-foreground ease-out ${
              hasMeasured ? 'transition-all duration-300' : ''
            }`}
            style={{
              left: `${underline.left}px`,
              top: `${underline.top}px`,
              width: `${underline.width}px`,
              opacity: underline.opacity,
            }}
          />
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div ref={accountRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Hesap"
                onClick={() => setIsAccountOpen((open) => !open)}
              >
                <User className="h-4 w-4" />
              </Button>
              {isAccountOpen ? (
                <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-md border bg-background p-1 shadow-lg">
                  <div className="border-b px-3 py-2">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Package className="h-4 w-4" />
                    Hesabım
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış yap
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Giriş yap">
              <Link to="/login">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="h-9 overflow-visible px-3">
            <Link
              to="/cart"
              aria-label={itemCount > 0 ? `Sepet, ${itemCount} ürün` : 'Sepet'}
              className="inline-flex items-center gap-2 overflow-visible text-sm font-medium leading-none"
            >
              <span>Sepet</span>
              <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 ? (
                  <span
                    aria-hidden
                    className="absolute -right-1.5 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-background tabular-nums"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                ) : null}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
