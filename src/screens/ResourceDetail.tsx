import { Link, useParams } from 'react-router-dom'
import { useApp } from '../state/context'
import { ME_ID } from '../data/seed'
import { firstName, getStudent } from '../data/students'
import { personName } from '../lib/people'
import { plural } from '../lib/text'
import { formatDay } from '../lib/time'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { TestCard } from '../components/TestCard'
import { PersonAvatar, SectionTitle, TopicTag, TypeBadge } from '../components/ui'
import { btn } from '../components/styles'
import NotFound from './NotFound'

export default function ResourceDetail() {
  const { resourceId = '' } = useParams()
  const { getResource, tests, saveCount, isSaved, toggleSave } = useApp()
  const resource = getResource(resourceId)
  if (!resource) return <NotFound />

  const saved = isSaved(resource.id)
  const author = getStudent(resource.authorId)
  const usedIn = tests.filter(
    (t) => t.resourceIds.includes(resource.id) || t.questions.some((q) => q.resourceId === resource.id),
  )
  const demoPdf = resource.type === 'pdf' && !resource.url

  return (
    <div className="pb-8">
      <Header title="Resource" fallback="/resources" />

      <article className="mt-3 rounded-card bg-panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={resource.type} />
          <TopicTag topicId={resource.topicId} />
        </div>
        <h2 className="mt-3 text-xl font-bold leading-snug">{resource.title}</h2>
        {resource.description && <p className="mt-2 text-sm text-muted">{resource.description}</p>}

        <div className="mt-4 flex items-center gap-3">
          <PersonAvatar id={resource.authorId} size={40} />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">
              {resource.authorId === ME_ID ? 'Shared by you' : `Shared by ${personName(resource.authorId)}`}
            </p>
            <p className="text-muted">
              {formatDay(resource.createdAt)} · {plural(saveCount(resource), 'save')}
            </p>
          </div>
          {author && (
            <Link to={`/chat/${author.id}`} className={btn.smallGhost}>
              Message
              <span className="sr-only"> {author.name}</span>
            </Link>
          )}
        </div>

        {resource.body && (
          <div className="mt-5 rounded-2xl bg-deep p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {demoPdf ? 'PDF preview' : 'Notes'}
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{resource.body}</p>
            {demoPdf && (
              <p className="mt-3 border-t border-white/10 pt-3 text-xs text-muted">
                Demo file: this prototype shows a text preview instead of the real PDF.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-3">
          {resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              {resource.type === 'pdf' ? 'Open PDF' : 'Open link'}
              <Icon name="external" size={18} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => toggleSave(resource.id)}
            className={resource.url ? btn.ghost : btn.primary}
          >
            <Icon name="bookmark" size={20} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </article>

      <section aria-labelledby="used-title" className="mt-7">
        <SectionTitle id="used-title">Practice tests that use it</SectionTitle>
        {usedIn.length > 0 ? (
          <ul className="space-y-4">
            {usedIn.map((t) => (
              <li key={t.id}>
                <TestCard test={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card bg-panel p-5 text-sm text-muted">
            No practice test links to this resource yet. When you{' '}
            <Link to={`/practice/new?topic=${resource.topicId}`} className="font-semibold text-sand underline underline-offset-4">
              create a practice test
            </Link>
            , you can attach it there.
          </p>
        )}
      </section>

      {author && (
        <p className="mt-6 text-center text-sm text-haze">
          Questions about it?{' '}
          <Link to={`/chat/${author.id}`} className="font-semibold text-sand underline underline-offset-4">
            Ask {firstName(author.name)} in chat
          </Link>
        </p>
      )}
    </div>
  )
}
