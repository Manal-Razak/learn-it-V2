import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/context'
import { PASTEL_BG, topicColor, topicName } from '../data/topics'
import { personName } from '../lib/people'
import { answeredCount } from '../lib/scoring'
import { creditChange, plural } from '../lib/text'
import { formatDay } from '../lib/time'
import { Avatar } from '../components/Avatar'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { Icon } from '../components/Icon'
import { SessionTicket } from '../components/SessionTicket'
import { EmptyState, ProgressBar, SectionTitle, TopicTag } from '../components/ui'
import { btn } from '../components/styles'

export default function Home() {
  const { state, tests, getTest, upcomingSessions, resetDemo } = useApp()
  const [showHistory, setShowHistory] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  // Most recently touched test that is still in progress.
  const resume = Object.values(state.progress)
    .filter((p) => !p.finished)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((p) => ({ progress: p, test: getTest(p.testId) }))
    .find((x) => x.test?.status === 'published')

  const nextSession = upcomingSessions[0]

  return (
    <div className="space-y-7 pb-6 pt-3">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[30px] font-extrabold leading-none tracking-tight">
            LEARN <span className="text-sand">IT</span>
          </p>
          <p className="mt-1 text-sm font-medium text-haze">know it all</p>
        </div>
        <span className="rounded-full ring-[3px] ring-sand/70">
          <Avatar spec={state.profile.avatar} size={44} label={`Your profile picture (${state.profile.name})`} />
        </span>
      </header>
      <h1 className="sr-only">Home</h1>

      {/* Credits */}
      <section aria-labelledby="credits-title" className="on-sand rounded-card bg-sand p-5 text-deep">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="credits-title" className="text-sm font-semibold uppercase tracking-wider text-deep/80">
              Swap credits
            </h2>
            <p className="mt-1 text-6xl font-extrabold leading-none tracking-tight">
              {state.credits}
              <span className="sr-only"> credits</span>
            </p>
          </div>
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-deep text-sand">
            <Icon name="coin" size={26} />
          </span>
        </div>
        <p className="mt-3 text-sm font-medium">Earn by teaching or making practice tests. Spend by learning.</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/matches" className={btn.dark}>
            Find my matches
            <Icon name="chevron-right" size={18} />
          </Link>
          <button
            type="button"
            aria-expanded={showHistory}
            aria-controls="credit-history"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-10 rounded-full px-2 text-sm font-semibold underline underline-offset-4"
          >
            {showHistory ? 'Hide credit history' : 'Credit history'}
          </button>
        </div>
        <ul id="credit-history" hidden={!showHistory} className="mt-4 space-y-2 border-t-2 border-dashed border-deep/30 pt-4">
          {state.creditHistory.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block font-semibold">{creditChange(entry.amount)}</span>
                <span className="block text-deep/80">{entry.reason}</span>
              </span>
              <span className="shrink-0 text-deep/80">{formatDay(entry.at)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Continue practising */}
      <section aria-labelledby="continue-title">
        <SectionTitle
          id="continue-title"
          action={
            <Link to="/practice" className={btn.text}>
              All practice tests
            </Link>
          }
        >
          Continue practising
        </SectionTitle>
        {resume?.test ? (
          <div className="rounded-card bg-panel p-5">
            <TopicTag topicId={resume.test.topicId} />
            <h3 className="mt-2 text-lg font-semibold leading-snug">{resume.test.title}</h3>
            <p className="text-sm text-muted">by {personName(resume.test.authorId)}</p>
            <div className="mb-1.5 mt-4 flex items-center justify-between text-sm font-medium">
              <span>
                Question {resume.progress.index + 1} of {resume.progress.order.length}
              </span>
              <span className="text-muted">{plural(answeredCount(resume.progress), 'answer')} so far</span>
            </div>
            <ProgressBar
              value={answeredCount(resume.progress)}
              max={resume.progress.order.length}
              label={`Progress in ${resume.test.title}`}
            />
            <Link to={`/test/${resume.test.id}`} className={`${btn.primary} mt-5 w-full`}>
              Resume
              <span className="sr-only"> {resume.test.title}</span>
            </Link>
          </div>
        ) : (
          <EmptyState
            icon="practice"
            title="No test in progress"
            action={
              <Link to="/practice" className={btn.small}>
                Browse practice tests
              </Link>
            }
          >
            You haven’t started a practice test yet. Tests made by other students show you what you already understand.
          </EmptyState>
        )}
      </section>

      {/* Your topics */}
      <section aria-labelledby="topics-title">
        <SectionTitle id="topics-title">Your topics</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {state.learning.map((id) => {
            const count = tests.filter((t) => t.topicId === id).length
            return (
              <li key={id}>
                <Link
                  to={`/topics/${id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-deep px-4 py-2 text-sm font-medium text-ink ring-1 ring-white/25 transition hover:ring-white/50"
                >
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${PASTEL_BG[topicColor(id)]}`} />
                  {topicName(id)}
                  <span className="text-muted">· {plural(count, 'test')}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Next session */}
      <section aria-labelledby="session-title">
        <SectionTitle id="session-title">Next session</SectionTitle>
        {nextSession ? (
          <SessionTicket session={nextSession} />
        ) : (
          <EmptyState
            icon="calendar"
            title="No session booked"
            action={
              <Link to="/matches" className={btn.small}>
                Find my matches
              </Link>
            }
          >
            You have no upcoming sessions. Book one with a peer who teaches what you need: it costs 2 credits, never money.
          </EmptyState>
        )}
      </section>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="min-h-10 rounded-full px-3 text-sm font-semibold text-haze underline underline-offset-4 hover:text-ink"
        >
          Reset demo data
        </button>
      </div>

      <ConfirmSheet
        open={confirmReset}
        title="Reset demo data?"
        confirmLabel="Reset demo data"
        cancelLabel="Keep my changes"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          resetDemo()
        }}
      >
        This removes the tests, resources and messages you created and puts back the starting demo data.
      </ConfirmSheet>
    </div>
  )
}
