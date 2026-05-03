import { Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/use-auth'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCompletedOrders, type OrderHistoryItem } from '@/lib/order-api'
import { formatOrderStatus } from '@/lib/order-status'

export function AccountPage() {
  const { user, token, logout } = useAuth()
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState('')

  useEffect(() => {
    if (!token) return
    let isCurrentRequest = true

    getCompletedOrders(token)
      .then((result) => {
        if (!isCurrentRequest) return
        setOrders(result)
        setOrdersError('')
      })
      .catch((error) => {
        if (!isCurrentRequest) return
        setOrdersError(error instanceof Error ? error.message : 'Sipariş geçmişi yüklenemedi.')
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoadingOrders(false)
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [token])

  if (!user) return null

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Hesabım</h1>
        <p className="mt-2 text-muted-foreground">
          Hesap bilgilerini ve tamamlanan siparişlerini buradan takip edebilirsin.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <h2 className="text-base font-semibold">Profil</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Kullanıcı adı</p>
              <p className="mt-1 text-sm font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">E-posta</p>
              <p className="mt-1 break-all text-sm font-medium">{user.email || '-'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={logout}>
              Çıkış yap
            </Button>
          </CardContent>
        </Card>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Geçmiş siparişlerim</h2>
            <span className="text-sm text-muted-foreground">{orders.length} sipariş</span>
          </div>

          {isLoadingOrders ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : ordersError ? (
            <Card>
              <CardContent className="py-8">
                <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {ordersError}
                </p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Tamamlanmış siparişin yok</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Tamamlanan siparişlerin burada listelenecek.
                </p>
                <Button asChild className="mt-5">
                  <Link to="/">Alışverişe başla</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id || `${order.createdAt}-${order.total}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Sipariş No · {(order.id || 'ORDER').slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {order.createdAt ? formatDate(order.createdAt) : 'Tarih yok'}
                      </p>
                    </div>
                    <Badge>{formatOrderStatus(order.status)}</Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {order.items.map((item) => (
                        <li
                          key={`${order.id}-${item.productId}-${item.productName}`}
                          className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} adet · {formatCurrency(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                      <span className="text-muted-foreground">
                        Teslimat: {order.city || 'Belirtilmedi'}
                      </span>
                      <span className="text-base font-semibold">
                        Toplam {formatCurrency(order.total)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
