import type { ReactNode } from 'react'
import { useGoBack } from '../lib/useGoBack'
import { Icon } from './Icon'
import { btn } from './styles'

interface HeaderProps {
  title: ReactNode
  /** Custom back behaviour (e.g. ask before discarding changes). */
  onBack?: () => void
  /** Where back goes when there's no in-app history. */
  fallback?: string
  backLabel?: string
  right?: ReactNode
}

/** Screen header: round back button, title, optional action on the right. */
export function Header({ title, onBack, fallback = '/', backLabel = 'Go back', right }: HeaderProps) {
  const goBack = useGoBack(fallback)
  return (
    <header className="flex items-center gap-3 pb-2 pt-3">
      <button type="button" onClick={onBack ?? goBack} aria-label={backLabel} className={btn.icon}>
        <Icon name="back" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
      {right}
    </header>
  )
}
