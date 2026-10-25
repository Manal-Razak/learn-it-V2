import { useApp } from '../state/context'
import { Icon } from './Icon'

/** Short confirmation message at the top of the screen (polite live region). */
export function Toast() {
  const { toast } = useApp()
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex max-w-[420px] justify-center px-4"
    >
      {toast && (
        <p
          key={toast.id}
          className="flex animate-pop items-center justify-center gap-2 rounded-full bg-deep px-5 py-3 text-center text-sm font-semibold text-ink shadow-[0_12px_30px_-10px_rgba(10,6,25,0.9)] ring-1 ring-sand/40"
        >
          <Icon name="check" size={18} className="shrink-0 text-sand" />
          {toast.message}
        </p>
      )}
    </div>
  )
}
