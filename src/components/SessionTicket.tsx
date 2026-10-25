import { Link } from 'react-router-dom'
import type { Session } from '../types'
import { firstName, getStudent } from '../data/students'
import { topicName } from '../data/topics'
import { formatSlot } from '../lib/time'
import { plural } from '../lib/text'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { TicketCard } from './TicketCard'
import { btn } from './styles'

/** Notched ticket for an upcoming peer session. */
export function SessionTicket({ session, label = 'Next session' }: { session: Session; label?: string }) {
  const peer = getStudent(session.peerId)
  if (!peer) return null
  const first = firstName(peer.name)
  const titleId = `session-${session.id}-title`
  const creditText =
    session.role === 'learn'
      ? `${plural(session.credits, 'credit')} spent`
      : `You’ll earn ${plural(session.credits, 'credit')}`

  return (
    <TicketCard
      label={label}
      labelledBy={titleId}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{creditText}</p>
          <Link to={`/chat/${peer.id}`} className={btn.smallDark}>
            Message {first}
          </Link>
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar spec={peer.avatar} size={52} />
        <div className="min-w-0">
          <h3 id={titleId} className="text-lg font-bold leading-tight">
            {session.role === 'learn' ? `${topicName(session.topicId)} with ${first}` : `Teaching ${first} ${topicName(session.topicId)}`}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
            <Icon name="calendar" size={16} className="shrink-0" />
            {formatSlot(session.startsAt)} · {session.durationMins} min
          </p>
          <p className="text-sm text-deep/80">{session.place}</p>
        </div>
      </div>
    </TicketCard>
  )
}
