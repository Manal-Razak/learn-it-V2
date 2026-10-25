import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { FixedBottom } from './FixedBottom'

const TABS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/practice', label: 'Practice', icon: 'practice' },
  { to: '/resources', label: 'Resources', icon: 'resources' },
  { to: '/chat', label: 'Chat', icon: 'chat' },
]

/** Bottom tab bar. Every tab always shows its text label under the icon. */
export function TabBar() {
  return (
    <FixedBottom className="px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <nav aria-label="Main">
        <ul className="grid grid-cols-5 gap-1 rounded-[28px] bg-deep p-1.5 shadow-[0_10px_30px_-14px_rgba(20,14,40,0.8)] ring-1 ring-white/10">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors ${
                    isActive ? 'bg-sand text-deep' : 'text-muted hover:text-ink'
                  }`
                }
              >
                <Icon name={tab.icon} size={22} />
                <span>{tab.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </FixedBottom>
  )
}
