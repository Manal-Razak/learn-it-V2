import { Link } from 'react-router-dom'
import type { ChatMessage, Student } from '../types'
import { useApp } from '../state/context'
import { getStudent } from '../data/students'
import { topicName } from '../data/topics'
import { formatDay, formatTime } from '../lib/time'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/ui'
import { btn } from '../components/styles'

function preview(message: ChatMessage): string {
  const who = message.from === 'me' ? 'You: ' : ''
  if (message.text) return who + message.text
  if (message.attachment?.kind === 'test') return `${who}shared a practice test`
  if (message.attachment?.kind === 'resource') return `${who}shared a resource`
  return `${who}shared a link`
}

export default function ChatList() {
  const { state, typing } = useApp()

  const threads = Object.entries(state.chats)
    .map(([peerId, messages]) => ({ peer: getStudent(peerId), last: messages[messages.length - 1] }))
    .filter((t): t is { peer: Student; last: ChatMessage } => !!t.peer && !!t.last)
    .sort((a, b) => b.last.at.localeCompare(a.last.at))

  return (
    <div className="space-y-5 pb-6 pt-3">
      <header>
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="mt-1 text-sm text-haze">Ask questions, share tests and resources.</p>
      </header>

      {threads.length === 0 ? (
        <EmptyState
          icon="chat"
          title="No conversations yet"
          titleAs="h2"
          action={
            <Link to="/matches" className={btn.small}>
              Find my matches
            </Link>
          }
        >
          You haven’t messaged anyone yet. Find a peer who teaches what you need and send them a message.
        </EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-card bg-panel">
          {threads.map(({ peer, last }, i) => {
            const day = formatDay(last.at)
            return (
              <li key={peer.id} className={i > 0 ? 'border-t border-white/10' : ''}>
                <Link to={`/chat/${peer.id}`} className="flex items-center gap-3 p-4 transition hover:bg-deep/50">
                  <Avatar spec={peer.avatar} size={52} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold">{peer.name}</span>
                      <span className="shrink-0 text-xs text-muted">{day === 'Today' ? formatTime(last.at) : day}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">
                      Teaches {peer.canTeach.map(topicName).join(', ')}
                    </span>
                    <span className="mt-0.5 block truncate text-sm">
                      {typing[peer.id] ? 'typing…' : preview(last)}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
