import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Pastel, ResourceType } from '../types'
import { PASTEL_BG, topicColor, topicName } from '../data/topics'
import { RESOURCE_TYPE_LABEL } from '../data/resources'
import { ME_ID } from '../data/seed'
import { getStudent } from '../data/students'
import { useApp } from '../state/context'
import { Avatar } from './Avatar'
import { Icon, type IconName } from './Icon'

/** Small persistent badge flagging the app as a prototype. */
export function PrototypeBadge() {
  return (
    <p className="mx-auto w-fit rounded-full bg-deep px-3 py-1 text-[11px] font-medium tracking-wide text-muted">
      Prototype – demo data
    </p>
  )
}

/** Toggleable pill chip for filters. Unselected chips keep full-contrast text. */
export function Chip({
  selected,
  color = 'sand',
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean; color?: Pastel }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
        selected ? 'bg-sand text-deep' : 'bg-deep text-ink ring-1 ring-white/25 hover:ring-white/50'
      } ${className}`}
      {...rest}
    >
      {selected ? (
        <Icon name="check" size={16} />
      ) : (
        <span aria-hidden="true" className={`size-2 rounded-full ${PASTEL_BG[color]}`} />
      )}
      {children}
    </button>
  )
}

/** Non-interactive topic tag tinted with its pastel. */
export function TopicTag({ topicId }: { topicId: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-deep ${PASTEL_BG[topicColor(topicId)]}`}
    >
      {topicName(topicId)}
    </span>
  )
}

const TYPE_STYLE: Record<ResourceType | 'test', { bg: string; icon: IconName; label: string }> = {
  pdf: { bg: 'bg-salmon', icon: 'file', label: RESOURCE_TYPE_LABEL.pdf },
  link: { bg: 'bg-sky', icon: 'link', label: RESOURCE_TYPE_LABEL.link },
  notes: { bg: 'bg-lavender', icon: 'notes', label: RESOURCE_TYPE_LABEL.notes },
  test: { bg: 'bg-sand', icon: 'practice', label: 'Practice test' },
}

/** Resource type badge: PDF / Link / Notes / Practice test. */
export function TypeBadge({ type }: { type: ResourceType | 'test' }) {
  const style = TYPE_STYLE[type]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-deep ${style.bg}`}
    >
      <Icon name={style.icon} size={14} />
      {style.label}
    </span>
  )
}

export function ProgressBar({
  value,
  max,
  label,
  onSand = false,
}: {
  value: number
  max: number
  label: string
  onSand?: boolean
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${max}`}
      className={`h-2.5 w-full overflow-hidden rounded-full ${onSand ? 'bg-deep/20' : 'bg-deep'}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${onSand ? 'bg-deep' : 'bg-sand'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-5 shrink-0 animate-spin rounded-full border-[3px] border-current border-r-transparent"
    />
  )
}

/**
 * Button that shows a spinner and a short status ("Publishing…") while busy.
 * It stays focusable while busy (aria-disabled) so keyboard focus isn't lost.
 */
export function LoadingButton({
  loading,
  loadingText,
  children,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean; loadingText: string }) {
  return (
    <>
      <button
        {...rest}
        aria-disabled={loading || undefined}
        onClick={(e) => {
          if (loading) {
            e.preventDefault()
            return
          }
          onClick?.(e)
        }}
      >
        {loading ? (
          <>
            <Spinner />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
      <span role="status" className="sr-only">
        {loading ? loadingText : ''}
      </span>
    </>
  )
}

/** Explains why a list is empty and offers the next step. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  titleAs: Title = 'h3',
}: {
  icon: IconName
  title: string
  children: ReactNode
  action?: ReactNode
  titleAs?: 'h2' | 'h3'
}) {
  return (
    <div className="flex flex-col items-center rounded-card bg-panel px-6 py-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-deep text-sand">
        <Icon name={icon} size={26} />
      </span>
      <Title className="mt-4 text-base font-semibold">{title}</Title>
      <p className="mt-1.5 max-w-xs text-sm text-muted">{children}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

export function SectionTitle({ id, children, action }: { id?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-semibold">
        {children}
      </h2>
      {action}
    </div>
  )
}

/** Avatar for a student id, or the user's own avatar for ME_ID. */
export function PersonAvatar({ id, size = 32, label }: { id: string; size?: number; label?: string }) {
  const { state } = useApp()
  const spec = id === ME_ID ? state.profile.avatar : getStudent(id)?.avatar
  if (!spec) return null
  return <Avatar spec={spec} size={size} label={label} />
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-salmon">
      <Icon name="info" size={18} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  )
}
