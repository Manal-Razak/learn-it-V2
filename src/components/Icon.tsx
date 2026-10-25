import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'matches'
  | 'practice'
  | 'resources'
  | 'chat'
  | 'back'
  | 'close'
  | 'plus'
  | 'search'
  | 'check'
  | 'chevron-right'
  | 'bookmark'
  | 'link'
  | 'file'
  | 'notes'
  | 'info'
  | 'clock'
  | 'calendar'
  | 'coin'
  | 'swap'
  | 'send'
  | 'retry'
  | 'trash'
  | 'external'
  | 'paperclip'
  | 'sparkle'
  | 'edit'

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M4 11l8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  matches: (
    <>
      <circle cx="8.5" cy="9" r="3.2" />
      <circle cx="16.5" cy="9" r="3.2" />
      <path d="M2.5 19.5c.8-3 3.2-4.6 6-4.6s5.2 1.6 6 4.6M12.7 15.4c1-.3 2.3-.5 3.8-.5 2.8 0 5.2 1.6 6 4.6" />
    </>
  ),
  practice: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.5" />
      <path d="M9.5 3h5v3h-5z" />
      <path d="M8.8 13.2l2.3 2.3 4.3-4.6" />
    </>
  ),
  resources: (
    <>
      <path d="M4.5 4.5h4v15h-4zM10.5 4.5h4v15h-4z" />
      <path d="M16.2 5.6l3.6-1 3 14.5-3.6 1z" />
    </>
  ),
  chat: <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17H5A1.5 1.5 0 0 1 3.5 15.5V7A1.5 1.5 0 0 1 5 5.5z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'chevron-right': <path d="M9 5l7 7-7 7" />,
  bookmark: <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-4-6 4v-16a1 1 0 0 1 1-1z" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  file: (
    <>
      <path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
      <path d="M13.5 3.5v4h4" />
    </>
  ),
  notes: (
    <>
      <rect x="4.5" y="4" width="15" height="16.5" rx="2.5" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.5 0-2.6.8-2.6 2s1.2 1.6 2.7 1.9c1.6.3 2.8.8 2.8 2.1s-1.2 2.1-2.8 2.1c-1.2 0-2.3-.6-2.8-1.6M12 6.3v1.5M12 16.2v1.5" />
    </>
  ),
  swap: <path d="M6 8h12l-3.5-3.5M18 16H6l3.5 3.5" />,
  send: <path d="M4 12l16-7-6 16-2.5-6.5z" />,
  retry: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4v4.5H9" />
    </>
  ),
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  paperclip: (
    <path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />
  ),
  sparkle: <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

/** Decorative stroke icon; label the parent control instead. */
export function Icon({ name, size = 22, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
