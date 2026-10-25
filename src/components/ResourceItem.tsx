import { Link } from 'react-router-dom'
import type { Resource } from '../types'
import { useApp } from '../state/context'
import { personName } from '../lib/people'
import { plural } from '../lib/text'
import { Icon } from './Icon'
import { PersonAvatar, TopicTag, TypeBadge } from './ui'
import { btn } from './styles'

/** Library item: type badge, author, saves and a Save toggle. */
export function ResourceItem({ resource, showTopic = true }: { resource: Resource; showTopic?: boolean }) {
  const { saveCount, isSaved, toggleSave } = useApp()
  const saved = isSaved(resource.id)
  const titleId = `res-${resource.id}-title`

  return (
    <article aria-labelledby={titleId} className="rounded-card bg-panel p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <TypeBadge type={resource.type} />
        {showTopic && <TopicTag topicId={resource.topicId} />}
      </div>
      <h3 id={titleId} className="text-base font-semibold leading-snug">
        {resource.title}
      </h3>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <PersonAvatar id={resource.authorId} size={24} />
        <span>
          by {personName(resource.authorId)} · {plural(saveCount(resource), 'save')}
        </span>
      </p>
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggleSave(resource.id)}
          className={saved ? btn.small : btn.smallGhost}
        >
          <Icon name="bookmark" size={18} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
          <span className="sr-only"> {resource.title}</span>
        </button>
        <Link to={`/resources/${resource.id}`} className={btn.small}>
          Open
          <span className="sr-only"> {resource.title}</span>
        </Link>
      </div>
    </article>
  )
}
