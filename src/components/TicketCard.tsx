import type { ReactNode } from 'react'

interface TicketCardProps {
  /** Small dark pill shown at the top of the ticket. */
  label: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  labelledBy?: string
}

/**
 * Signature sand "ticket": two halves with semicircle notches cut from
 * both sides and a dashed tear line between them.
 */
export function TicketCard({ label, children, footer, className = '', labelledBy }: TicketCardProps) {
  return (
    <section aria-labelledby={labelledBy} className={`on-sand text-deep ${className}`}>
      <div className={`${footer ? 'ticket-top rounded-t-card' : 'rounded-card'} bg-sand px-5 pb-5 pt-5`}>
        <span className="inline-flex rounded-full bg-deep px-3 py-1 text-xs font-semibold tracking-wide text-sand">
          {label}
        </span>
        <div className="mt-3">{children}</div>
      </div>
      {footer && (
        <div className="ticket-bottom relative rounded-b-card bg-sand px-5 pb-5 pt-4">
          <div aria-hidden="true" className="absolute inset-x-6 top-0 border-t-2 border-dashed border-deep/35" />
          {footer}
        </div>
      )}
    </section>
  )
}
