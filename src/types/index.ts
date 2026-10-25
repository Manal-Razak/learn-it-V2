/** Pastel accent used for per-person / per-topic colour coding. */
export type Pastel = 'sky' | 'lavender' | 'salmon' | 'sand'

export type HairStyle =
  | 'short'
  | 'buzz'
  | 'spiky'
  | 'long'
  | 'bob'
  | 'curly'
  | 'afro'
  | 'bun'
  | 'ponytail'
  | 'hijab'

export interface AvatarSpec {
  skin: string
  hair: HairStyle
  hairColor: string
  bg: Pastel
  shirt: string
  glasses?: boolean
  beard?: boolean
}

export interface Topic {
  id: string
  name: string
  color: Pastel
}

export interface Student {
  id: string
  name: string
  course: string
  year: number
  university: string
  avatar: AvatarSpec
  canTeach: string[]
  wantsToLearn: string[]
  bio: string
  /** Plain-language availability, e.g. "Tue & Thu evenings" */
  availability: string
  online: boolean
}

export interface Question {
  id: string
  prompt: string
  /** Optional code snippet shown under the prompt in a monospace block. */
  code?: string
  options: string[]
  correctIndex: number
  /** The author's explanation, shown after answering. */
  explanation: string
  /** Resource that helps with this question specifically. */
  resourceId?: string
}

export type TestStatus = 'draft' | 'published'

export interface PracticeTest {
  id: string
  title: string
  topicId: string
  /** Student id, or ME_ID for tests the user made. */
  authorId: string
  questions: Question[]
  /** Students (other than you) who completed it. */
  takenBy: number
  resourceIds: string[]
  status: TestStatus
  /** ISO date-time */
  createdAt: string
}

export type ResourceType = 'pdf' | 'link' | 'notes'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  topicId: string
  authorId: string
  url?: string
  /** Notes text, or a text preview for demo PDFs. */
  body?: string
  description?: string
  /** Saves by other students. */
  saves: number
  createdAt: string
}

export type Attachment =
  | { kind: 'test'; testId: string }
  | { kind: 'resource'; resourceId: string }
  | { kind: 'link'; title: string; url: string }

export interface ChatMessage {
  id: string
  from: 'me' | 'peer' | 'system'
  text: string
  /** ISO date-time */
  at: string
  attachment?: Attachment
}

export type TestRound = 'full' | 'retry'

export interface Score {
  correct: number
  total: number
}

export interface TestProgress {
  testId: string
  round: TestRound
  /** Question ids in this round, in order. */
  order: string[]
  /** Position in `order` of the current question. */
  index: number
  /** questionId -> chosen option index, for this round. */
  answers: Record<string, number>
  finished: boolean
  /** Score of the most recent completed full round. */
  lastFullScore?: Score
  updatedAt: string
}

export type SessionRole = 'learn' | 'teach'

export interface Session {
  id: string
  peerId: string
  topicId: string
  /** ISO date-time */
  startsAt: string
  durationMins: number
  role: SessionRole
  credits: number
  place: string
}

export interface CreditEntry {
  id: string
  /** Positive = earned, negative = spent. */
  amount: number
  reason: string
  at: string
}

export interface UserProfile {
  name: string
  avatar: AvatarSpec
}

export interface UserState {
  version: 2
  profile: UserProfile
  /** Topics the user is learning (needs help with). */
  learning: string[]
  canTeach: string[]
  credits: number
  creditHistory: CreditEntry[]
  sessions: Session[]
  /** Tests the user made: drafts and published. */
  myTests: PracticeTest[]
  myResources: Resource[]
  savedResourceIds: string[]
  /** testId -> progress */
  progress: Record<string, TestProgress>
  /** Tests the user finished at least once. */
  completedTestIds: string[]
  /** peerId -> messages */
  chats: Record<string, ChatMessage[]>
  /** peerId -> quick replies already used */
  usedQuickReplies: Record<string, string[]>
}

export type MatchKind = 'swap' | 'helper'

export interface Match {
  student: Student
  kind: MatchKind
  /** Topics they teach that you are learning. */
  theyTeachYou: string[]
  /** Topics you teach that they want to learn. */
  youTeachThem: string[]
}
