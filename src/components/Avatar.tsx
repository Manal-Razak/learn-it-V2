import { useId, type ReactNode } from 'react'
import type { AvatarSpec, HairStyle } from '../types'
import { PASTEL_HEX } from '../data/topics'

interface AvatarProps {
  spec: AvatarSpec
  size?: number
  /** Accessible name. Omit when the avatar sits next to a visible name. */
  label?: string
  className?: string
}

const INK = '#2E2748'

// Hair drawn behind the head (and, for long styles, over the shoulders).
function backHair(style: HairStyle, color: string): ReactNode {
  switch (style) {
    case 'long':
      return <path d="M27 50 C27 25 73 25 73 50 L76 86 C64 92 36 92 24 86 Z" fill={color} />
    case 'bob':
      return <path d="M27 52 C27 25 73 25 73 52 L73 70 C64 75 36 75 27 70 Z" fill={color} />
    case 'afro':
      return <circle cx="50" cy="44" r="30" fill={color} />
    case 'curly':
      return <ellipse cx="50" cy="44" rx="27" ry="23" fill={color} />
    case 'bun':
      return <circle cx="50" cy="24" r="10" fill={color} />
    case 'ponytail':
      return <ellipse cx="74" cy="58" rx="7" ry="16" transform="rotate(-12 74 58)" fill={color} />
    case 'hijab':
      return <path d="M22 60 C22 30 36 22 50 22 C64 22 78 30 78 60 L84 104 L16 104 Z" fill={color} />
    default:
      return null
  }
}

function curlRing(color: string, radius: number, curl: number): ReactNode {
  const angles = [-175, -150, -122, -90, -58, -30, -5]
  return angles.map((deg) => {
    const rad = (deg * Math.PI) / 180
    return (
      <circle
        key={deg}
        cx={50 + radius * Math.cos(rad)}
        cy={47 + radius * Math.sin(rad)}
        r={curl}
        fill={color}
      />
    )
  })
}

// Hair drawn in front of the face (fringe, cap, curls).
function frontHair(style: HairStyle, color: string): ReactNode {
  switch (style) {
    case 'short':
      return <path d="M28 52 C27 34 37 27 50 27 C63 27 73 34 72 52 C69 44 61 39 50 39 C40 39 31 44 28 52 Z" fill={color} />
    case 'buzz':
      return (
        <path
          d="M30 46 C31 34 39 29 50 29 C61 29 69 34 70 46 C64 39 57 36 50 36 C43 36 36 39 30 46 Z"
          fill={color}
          opacity={0.92}
        />
      )
    case 'spiky':
      return (
        <path
          d="M28 51 L29 35 L36 38 L39 26 L46 34 L52 23 L57 33 L64 26 L66 37 L73 33 L72 51 C67 43 59 39 50 39 C41 39 33 43 28 51 Z"
          fill={color}
        />
      )
    case 'long':
    case 'bob':
      return <path d="M28 54 C27 34 37 27 50 27 C63 27 73 34 72 54 C70 46 66 41 58 38 C52 44 40 46 28 54 Z" fill={color} />
    case 'curly':
      return <g>{curlRing(color, 21, 7)}</g>
    case 'afro':
      return <g>{curlRing(color, 22, 8)}</g>
    case 'bun':
    case 'ponytail':
      return <path d="M28 50 C28 32 38 27 50 27 C62 27 72 32 72 50 C66 41 58 37 50 37 C42 37 34 41 28 50 Z" fill={color} />
    case 'hijab':
      return <path d="M30 48 C32 35 40 29 50 29 C60 29 68 35 70 48 C64 40 57 36 50 36 C43 36 36 40 30 48 Z" fill={color} />
  }
}

/** Friendly flat cartoon avatar drawn entirely in SVG. */
export function Avatar({ spec, size = 48, label, className = '' }: AvatarProps) {
  const clipId = `av-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { skin, hair, hairColor, bg, shirt, glasses, beard } = spec
  const hasEars = hair !== 'hijab'
  const drawsOverShoulders = hair === 'long' || hair === 'hijab'

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 rounded-full ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="50" cy="50" r="50" fill={PASTEL_HEX[bg]} />
        {!drawsOverShoulders && backHair(hair, hairColor)}
        {/* shoulders */}
        <path d="M14 104 C14 82 31 74 50 74 C69 74 86 82 86 104 Z" fill={shirt} />
        {drawsOverShoulders && backHair(hair, hairColor)}
        {/* neck */}
        <rect x="43.5" y="62" width="13" height="15" rx="5" fill={skin} />
        <rect x="43.5" y="62" width="13" height="8" rx="4" fill="#000" opacity="0.08" />
        {hasEars && (
          <>
            <circle cx="30" cy="52" r="4.5" fill={skin} />
            <circle cx="70" cy="52" r="4.5" fill={skin} />
          </>
        )}
        {/* face */}
        <circle cx="50" cy="50" r="20.5" fill={skin} />
        {beard && (
          <path d="M31 54 C33 70 42 75 50 75 C58 75 67 70 69 54 C65 63 58 65 50 65 C42 65 35 63 31 54 Z" fill={hairColor} />
        )}
        {/* cheeks */}
        <circle cx="39" cy="57" r="3.4" fill="#EFA3A0" opacity="0.55" />
        <circle cx="61" cy="57" r="3.4" fill="#EFA3A0" opacity="0.55" />
        {/* brows */}
        <path d="M39.5 44.5 Q43 42.8 46.5 44.5" stroke={hair === 'hijab' ? INK : hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M53.5 44.5 Q57 42.8 60.5 44.5" stroke={hair === 'hijab' ? INK : hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* eyes */}
        <ellipse cx="43" cy="51" rx="2.2" ry="2.7" fill={INK} />
        <ellipse cx="57" cy="51" rx="2.2" ry="2.7" fill={INK} />
        <circle cx="43.8" cy="50" r="0.7" fill="#fff" />
        <circle cx="57.8" cy="50" r="0.7" fill="#fff" />
        {/* smile */}
        <path d="M44.5 58.5 Q50 63.5 55.5 58.5" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {frontHair(hair, hairColor)}
        {glasses && (
          <g stroke={INK} strokeWidth="1.8" fill="#fff" fillOpacity="0.18">
            <circle cx="43" cy="51" r="5.6" />
            <circle cx="57" cy="51" r="5.6" />
            <path d="M48.6 51 H51.4" fill="none" />
          </g>
        )}
      </g>
    </svg>
  )
}
