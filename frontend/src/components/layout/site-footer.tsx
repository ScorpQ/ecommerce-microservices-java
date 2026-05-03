import {
  ArrowUpRight,
  Headphones,
  PackageSearch,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/use-auth'

const shopLinks = [
  { label: 'Tüm ürünler', to: '/' },
  { label: 'Kategoriler', to: '/?category=' },
  { label: 'Sepetim', to: '/cart' },
]

const accountLinks = [{ label: 'Siparişlerim', to: '/account' }]

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Güvenli ödeme',
    description: 'Ödeme adımları korumalı oturum üzerinden ilerler.',
  },
  {
    icon: PackageSearch,
    title: 'Sipariş takibi',
    description: 'Tamamlanan siparişler hesabından takip edilir.',
  },
  {
    icon: Headphones,
    title: 'Müşteri desteği',
    description: 'Sepet, teslimat ve hesap soruları için tek düzen sunulur.',
  },
]

export function SiteFooter() {
  const { isAuthenticated } = useAuth()

  return (
    <footer id="support" className="border-t border-white/10 bg-primary text-primary-foreground">
      <div className="container py-12 md:py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-5">
            <Badge className="h-7 rounded-full border-white/15 bg-white/10 px-3 text-[10px] tracking-[0.16em] text-white">
              Atelier Store
            </Badge>
            <div className="max-w-[34rem] space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                Sade, hızlı ve güven veren bir alışveriş akışı.
              </h2>
              <p className="max-w-[62ch] text-sm leading-6 text-white/72 md:text-[15px]">
                Ürün keşfi, sepet ve sipariş yönetimini aynı düzen içinde tutan butik bir
                e-ticaret deneyimi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Ürünleri incele
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <nav aria-label="Alışveriş bağlantıları" className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Alışveriş
              </p>
              <ul className="space-y-3 text-sm text-white">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link className="transition-colors hover:text-white/72" to={link.to}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Hesap bağlantıları" className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Hesap
              </p>
              <ul className="space-y-3 text-sm text-white">
                <li>
                  <Link
                    className="transition-colors hover:text-white/72"
                    to={isAuthenticated ? '/account' : '/login'}
                  >
                    {isAuthenticated ? 'Hesabım' : 'Giriş yap'}
                  </Link>
                </li>
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    <Link className="transition-colors hover:text-white/72" to={link.to}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                İletişim
              </p>
              <div className="space-y-3 text-sm leading-6 text-white/72">
                <p>Sipariş, ödeme ve teslimat soruların için destek ekibiyle iletişime geçebilirsin.</p>
                <p>Hesap ve sipariş akışı tek düzen içinde ilerlediği için yardım adımları daha hızlı bulunur.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 py-8 md:grid-cols-3">
          {trustItems.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm leading-6 text-white/68">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Atelier. Düzenli alışveriş deneyimi için tasarlandı.</p>
          <p>Ürün keşfi, sepet ve sipariş geçmişi aynı oturum yapısında sunulur.</p>
        </div>
      </div>
    </footer>
  )
}
