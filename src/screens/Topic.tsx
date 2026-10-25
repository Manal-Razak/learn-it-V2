import { useRef, type KeyboardEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../state/context'
import { STUDENTS } from '../data/students'
import { getTopic } from '../data/topics'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { PeerCard } from '../components/PeerCard'
import { ResourceItem } from '../components/ResourceItem'
import { TestCard } from '../components/TestCard'
import { EmptyState } from '../components/ui'
import { btn } from '../components/styles'
import NotFound from './NotFound'

const TABS = [
  { id: 'peers', label: 'Peers' },
  { id: 'tests', label: 'Practice tests' },
  { id: 'resources', label: 'Resources' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Topic() {
  const { topicId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { state, tests, resources } = useApp()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const topic = getTopic(topicId)
  if (!topic) return <NotFound />

  const requested = params.get('tab')
  const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : 'tests'

  function select(id: TabId) {
    setParams({ tab: id }, { replace: true })
  }

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = TABS.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    select(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  const topicTests = tests.filter((t) => t.topicId === topic.id)
  const topicResources = resources.filter((r) => r.topicId === topic.id)
  const peers = STUDENTS.filter((s) => s.canTeach.includes(topic.id))

  return (
    <div className="pb-8">
      <Header title={topic.name} fallback="/" />

      <div role="tablist" aria-label={`${topic.name} sections`} className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-deep p-1">
        {TABS.map((t, i) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 rounded-full px-2 text-sm font-semibold transition-colors ${
                active ? 'bg-sand text-deep' : 'text-ink hover:bg-panel'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="mt-5 rounded-card">
        {tab === 'tests' && (
          <div className="space-y-4">
            <Link to={`/practice/new?topic=${topic.id}`} className={`${btn.primary} w-full`}>
              <Icon name="plus" size={20} />
              Create a practice test
            </Link>
            {topicTests.length > 0 ? (
              <ul className="space-y-4">
                {topicTests.map((t) => (
                  <li key={t.id}>
                    <TestCard test={t} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="practice"
                title={`No practice tests for ${topic.name} yet`}
                action={
                  <Link to={`/practice/new?topic=${topic.id}`} className={btn.small}>
                    Create the first test
                  </Link>
                }
              >
                No student has made one yet. Making the first test helps you learn the topic more deeply, and you earn 1
                credit each time someone completes it.
              </EmptyState>
            )}
          </div>
        )}

        {tab === 'peers' &&
          (peers.length > 0 ? (
            <ul className="space-y-4">
              {peers.map((s) => (
                <li key={s.id}>
                  <PeerCard
                    student={s}
                    theyTeachYou={[topic.id]}
                    youTeachThem={state.canTeach.filter((t) => s.wantsToLearn.includes(t))}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="matches"
              title={`No one teaches ${topic.name} yet`}
              action={
                <Link to={`/practice/new?topic=${topic.id}`} className={btn.small}>
                  Create a practice test
                </Link>
              }
            >
              No student has listed this topic as something they can teach. You can still share what you know with a
              practice test.
            </EmptyState>
          ))}

        {tab === 'resources' && (
          <div className="space-y-4">
            <Link to={`/resources/new?topic=${topic.id}`} className={`${btn.ghost} w-full`}>
              <Icon name="plus" size={20} />
              Share a resource
            </Link>
            {topicResources.length > 0 ? (
              <ul className="space-y-4">
                {topicResources.map((r) => (
                  <li key={r.id}>
                    <ResourceItem resource={r} showTopic={false} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="resources"
                title={`No resources for ${topic.name} yet`}
                action={
                  <Link to={`/resources/new?topic=${topic.id}`} className={btn.small}>
                    Share the first resource
                  </Link>
                }
              >
                No one has shared notes, PDFs or links for this topic yet. If something helped you, share it here.
              </EmptyState>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
