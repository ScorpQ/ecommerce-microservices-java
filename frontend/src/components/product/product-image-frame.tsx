import { ImageOff } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

type ProductImageFrameProps = {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  enableZoom?: boolean
}

export function ProductImageFrame({
  src,
  alt,
  className,
  imageClassName,
  enableZoom = false,
}: ProductImageFrameProps) {
  const [transformOrigin, setTransformOrigin] = useState('50% 50%')
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = failedSrc === src

  function updateZoomOrigin(event: MouseEvent<HTMLDivElement>) {
    if (!enableZoom) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setTransformOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      className={cn(
        'group/image relative overflow-hidden rounded-md border bg-white',
        enableZoom ? 'cursor-zoom-in' : '',
        className,
      )}
      onMouseMove={updateZoomOrigin}
      onMouseLeave={() => setTransformOrigin('50% 50%')}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailedSrc(src)}
          className={cn(
            'relative z-10 h-full w-full object-cover transition-transform duration-300 ease-out group-hover/image:scale-[1.08]',
            enableZoom ? 'group-hover/image:scale-[1.55]' : '',
            imageClassName,
          )}
          style={{ transformOrigin }}
          loading="lazy"
        />
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Görsel yok</span>
        </div>
      )}
      {enableZoom ? (
        <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border bg-white/90 px-2 py-1 text-xs text-muted-foreground opacity-0 shadow-subtle transition-opacity group-hover/image:opacity-100">
          Yakınlaştır
        </span>
      ) : null}
    </div>
  )
}
