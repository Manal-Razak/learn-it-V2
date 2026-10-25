import { createContext, useContext } from 'react'
import type { Attachment, Match, PracticeTest, Resource, Session, SessionRole, UserState } from '../types'

export interface Toast {
  id: number
  message: string
}

/** What happened to a chat message the user tried to send. */
export type SendResult = 'sent' | 'empty' | 'duplicate'

export interface BookingInput {
  peerId: string
  topicId: string
  startsAt: string
  role: SessionRole
}

export interface AppApi {
  state: UserState
  /** All published tests, the user's newest first. */
  tests: PracticeTest[]
  /** All shared resources, the user's newest first. */
  resources: Resource[]
  matches: Match[]
  /** Upcoming sessions, soonest first. */
  upcomingSessions: Session[]
  /** peerId -> the simulated peer is "typing" */
  typing: Record<string, boolean>
  toast: Toast | null

  /** Any test, including the user's drafts. */
  getTest: (id: string) => PracticeTest | undefined
  getResource: (id: string) => Resource | undefined
  timesTaken: (test: PracticeTest) => number
  saveCount: (resource: Resource) => number
  isSaved: (resourceId: string) => boolean

  saveDraft: (test: PracticeTest) => void
  publishTest: (test: PracticeTest) => void
  deleteTest: (id: string) => void
  addResource: (resource: Resource) => void
  toggleSave: (resourceId: string) => void

  startTest: (testId: string) => void
  restartTest: (testId: string) => void
  retryWrong: (testId: string) => void
  answerQuestion: (testId: string, questionId: string, optionIndex: number) => void
  nextQuestion: (testId: string) => void

  sendMessage: (peerId: string, text: string, attachment?: Attachment) => SendResult
  sendQuickReply: (peerId: string, text: string) => SendResult
  bookSession: (input: BookingInput) => Session | null

  showToast: (message: string) => void
  resetDemo: () => void
}

export const AppContext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>')
  return ctx
}
