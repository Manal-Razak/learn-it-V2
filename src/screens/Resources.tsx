import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PracticeTest, Resource } from '../types'
import { useApp } from '../state/context'
import { RESOURCE_TYPE_LABEL } from '../data/resources'
import { ME_ID } from '../data/seed'
import { TOPICS, topicColor, topicName } from '../data/topics'
import { personName } from '../lib/people'
import { plural } from '../lib/text'
import { Icon } from '../components/Icon'
import { ResourceItem } from '../components/ResourceItem'
import { TestCard } from '../components/TestCard'
import { Chip, EmptyState } from '../components/ui'
import { btn } from '../components/styles'

type Item = { kind: 'resource'; resource: Resource } | { kind: 'test'; test: PracticeTest }

function matches(item: Item, query: string): boolean {
  if (!query) return true
  const haystack =
    item.kind === 'resource'
      ? [item.resource.title, item.resource.description, personName(item.resource.authorId), RESOURCE_TYPE_LABEL[item.resource.type], topicName(item.resource.topicId)]
      : [item.test.title, personName(item.test.authorId), 'practice test', topicName(item.test.topicId)]
  return haystack.join(' ').toLowerCase().includes(query)
}

export default function Resources() {
  const { state, resources, tests, saveCount, timesTaken } = useApp()
  const [query, setQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [savedOnly, setSavedOnly] = useState(false)

  const q = query.trim().toLowerCase()
  const all: Item[] = [
    ...resources.map((resource) => ({ kind: 'resource' as const, resource })),
    ...tests.map((test) => ({ kind: 'test' as const, test })),
  ]
  // Your own items first, then by popularity (saves or completions).
  const popularity = (item: Item) => (item.kind === 'resource' ? saveCount(item.resource) : timesTaken(item.test))
  const isMine = (item: Item) => (item.kind === 'resource' ? item.resource.authorId : item.test.authorId) === ME_ID
  const items = all
    .filter((item) => !topicFilter || (item.kind === 'resource' ? item.resource.topicId : item.test.topicId) === topicFilter)
    .filter((item) => !savedOnly || (item.kind === 'resource' && state.savedResourceIds.includes(item.resource.id)))
    .filter((item) => matches(item, q))
    .sort((a, b) => Number(isMine(b)) - Number(isMine(a)) || popularity(b) - popularity(a))

  const filtersActive = !!q || !!topicFilter || savedOnly

  function clearAll() {
    setQuery('')
    setTopicFilter(null)
    setSavedOnly(false)
  }

  return (
    <div className="space-y-5 pb-6 pt-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="mt-1 text-sm text-haze">Notes, PDFs, links and tests shared by students.</p>
        </div>
      </header>

      <Link to={`/resources/new${topicFilter ? `?topic=${topicFilter}` : ''}`} className={`${btn.primary} w-full`}>
        <Icon name="plus" size={20} />
        Share a resource
      </Link>

      <div role="search">
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <div className="relative">
          <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="resource-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author or type"
            className="block w-full rounded-2xl bg-deep py-3 pl-12 pr-4 text-base text-ink ring-1 ring-white/10 placeholder:text-muted"
          />
        </div>
      </div>

      <div role="group" aria-label="Filter resources" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip selected={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          Saved
        </Chip>
        <Chip selected={topicFilter === null} onClick={() => setTopicFilter(null)}>
          All topics
        </Chip>
        {TOPICS.map((t) => (
          <Chip
            key={t.id}
            selected={topicFilter === t.id}
            color={topicColor(t.id)}
            onClick={() => setTopicFilter(topicFilter === t.id ? null : t.id)}
          >
            {t.name}
          </Chip>
        ))}
      </div>

      <div className="flex min-h-10 items-center justify-between gap-3">
        <p className="text-sm text-haze" aria-live="polite">
          {plural(items.length, 'item')}
        </p>
        {filtersActive && (
          <button type="button" onClick={clearAll} className={btn.text}>
            Clear search and filters
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.kind === 'resource' ? item.resource.id : item.test.id}>
              {item.kind === 'resource' ? (
                <ResourceItem resource={item.resource} showTopic={!topicFilter} />
              ) : (
                <TestCard test={item.test} showType showTopic={!topicFilter} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="resources"
          title="Nothing found"
          action={
            <>
              <button type="button" onClick={clearAll} className={btn.smallGhost}>
                Clear search and filters
              </button>
              <Link to={`/resources/new${topicFilter ? `?topic=${topicFilter}` : ''}`} className={btn.small}>
                Share a resource
              </Link>
            </>
          }
        >
          {savedOnly && !q && !topicFilter
            ? 'You haven’t saved any resources yet. Tap Save on a resource to keep it here.'
            : `Nothing matches${q ? ` “${query.trim()}”` : ''}${topicFilter ? ` in ${topicName(topicFilter)}` : ''}${
                savedOnly ? ' among your saved resources' : ''
              }. Try fewer filters, or share something useful yourself.`}
        </EmptyState>
      )}
    </div>
  )
}
