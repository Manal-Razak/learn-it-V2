import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import type { Session, SessionRole, Student } from '../types'
import { useApp } from '../state/context'
import { SESSION_CREDITS } from '../data/seed'
import { firstName } from '../data/students'
import { topicName } from '../data/topics'
import { formatSlot, upcomingSlots } from '../lib/time'
import { plural } from '../lib/text'
import { Icon } from './Icon'
import { Sheet } from './Sheet'
import { FieldError, LoadingButton } from './ui'
import { btn, field } from './styles'

interface BookingSheetProps {
  peer: Student
  open: boolean
  onClose: () => void
  returnFocusTo?: RefObject<HTMLElement | null>
}

export function BookingSheet({ peer, open, onClose, returnFocusTo }: BookingSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={`Book a session with ${firstName(peer.name)}`} returnFocusTo={returnFocusTo}>
      <BookingForm peer={peer} onDone={onClose} />
    </Sheet>
  )
}

const LOADING_MS = 600

function BookingForm({ peer, onDone }: { peer: Student; onDone: () => void }) {
  const { state, bookSession } = useApp()
  const first = firstName(peer.name)

  // Topics they can teach you (the ones you're learning first) and topics you could teach them.
  const learnTopics = useMemo(
    () => [...peer.canTeach].sort((a, b) => Number(state.learning.includes(b)) - Number(state.learning.includes(a))),
    [peer.canTeach, state.learning],
  )
  const teachTopics = state.canTeach.filter((t) => peer.wantsToLearn.includes(t))
  const slots = useMemo(() => upcomingSlots(), [])

  const [role, setRole] = useState<SessionRole>('learn')
  const [topicId, setTopicId] = useState(learnTopics[0] ?? '')
  const [slot, setSlot] = useState<string | null>(null)
  const [slotError, setSlotError] = useState(false)
  const [status, setStatus] = useState<'idle' | 'booking' | 'done'>('idle')
  const [booked, setBooked] = useState<Session | null>(null)
  const firstSlotRef = useRef<HTMLInputElement>(null)
  const doneHeadingRef = useRef<HTMLHeadingElement>(null)

  const topics = role === 'learn' ? learnTopics : teachTopics
  const cannotAfford = role === 'learn' && state.credits < SESSION_CREDITS

  useEffect(() => {
    if (status === 'done') doneHeadingRef.current?.focus()
  }, [status])

  function changeRole(next: SessionRole) {
    setRole(next)
    setTopicId((next === 'learn' ? learnTopics : teachTopics)[0] ?? '')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (status !== 'idle' || cannotAfford) return
    if (!slot) {
      setSlotError(true)
      firstSlotRef.current?.focus()
      return
    }
    setStatus('booking')
    window.setTimeout(() => {
      const session = bookSession({ peerId: peer.id, topicId, startsAt: slot, role })
      if (!session) {
        setStatus('idle')
        return
      }
      setBooked(session)
      setStatus('done')
    }, LOADING_MS)
  }

  if (status === 'done' && booked) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="grid size-16 animate-pop place-items-center rounded-full bg-sand text-deep">
          <Icon name="check" size={34} />
        </span>
        <h3 ref={doneHeadingRef} tabIndex={-1} className="mt-4 text-xl font-semibold outline-none">
          Session booked
        </h3>
        <p className="mt-1 text-sm text-muted">
          {topicName(booked.topicId)} with {first} · {formatSlot(booked.startsAt)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {booked.role === 'learn'
            ? `${plural(SESSION_CREDITS, 'credit')} spent. You have ${plural(state.credits, 'credit')} left.`
            : `You’ll earn ${plural(SESSION_CREDITS, 'credit')} after the session.`}
        </p>
        <button type="button" onClick={onDone} className={`${btn.primary} mt-6 w-full`}>
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {teachTopics.length > 0 && (
        <fieldset>
          <legend className={field.label}>What do you want to do?</legend>
          <div className="grid gap-2">
            {(
              [
                ['learn', `Learn from ${first}`, `Costs ${plural(SESSION_CREDITS, 'credit')}`],
                ['teach', `Teach ${first}`, `You earn ${plural(SESSION_CREDITS, 'credit')} after the session`],
              ] as const
            ).map(([value, title, hint]) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-2xl bg-deep p-4 ring-1 ring-white/10 has-[:checked]:ring-2 has-[:checked]:ring-sand"
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => changeRole(value)}
                  className="radio mt-0.5"
                />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="booking-topic" className={field.label}>
          Topic
        </label>
        <select id="booking-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field.input}>
          {topics.map((t) => (
            <option key={t} value={t}>
              {topicName(t)}
            </option>
          ))}
        </select>
      </div>

      <fieldset aria-describedby={slotError ? 'slot-error' : 'slot-hint'}>
        <legend className={field.label}>Choose a time</legend>
        <p id="slot-hint" className="-mt-0.5 mb-2 text-sm text-muted">
          {first} is usually free {peer.availability}. Sessions last 60 minutes, by video call.
        </p>
        <div className="flex flex-wrap gap-2">
          {slots.map((s, i) => (
            <label
              key={s}
              className="focus-ring-within cursor-pointer rounded-full bg-deep px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-white/25 has-[:checked]:bg-sand has-[:checked]:text-deep has-[:checked]:ring-sand"
            >
              <input
                ref={i === 0 ? firstSlotRef : undefined}
                type="radio"
                name="slot"
                value={s}
                checked={slot === s}
                onChange={() => {
                  setSlot(s)
                  setSlotError(false)
                }}
                className="sr-only"
              />
              {formatSlot(s)}
            </label>
          ))}
        </div>
        {slotError && <FieldError id="slot-error">Choose a time for the session.</FieldError>}
      </fieldset>

      {role === 'learn' &&
        (cannotAfford ? (
          <div className="rounded-2xl bg-deep p-4 text-sm">
            <p className="font-semibold text-salmon">
              You need {plural(SESSION_CREDITS, 'credit')}, but you have {plural(state.credits, 'credit')}.
            </p>
            <p className="mt-1 text-muted">Earn credits by teaching a peer or by making a practice test others complete.</p>
            <Link to="/practice/new" className={`${btn.text} mt-2`}>
              Create a practice test
            </Link>
          </div>
        ) : (
          <p className="flex items-start gap-2 text-sm text-muted">
            <Icon name="coin" size={18} className="mt-px shrink-0 text-sand" />
            This costs {plural(SESSION_CREDITS, 'credit')}. You have {plural(state.credits, 'credit')}.
          </p>
        ))}

      <LoadingButton
        type="submit"
        loading={status === 'booking'}
        loadingText="Booking…"
        disabled={cannotAfford}
        className={`${btn.primary} w-full`}
      >
        Book session
      </LoadingButton>
    </form>
  )
}
