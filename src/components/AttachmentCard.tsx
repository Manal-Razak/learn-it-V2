import { Link, useNavigate } from 'react-router-dom'
import type { Attachment } from '../types'
import { useApp } from '../state/context'
import { personName } from '../lib/people'
import { plural } from '../lib/text'
import { Icon } from './Icon'
import { TypeBadge } from './ui'
import { btn } from './styles'

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Practice test / resource / link card shown inside a chat message. */
export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const { state, getTest, getResource, startTest } = useApp()
  const navigate = useNavigate()
  const shell = 'mt-2 rounded-2xl bg-deep p-3.5 text-left text-ink ring-1 ring-white/10'

  if (attachment.kind === 'test') {
    const test = getTest(attachment.testId)
    if (!test || test.status !== 'published') {
      return <p className={`${shell} text-sm text-muted`}>This practice test is no longer available.</p>
    }
    const progress = state.progress[test.id]
    const resume = !!progress && !progress.finished
    return (
      <div className={shell}>
        <TypeBadge type="test" />
        <p className="mt-2 font-semibold leading-snug">{test.title}</p>
        <p className="mt-0.5 text-xs text-muted">
          {plural(test.questions.length, 'question')} · by {personName(test.authorId)}
        </p>
        <button
          type="button"
          onClick={() => {
            if (!progress) startTest(test.id)
            navigate(`/test/${test.id}`)
          }}
          className={`${btn.small} mt-3`}
        >
          {resume ? 'Resume' : 'Start'}
          <span className="sr-only"> {test.title}</span>
        </button>
      </div>
    )
  }

  if (attachment.kind === 'resource') {
    const resource = getResource(attachment.resourceId)
    if (!resource) {
      return <p className={`${shell} text-sm text-muted`}>This resource is no longer available.</p>
    }
    return (
      <div className={shell}>
        <TypeBadge type={resource.type} />
        <p className="mt-2 font-semibold leading-snug">{resource.title}</p>
        <p className="mt-0.5 text-xs text-muted">by {personName(resource.authorId)}</p>
        <Link to={`/resources/${resource.id}`} className={`${btn.small} mt-3`}>
          Open
          <span className="sr-only"> {resource.title}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className={shell}>
      <TypeBadge type="link" />
      <p className="mt-2 break-words font-semibold leading-snug">{attachment.title}</p>
      <p className="mt-0.5 break-all text-xs text-muted">{hostOf(attachment.url)}</p>
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className={`${btn.small} mt-3`}>
        Open link
        <Icon name="external" size={16} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  )
}
