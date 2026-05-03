import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCategoryLabel } from '@/lib/category-labels'
import { formatCurrency } from '@/lib/format'

const MAX_PRICE_LIMIT = 20000
const MIN_PRICE_LIMIT = 0
const PRICE_STEP = 250

type ProductFiltersProps = {
  categories: string[]
  colors: string[]
  labels: string[]
  search: string
  category: string
  color: string
  label: string
  minPrice: string
  maxPrice: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onColorChange: (value: string) => void
  onLabelChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onReset: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatOptionLabel(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function ProductFilters({
  categories,
  colors,
  labels,
  search,
  category,
  color,
  label,
  minPrice,
  maxPrice,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onLabelChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const normalizedMinPrice = clamp(
    Number(minPrice) || MIN_PRICE_LIMIT,
    MIN_PRICE_LIMIT,
    MAX_PRICE_LIMIT,
  )
  const normalizedMaxPrice = clamp(
    Number(maxPrice) || MAX_PRICE_LIMIT,
    MIN_PRICE_LIMIT,
    MAX_PRICE_LIMIT,
  )
  const effectiveMinPrice = Math.min(normalizedMinPrice, normalizedMaxPrice - PRICE_STEP)
  const effectiveMaxPrice = Math.max(normalizedMaxPrice, effectiveMinPrice + PRICE_STEP)
  const minPercent = ((effectiveMinPrice - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100
  const maxPercent = ((effectiveMaxPrice - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100

  function handleMinPriceChange(value: string) {
    const nextValue = clamp(Number(value), MIN_PRICE_LIMIT, effectiveMaxPrice - PRICE_STEP)
    onMinPriceChange(nextValue <= MIN_PRICE_LIMIT ? '' : String(nextValue))
  }

  function handleMaxPriceChange(value: string) {
    const nextValue = clamp(Number(value), effectiveMinPrice + PRICE_STEP, MAX_PRICE_LIMIT)
    onMaxPriceChange(nextValue >= MAX_PRICE_LIMIT ? '' : String(nextValue))
  }

  return (
    <section className="rounded-lg border bg-card p-5" aria-label="Ürün filtreleri">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Ürün ara</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
            placeholder="Ürün ara"
          />
        </label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((current) => !current)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtrele
          </Button>

          <Button type="button" variant="outline" onClick={onReset}>
            Temizle
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-4 grid items-start gap-3 border-t pt-4 md:grid-cols-[220px_220px_220px_minmax(280px,1fr)]">
          <label className="relative block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Kategori</span>
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Tüm kategoriler</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {formatCategoryLabel(item)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-[34px] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>

          <label className="relative block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Renk</span>
            <select
              value={color}
              onChange={(event) => onColorChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Tüm renkler</option>
              {colors.map((item) => (
                <option key={item} value={item}>
                  {formatOptionLabel(item)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-[34px] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>

          <label className="relative block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Etiket</span>
            <select
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Tüm etiketler</option>
              {labels.map((item) => (
                <option key={item} value={item}>
                  {formatOptionLabel(item)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-[34px] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>

          <div className="rounded-md border border-input bg-background px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Fiyat aralığı</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatCurrency(effectiveMinPrice)} - {formatCurrency(effectiveMaxPrice)}
                </p>
              </div>
            </div>

            <div className="relative mt-4 h-5">
              <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-900"
                style={{
                  left: `${minPercent}%`,
                  right: `${100 - maxPercent}%`,
                }}
              />

              <input
                type="range"
                min={String(MIN_PRICE_LIMIT)}
                max={String(MAX_PRICE_LIMIT)}
                step={String(PRICE_STEP)}
                value={effectiveMinPrice}
                onChange={(event) => handleMinPriceChange(event.target.value)}
                aria-label="Minimum fiyat"
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:shadow-sm"
              />
              <input
                type="range"
                min={String(MIN_PRICE_LIMIT)}
                max={String(MAX_PRICE_LIMIT)}
                step={String(PRICE_STEP)}
                value={effectiveMaxPrice}
                onChange={(event) => handleMaxPriceChange(event.target.value)}
                aria-label="Maksimum fiyat"
                className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:shadow-sm"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{formatCurrency(MIN_PRICE_LIMIT)}</span>
              <span>{formatCurrency(MAX_PRICE_LIMIT)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
