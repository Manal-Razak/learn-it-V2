import { Link } from 'react-router-dom'
import type { Student } from '../types'
import { useApp } from '../state/context'
import { firstName } from '../data/students'
import { plural } from '../lib/text'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { TopicTag } from './ui'
import { btn } from './styles'

interface PeerCardProps {
  student: Student
  /** Topics they teach that you're learning. */
  theyTeachYou: string[]
  /** Topics you teach that they want to learn (empty for "Can help you"). */
  youTeachThem: string[]
}

export function PeerCard({ student, theyTeachYou, youTeachThem }: PeerCardProps) {
  const { tests } = useApp()
  const testCount = tests.filter((t) => t.authorId === student.id).length
  const first = firstName(student.name)
  const titleId = `peer-${student.id}-name`

  return (
    <article aria-labelledby={titleId} className="rounded-card bg-panel p-5">
      <div className="flex items-start gap-3">
        <span className="relative shrink-0">
          <Avatar spec={student.avatar} size={56} />
          {student.online && (
            <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-sand ring-[3px] ring-panel" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-base font-semibold leading-snug">
            {student.name}
          </h3>
          <p className="text-sm text-muted">
            {student.course} · Year {student.year}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {student.online ? 'Online now' : `Usually free ${student.availability}`}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Can teach you</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {theyTeachYou.map((t) => (
              <TopicTag key={t} topicId={t} />
            ))}
          </dd>
        </div>
        {youTeachThem.length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">You can teach {first}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {youTeachThem.map((t) => (
                <TopicTag key={t} topicId={t} />
              ))}
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-4 flex items-center gap-2 text-sm">
        <Icon name="practice" size={18} className="shrink-0 text-sand" />
        {testCount > 0 ? `Made ${plural(testCount, 'practice test')}` : 'No practice tests yet'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link to={`/peers/${student.id}#tests`} className={btn.smallGhost}>
          See their tests
          <span className="sr-only"> ({student.name})</span>
        </Link>
        <Link to={`/chat/${student.id}`} className={btn.small}>
          Message
          <span className="sr-only"> {student.name}</span>
        </Link>
      </div>
    </article>
  )
}
