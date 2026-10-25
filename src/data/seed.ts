import type { UserState } from '../types'

/** Author id used for tests and resources the user creates. */
export const ME_ID = 'me'

/** Credits a one-hour peer session costs (learning) or earns (teaching). */
export const SESSION_CREDITS = 2

/** Credits the author earns each time another student completes their test. */
export const TEST_COMPLETION_CREDITS = 1

export const QUICK_REPLIES = [
  'When are you free?',
  'I’m stuck on a question',
  'Can you share a resource?',
  'Thanks!',
]

function daysFrom(base: Date, days: number, hours: number, minutes = 0): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

/** Next Thursday at least two days away, so the demo session is always upcoming. */
function nextThursday(now: Date): number {
  const diff = (4 - now.getDay() + 7) % 7
  return diff < 2 ? diff + 7 : diff
}

/**
 * Starting state for the demo user, with dates relative to `now` so the
 * prototype always looks current.
 */
export function createSeedState(now: Date): UserState {
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString()

  return {
    version: 2,
    profile: {
      name: 'Sam',
      avatar: { skin: '#E8B48F', hair: 'curly', hairColor: '#6B3F2A', bg: 'sand', shirt: '#5B4C8F', glasses: true },
    },
    learning: ['linear-algebra', 'statistics', 'python-basics'],
    canTeach: ['calculus', 'academic-writing'],
    credits: 6,
    creditHistory: [
      {
        id: 'c-3',
        amount: -2,
        reason: 'Statistics session with Jonas',
        at: minutesAgo(60 * 26),
      },
      {
        id: 'c-2',
        amount: 2,
        reason: 'You taught Calculus to Noah',
        at: minutesAgo(60 * 24 * 4),
      },
      {
        id: 'c-1',
        amount: 2,
        reason: 'You taught Academic writing to Ali',
        at: minutesAgo(60 * 24 * 6),
      },
      {
        id: 'c-0',
        amount: 4,
        reason: 'Welcome to LEARN IT',
        at: minutesAgo(60 * 24 * 9),
      },
    ],
    sessions: [
      {
        id: 's-jonas',
        peerId: 'jonas',
        topicId: 'statistics',
        startsAt: daysFrom(now, nextThursday(now), 16),
        durationMins: 60,
        role: 'learn',
        credits: 2,
        place: 'Video call',
      },
    ],
    myTests: [],
    myResources: [],
    savedResourceIds: ['r-3b1b'],
    progress: {
      't-eigen': {
        testId: 't-eigen',
        round: 'full',
        order: ['eig-1', 'eig-2', 'eig-3', 'eig-4', 'eig-5', 'eig-6', 'eig-7', 'eig-8', 'eig-9', 'eig-10'],
        index: 3,
        // Two right, one wrong (correct answer for eig-3 is option 2).
        answers: { 'eig-1': 1, 'eig-2': 0, 'eig-3': 0 },
        finished: false,
        updatedAt: minutesAgo(90),
      },
    },
    completedTestIds: [],
    chats: {
      lena: [
        {
          id: 'm-l1',
          from: 'peer',
          text: 'Hi Sam! I saw you’re learning linear algebra. I made a practice test on eigenvalues, it might help 🙂',
          at: minutesAgo(60 * 22),
          attachment: { kind: 'test', testId: 't-eigen' },
        },
        {
          id: 'm-l2',
          from: 'me',
          text: 'Thank you! I started it, I’m on question 4.',
          at: minutesAgo(60 * 21),
        },
        {
          id: 'm-l3',
          from: 'peer',
          text: 'Nice! Tell me if any of the explanations are unclear.',
          at: minutesAgo(60 * 21 - 3),
        },
      ],
      jonas: [
        {
          id: 'm-j0',
          from: 'system',
          text: 'You booked a Statistics session with Jonas.',
          at: minutesAgo(60 * 26),
        },
        {
          id: 'm-j1',
          from: 'me',
          text: 'I’ll bring my questions on p-values.',
          at: minutesAgo(60 * 25),
        },
        {
          id: 'm-j2',
          from: 'peer',
          text: 'Perfect. These notes might help before we meet:',
          at: minutesAgo(60 * 25 - 4),
          attachment: { kind: 'resource', resourceId: 'r-pvalues' },
        },
      ],
    },
    usedQuickReplies: {},
  }
}
