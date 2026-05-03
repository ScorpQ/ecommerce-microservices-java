import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border border-accent/20 bg-accent/5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-accent',
        className,
      )}
      {...props}
    />
  )
}
