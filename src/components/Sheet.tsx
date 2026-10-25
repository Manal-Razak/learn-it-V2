import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Element to focus when the sheet closes (defaults to whatever opened it). */
  returnFocusTo?: RefObject<HTMLElement | null>
}

/**
 * Bottom sheet on top of the native <dialog>: the browser handles focus
 * trapping, Esc and making the page behind it inert.
 */
export function Sheet({ open, onClose, title, children, returnFocusTo }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleClose() {
    onClose()
    const target = returnFocusTo?.current ?? opener.current
    if (target?.isConnected) target.focus()
  }

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (e.target === e.currentTarget) ref.current?.close()
      }}
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-deep text-ink hover:ring-1 hover:ring-white/30"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
        {open && children}
      </div>
    </dialog>
  )
}
