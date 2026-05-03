import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PaginationItem[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    items.push('ellipsis-left')
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push(pageNumber)
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right')
  }

  items.push(totalPages)

  return items
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  const items = buildPaginationItems(page, pageCount)

  return (
    <nav className="flex items-center justify-center gap-1.5 sm:gap-2" aria-label="Sayfalama">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={`${item}-${index}`}
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )
          }

          const isCurrent = item === page

          return (
            <Button
              key={item}
              variant={isCurrent ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'h-10 w-10 shrink-0 text-sm font-medium',
                !isCurrent && 'text-foreground/80 hover:text-foreground',
              )}
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Sayfa ${item}`}
            >
              {item}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Sonraki sayfa"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
