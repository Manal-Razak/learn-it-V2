import type { ReactNode } from 'react'
import { Sheet } from './Sheet'
import { btn } from './styles'

interface ConfirmSheetProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  /** Optional extra action, e.g. "Save draft" when leaving a form. */
  extra?: ReactNode
}

/** Asks before a destructive action. The safe choice is the primary button. */
export function ConfirmSheet({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  extra,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <div className="text-sm text-muted">{children}</div>
      <div className="mt-6 grid gap-3">
        <button type="button" onClick={onCancel} className={`${btn.primary} w-full`}>
          {cancelLabel}
        </button>
        {extra}
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-deep px-5 text-center font-semibold text-salmon ring-1 ring-salmon/50 transition hover:ring-salmon"
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
