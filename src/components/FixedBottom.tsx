import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface FixedBottomProps {
  children: ReactNode
  className?: string
  /** Called whenever the bar's height changes (e.g. a growing textarea). */
  onHeightChange?: (height: number) => void
}

/**
 * A bar fixed to the bottom of the phone frame. It renders an invisible
 * spacer with exactly the bar's height in the normal flow, so the bar can
 * never cover the end of the page content.
 */
export function FixedBottom({ children, className = '', onHeightChange }: FixedBottomProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const h = el.offsetHeight
      setHeight(h)
      onHeightChange?.(h)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeightChange])

  return (
    <>
      <div aria-hidden="true" style={{ height }} />
      <div ref={ref} className={`fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[420px] ${className}`}>
        {children}
      </div>
    </>
  )
}
