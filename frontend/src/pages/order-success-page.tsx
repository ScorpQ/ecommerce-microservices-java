import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function OrderSuccessPage() {
  return (
    <div className="container py-10">
      <section className="mx-auto max-w-xl rounded-lg border bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-5 text-2xl font-semibold">Siparişin alındı</h1>
        <p className="mt-3 text-muted-foreground">
          Sipariş detaylarını e-posta adresine gönderdik. Kargon 2-4 iş günü içinde elinde olacak.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Alışverişe devam et</Link>
        </Button>
      </section>
    </div>
  )
}
