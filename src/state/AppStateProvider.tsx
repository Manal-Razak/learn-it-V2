import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  Attachment,
  ChatMessage,
  PracticeTest,
  Resource,
  Score,
  Session,
  TestProgress,
  TestRound,
  UserState,
} from '../types'
import { AppContext, type AppApi, type BookingInput, type SendResult, type Toast } from './context'
import { ME_ID, SESSION_CREDITS, TEST_COMPLETION_CREDITS, createSeedState } from '../data/seed'
import { SEED_TESTS } from '../data/tests'
import { SEED_RESOURCES } from '../data/resources'
import { STUDENTS, firstName, getStudent } from '../data/students'
import { topicName } from '../data/topics'
import { readJSON, writeJSON } from '../lib/storage'
import { newId } from '../lib/ids'
import { computeMatches } from '../lib/matching'
import { pickReply } from '../lib/replies'
import { scoreRound, wrongIds } from '../lib/scoring'
import { formatSlot } from '../lib/time'

const STORAGE_KEY = 'learnit-v2:state'
const DUPLICATE_WINDOW_MS = 3000
const REPLY_DELAY_MS = 1400
/** After publishing, a simulated classmate completes the test so the earning loop is visible. */
const SIMULATED_COMPLETION_MS = 15_000

const seedTestById = new Map(SEED_TESTS.map((t) => [t.id, t]))
const seedResourceById = new Map(SEED_RESOURCES.map((r) => [r.id, r]))

function loadState(): UserState {
  const seed = createSeedState(new Date())
  const saved = readJSON<Partial<UserState>>(STORAGE_KEY)
  if (!saved || saved.version !== seed.version) return seed
  // Spread over the seed so a missing field never crashes the app.
  return { ...seed, ...saved }
}

function findTest(id: string, myTests: PracticeTest[]): PracticeTest | undefined {
  return myTests.find((t) => t.id === id) ?? seedTestById.get(id)
}

function freshProgress(test: PracticeTest, round: TestRound, order: string[], lastFullScore?: Score): TestProgress {
  return {
    testId: test.id,
    round,
    order,
    index: 0,
    answers: {},
    finished: false,
    lastFullScore,
    updatedAt: new Date().toISOString(),
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]
}

function appendMessage(state: UserState, peerId: string, message: ChatMessage): UserState {
  return { ...state, chats: { ...state.chats, [peerId]: [...(state.chats[peerId] ?? []), message] } }
}

function upcoming(sessions: Session[], now = Date.now()): Session[] {
  return sessions
    .filter((s) => new Date(s.startsAt).getTime() + s.durationMins * 60_000 > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(loadState)
  const [typing, setTyping] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<Toast | null>(null)

  const stateRef = useRef(state)
  const timers = useRef(new Set<number>())
  const replyTimers = useRef<Record<string, number>>({})
  const lastSent = useRef<Record<string, { key: string; at: number }>>({})

  useEffect(() => {
    stateRef.current = state
    writeJSON(STORAGE_KEY, state)
  }, [state])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = Date.now()
      setToast({ id, message })
      later(() => setToast((t) => (t?.id === id ? null : t)), 4500)
    },
    [later],
  )

  // ---------- Tests ----------

  const saveDraft = useCallback((test: PracticeTest) => {
    setState((s) => ({ ...s, myTests: upsert(s.myTests, { ...test, status: 'draft' }) }))
  }, [])

  const publishTest = useCallback(
    (test: PracticeTest) => {
      const published: PracticeTest = { ...test, status: 'published', takenBy: 0, createdAt: new Date().toISOString() }
      setState((s) => ({ ...s, myTests: upsert(s.myTests, published) }))

      // Simulate a classmate completing the test so the user sees how credits are earned.
      const candidates = STUDENTS.filter((st) => st.wantsToLearn.includes(test.topicId))
      const learner = candidates[Math.floor(Math.random() * candidates.length)] ?? STUDENTS[0]
      later(() => {
        const mine = stateRef.current.myTests.find((t) => t.id === test.id)
        if (!mine || mine.status !== 'published') return
        const at = new Date().toISOString()
        const entryId = newId('c')
        const name = firstName(learner.name)
        setState((s) => ({
          ...s,
          credits: s.credits + TEST_COMPLETION_CREDITS,
          creditHistory: [
            { id: entryId, amount: TEST_COMPLETION_CREDITS, reason: `${name} completed your test “${test.title}”`, at },
            ...s.creditHistory,
          ],
          myTests: s.myTests.map((t) => (t.id === test.id ? { ...t, takenBy: t.takenBy + 1 } : t)),
        }))
        showToast(`${name} completed your test “${test.title}”. 1 credit earned.`)
      }, SIMULATED_COMPLETION_MS)
    },
    [later, showToast],
  )

  const deleteTest = useCallback((id: string) => {
    setState((s) => {
      const progress = { ...s.progress }
      delete progress[id]
      return { ...s, myTests: s.myTests.filter((t) => t.id !== id), progress }
    })
  }, [])

  const startTest = useCallback((testId: string) => {
    setState((s) => {
      const test = findTest(testId, s.myTests)
      if (!test || s.progress[testId]) return s
      const p = freshProgress(test, 'full', test.questions.map((q) => q.id))
      return { ...s, progress: { ...s.progress, [testId]: p } }
    })
  }, [])

  const restartTest = useCallback((testId: string) => {
    setState((s) => {
      const test = findTest(testId, s.myTests)
      if (!test) return s
      const p = freshProgress(test, 'full', test.questions.map((q) => q.id), s.progress[testId]?.lastFullScore)
      return { ...s, progress: { ...s.progress, [testId]: p } }
    })
  }, [])

  const retryWrong = useCallback((testId: string) => {
    setState((s) => {
      const test = findTest(testId, s.myTests)
      const current = s.progress[testId]
      if (!test || !current) return s
      const wrong = wrongIds(test, current)
      if (wrong.length === 0) return s
      const p = freshProgress(test, 'retry', wrong, current.lastFullScore)
      return { ...s, progress: { ...s.progress, [testId]: p } }
    })
  }, [])

  const answerQuestion = useCallback((testId: string, questionId: string, optionIndex: number) => {
    setState((s) => {
      const p = s.progress[testId]
      if (!p || p.answers[questionId] !== undefined) return s
      const next: TestProgress = {
        ...p,
        answers: { ...p.answers, [questionId]: optionIndex },
        updatedAt: new Date().toISOString(),
      }
      return { ...s, progress: { ...s.progress, [testId]: next } }
    })
  }, [])

  const nextQuestion = useCallback((testId: string) => {
    setState((s) => {
      const p = s.progress[testId]
      const test = findTest(testId, s.myTests)
      if (!p || !test || p.finished) return s
      const updatedAt = new Date().toISOString()
      if (p.index + 1 < p.order.length) {
        return { ...s, progress: { ...s.progress, [testId]: { ...p, index: p.index + 1, updatedAt } } }
      }
      const isFull = p.round === 'full'
      const finished: TestProgress = {
        ...p,
        finished: true,
        updatedAt,
        lastFullScore: isFull ? scoreRound(test, p) : p.lastFullScore,
      }
      const completedTestIds =
        isFull && !s.completedTestIds.includes(testId) ? [...s.completedTestIds, testId] : s.completedTestIds
      return { ...s, completedTestIds, progress: { ...s.progress, [testId]: finished } }
    })
  }, [])

  // ---------- Resources ----------

  const addResource = useCallback((resource: Resource) => {
    setState((s) => ({ ...s, myResources: [...s.myResources, resource] }))
  }, [])

  const toggleSave = useCallback((resourceId: string) => {
    setState((s) => ({
      ...s,
      savedResourceIds: s.savedResourceIds.includes(resourceId)
        ? s.savedResourceIds.filter((id) => id !== resourceId)
        : [...s.savedResourceIds, resourceId],
    }))
  }, [])

  // ---------- Chat ----------

  const scheduleReply = useCallback((peerId: string, text: string, sentAttachment: boolean) => {
    const peer = getStudent(peerId)
    if (!peer) return
    const current = stateRef.current
    const session = upcoming(current.sessions).find((s) => s.peerId === peerId)

    // Offer a resource the peer shared on something they teach, preferring one not already sent in this chat.
    const alreadySent = new Set(
      (current.chats[peerId] ?? []).flatMap((m) => (m.attachment?.kind === 'resource' ? [m.attachment.resourceId] : [])),
    )
    const relevant = SEED_RESOURCES.filter(
      (r) => peer.canTeach.includes(r.topicId) && (r.authorId === peerId || current.learning.includes(r.topicId)),
    ).sort((a, b) => Number(b.authorId === peerId) - Number(a.authorId === peerId))
    const resource = relevant.find((r) => !alreadySent.has(r.id)) ?? relevant[0]

    const reply = pickReply(text, { peer, session, resource, sentAttachment })

    // A burst of messages gets one reply, to the latest message.
    window.clearTimeout(replyTimers.current[peerId])
    setTyping((t) => ({ ...t, [peerId]: true }))
    replyTimers.current[peerId] = window.setTimeout(() => {
      delete replyTimers.current[peerId]
      setTyping((t) => ({ ...t, [peerId]: false }))
      const message: ChatMessage = {
        id: newId('m'),
        from: 'peer',
        text: reply.text,
        at: new Date().toISOString(),
        attachment: reply.attachment,
      }
      setState((s) => appendMessage(s, peerId, message))
    }, REPLY_DELAY_MS)
  }, [])

  const sendMessage = useCallback(
    (peerId: string, raw: string, attachment?: Attachment): SendResult => {
      const text = raw.trim()
      if (!text && !attachment) return 'empty'

      // Ignore an identical message sent again within 3 seconds (double taps, repeated Enter).
      const key = `${text}|${attachment ? JSON.stringify(attachment) : ''}`
      const now = Date.now()
      const last = lastSent.current[peerId]
      if (last && last.key === key && now - last.at < DUPLICATE_WINDOW_MS) return 'duplicate'
      lastSent.current[peerId] = { key, at: now }

      const message: ChatMessage = { id: newId('m'), from: 'me', text, at: new Date(now).toISOString(), attachment }
      setState((s) => appendMessage(s, peerId, message))
      scheduleReply(peerId, text, !!attachment)
      return 'sent'
    },
    [scheduleReply],
  )

  const sendQuickReply = useCallback(
    (peerId: string, text: string): SendResult => {
      const result = sendMessage(peerId, text)
      if (result === 'sent') {
        setState((s) => ({
          ...s,
          usedQuickReplies: { ...s.usedQuickReplies, [peerId]: [...(s.usedQuickReplies[peerId] ?? []), text] },
        }))
      }
      return result
    },
    [sendMessage],
  )

  // ---------- Sessions ----------

  const bookSession = useCallback((input: BookingInput): Session | null => {
    const learning = input.role === 'learn'
    if (learning && stateRef.current.credits < SESSION_CREDITS) return null
    const peer = getStudent(input.peerId)
    const name = peer ? firstName(peer.name) : 'your peer'
    const topic = topicName(input.topicId)
    const session: Session = {
      ...input,
      id: newId('s'),
      durationMins: 60,
      credits: SESSION_CREDITS,
      place: 'Video call',
    }
    const at = new Date().toISOString()
    const entryId = newId('c')
    const note: ChatMessage = {
      id: newId('m'),
      from: 'system',
      text: learning
        ? `You booked a ${topic} session with ${name} for ${formatSlot(session.startsAt)}.`
        : `You booked a session to teach ${name} ${topic} on ${formatSlot(session.startsAt)}.`,
      at,
    }
    setState((s) => {
      const withSession: UserState = { ...s, sessions: [...s.sessions, session] }
      const paid: UserState = learning
        ? {
            ...withSession,
            credits: s.credits - SESSION_CREDITS,
            creditHistory: [
              { id: entryId, amount: -SESSION_CREDITS, reason: `${topic} session with ${name}`, at },
              ...s.creditHistory,
            ],
          }
        : withSession
      return appendMessage(paid, input.peerId, note)
    })
    return session
  }, [])

  // ---------- Demo ----------

  const resetDemo = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current.clear()
    Object.values(replyTimers.current).forEach((id) => window.clearTimeout(id))
    replyTimers.current = {}
    lastSent.current = {}
    setTyping({})
    setState(createSeedState(new Date()))
    showToast('Demo data reset')
  }, [showToast])

  // ---------- Derived ----------

  const api = useMemo<AppApi>(() => {
    const myPublished = state.myTests
      .filter((t) => t.status === 'published')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const myResources = [...state.myResources].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const myResourceById = new Map(state.myResources.map((r) => [r.id, r]))

    return {
      state,
      tests: [...myPublished, ...SEED_TESTS],
      resources: [...myResources, ...SEED_RESOURCES],
      matches: computeMatches(STUDENTS, state.learning, state.canTeach),
      upcomingSessions: upcoming(state.sessions),
      typing,
      toast,
      getTest: (id) => findTest(id, state.myTests),
      getResource: (id) => myResourceById.get(id) ?? seedResourceById.get(id),
      timesTaken: (test) =>
        test.takenBy + (test.authorId !== ME_ID && state.completedTestIds.includes(test.id) ? 1 : 0),
      saveCount: (resource) => resource.saves + (state.savedResourceIds.includes(resource.id) ? 1 : 0),
      isSaved: (id) => state.savedResourceIds.includes(id),
      saveDraft,
      publishTest,
      deleteTest,
      addResource,
      toggleSave,
      startTest,
      restartTest,
      retryWrong,
      answerQuestion,
      nextQuestion,
      sendMessage,
      sendQuickReply,
      bookSession,
      showToast,
      resetDemo,
    }
  }, [
    state,
    typing,
    toast,
    saveDraft,
    publishTest,
    deleteTest,
    addResource,
    toggleSave,
    startTest,
    restartTest,
    retryWrong,
    answerQuestion,
    nextQuestion,
    sendMessage,
    sendQuickReply,
    bookSession,
    showToast,
    resetDemo,
  ])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

