import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PracticeTest } from '../types'
import { useApp } from '../state/context'
import { TOPICS, topicColor, topicName } from '../data/topics'
import { formatDay } from '../lib/time'
import { plural } from '../lib/text'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { Icon } from '../components/Icon'
import { TestCard } from '../components/TestCard'
import { Chip, EmptyState, SectionTitle, TopicTag } from '../components/ui'
import { btn } from '../components/styles'

export default function Practice() {
  const { state, tests, getTest, deleteTest, showToast } = useApp()
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<PracticeTest | null>(null)

  const inProgress = Object.values(state.progress)
    .filter((p) => !p.finished)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((p) => getTest(p.testId))
    .filter((t): t is PracticeTest => t?.status === 'published')

  const myTests = [...state.myTests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const myPublished = myTests.filter((t) => t.status === 'published')
  const myDrafts = myTests.filter((t) => t.status === 'draft')

  const listed = tests.filter((t) => !topicFilter || t.topicId === topicFilter)
  // Topics with tests first, then the user's topics, so the chip row starts with what's useful.
  const chipTopics = [...TOPICS].sort(
    (a, b) =>
      Number(state.learning.includes(b.id)) - Number(state.learning.includes(a.id)) ||
      Number(tests.some((t) => t.topicId === b.id)) - Number(tests.some((t) => t.topicId === a.id)),
  )

  return (
    <div className="space-y-7 pb-6 pt-3">
      <header>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="mt-1 text-sm text-haze">Practice tests made by students, for students.</p>
      </header>

      <Link to="/practice/new" className={`${btn.primary} w-full`}>
        <Icon name="plus" size={20} />
        Create a practice test
      </Link>

      {inProgress.length > 0 && (
        <section aria-labelledby="progress-title">
          <SectionTitle id="progress-title">Continue practising</SectionTitle>
          <ul className="space-y-4">
            {inProgress.map((t) => (
              <li key={t.id}>
                <TestCard test={t} showTopic />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mine-title">
        <SectionTitle id="mine-title">Your tests</SectionTitle>
        {myTests.length === 0 ? (
          <EmptyState
            icon="sparkle"
            title="You haven’t made a test yet"
            action={
              <Link to="/practice/new" className={btn.small}>
                Create a practice test
              </Link>
            }
          >
            Writing questions for others is one of the best ways to learn a topic yourself. You also earn 1 credit each time
            someone completes your test.
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {myDrafts.map((t) => (
              <li key={t.id}>
                <article aria-labelledby={`draft-${t.id}`} className="rounded-card bg-panel p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-deep px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-white/25">
                      Draft
                    </span>
                    <TopicTag topicId={t.topicId} />
                  </div>
                  <h3 id={`draft-${t.id}`} className="mt-2 text-base font-semibold leading-snug">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {plural(t.questions.length, 'question')} · saved {formatDay(t.createdAt).toLowerCase()} · not
                    published yet
                  </p>
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setToDelete(t)} className={btn.smallGhost}>
                      <Icon name="trash" size={16} />
                      Delete
                      <span className="sr-only"> draft {t.title}</span>
                    </button>
                    <Link to={`/practice/edit/${t.id}`} className={btn.small}>
                      <Icon name="edit" size={16} />
                      Edit draft
                      <span className="sr-only"> {t.title}</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
            {myPublished.map((t) => (
              <li key={t.id}>
                <TestCard test={t} showTopic />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="all-title">
        <SectionTitle id="all-title">All practice tests</SectionTitle>
        <div role="group" aria-label="Filter by topic" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip selected={topicFilter === null} onClick={() => setTopicFilter(null)}>
            All topics
          </Chip>
          {chipTopics.map((t) => (
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
        <p className="mb-3 mt-3 text-sm text-haze" aria-live="polite">
          {plural(listed.length, 'test')}
          {topicFilter && (
            <>
              {' '}
              in {topicName(topicFilter)} ·{' '}
              <Link to={`/topics/${topicFilter}`} className="font-semibold text-sand underline underline-offset-4">
                Open topic page
              </Link>
            </>
          )}
        </p>
        {listed.length > 0 ? (
          <ul className="space-y-4">
            {listed.map((t) => (
              <li key={t.id}>
                <TestCard test={t} showTopic={!topicFilter} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="practice"
            title={`No practice tests for ${topicName(topicFilter ?? '')} yet`}
            action={
              <>
                <Link to={`/practice/new?topic=${topicFilter ?? ''}`} className={btn.small}>
                  Create the first test
                </Link>
                <button type="button" onClick={() => setTopicFilter(null)} className={btn.smallGhost}>
                  Show all topics
                </button>
              </>
            }
          >
            No student has made a test for this topic yet. If you know it, your test could help others, and earn you
            credits.
          </EmptyState>
        )}
      </section>

      <ConfirmSheet
        open={toDelete !== null}
        title="Delete this draft?"
        confirmLabel="Delete draft"
        cancelLabel="Keep draft"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteTest(toDelete.id)
            showToast('Draft deleted')
          }
          setToDelete(null)
        }}
      >
        “{toDelete?.title}” will be removed. This can’t be undone.
      </ConfirmSheet>
    </div>
  )
}
