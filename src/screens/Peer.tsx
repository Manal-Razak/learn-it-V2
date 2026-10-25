import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useApp } from '../state/context'
import { firstName, getStudent } from '../data/students'
import { Avatar } from '../components/Avatar'
import { BookingSheet } from '../components/BookingSheet'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { ResourceItem } from '../components/ResourceItem'
import { TestCard } from '../components/TestCard'
import { EmptyState, SectionTitle, TopicTag } from '../components/ui'
import { btn } from '../components/styles'
import NotFound from './NotFound'

export default function Peer() {
  const { peerId = '' } = useParams()
  const { hash } = useLocation()
  const { tests, resources } = useApp()
  const [bookingOpen, setBookingOpen] = useState(false)
  const testsHeadingRef = useRef<HTMLHeadingElement>(null)
  const peer = getStudent(peerId)

  // "See their tests" links here with #tests: jump straight to that section.
  useEffect(() => {
    if (hash === '#tests' && testsHeadingRef.current) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      testsHeadingRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      testsHeadingRef.current.focus({ preventScroll: true })
    }
  }, [hash, peerId])

  if (!peer) return <NotFound />
  const first = firstName(peer.name)
  const theirTests = tests.filter((t) => t.authorId === peer.id)
  const theirResources = resources.filter((r) => r.authorId === peer.id)

  return (
    <div className="pb-8">
      <Header title={peer.name} fallback="/matches" />

      <section aria-label={`About ${peer.name}`} className="mt-3 rounded-card bg-panel p-5">
        <div className="flex items-center gap-4">
          <Avatar spec={peer.avatar} size={72} />
          <div className="min-w-0">
            <p className="text-sm text-muted">
              {peer.course} · Year {peer.year}
            </p>
            <p className="text-sm text-muted">{peer.university}</p>
            <p className="mt-1 text-sm font-medium">{peer.online ? 'Online now' : `Usually free ${peer.availability}`}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{peer.bio}</p>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Can teach</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {peer.canTeach.map((t) => (
                <TopicTag key={t} topicId={t} />
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Wants to learn</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {peer.wantsToLearn.map((t) => (
                <TopicTag key={t} topicId={t} />
              ))}
            </dd>
          </div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setBookingOpen(true)} className={btn.smallGhost}>
            <Icon name="calendar" size={18} />
            Book session
          </button>
          <Link to={`/chat/${peer.id}`} className={btn.small}>
            <Icon name="chat" size={18} />
            Message {first}
          </Link>
        </div>
      </section>

      <section aria-labelledby="peer-tests-title" className="mt-7 scroll-mt-4">
        <SectionTitle>
          <span id="peer-tests-title" ref={testsHeadingRef} tabIndex={-1} className="outline-none">
            Practice tests by {first}
          </span>
        </SectionTitle>
        {theirTests.length > 0 ? (
          <ul className="space-y-4">
            {theirTests.map((t) => (
              <li key={t.id}>
                <TestCard test={t} showTopic />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="practice"
            title={`${first} hasn’t made a practice test yet`}
            action={
              <Link to={`/chat/${peer.id}`} className={btn.small}>
                Message {first}
              </Link>
            }
          >
            Not everyone writes tests. You can still ask {first} a question in chat or book a session.
          </EmptyState>
        )}
      </section>

      {theirResources.length > 0 && (
        <section aria-labelledby="peer-res-title" className="mt-7">
          <SectionTitle id="peer-res-title">Shared by {first}</SectionTitle>
          <ul className="space-y-4">
            {theirResources.map((r) => (
              <li key={r.id}>
                <ResourceItem resource={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <BookingSheet peer={peer} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
