import { useNavigate } from 'react-router-dom'
import type { PracticeTest } from '../types'
import { useApp } from '../state/context'
import { ME_ID } from '../data/seed'
import { personName } from '../lib/people'
import { answeredCount } from '../lib/scoring'
import { plural, takenLabel } from '../lib/text'
import { PersonAvatar, ProgressBar, TopicTag, TypeBadge } from './ui'
import { btn } from './styles'

interface TestCardProps {
  test: PracticeTest
  showTopic?: boolean
  /** Show the "Practice test" type badge (used in the Resources list). */
  showType?: boolean
}

/** Peer-made practice test with progress and a Start / Resume / Retake button. */
export function TestCard({ test, showTopic = false, showType = false }: TestCardProps) {
  const { state, timesTaken, startTest, restartTest } = useApp()
  const navigate = useNavigate()
  const progress = state.progress[test.id]
  const inProgress = !!progress && !progress.finished
  const finished = !!progress?.finished
  const mine = test.authorId === ME_ID
  const taken = timesTaken(test)
  const titleId = `test-${test.id}-title`

  function open() {
    if (!progress) startTest(test.id)
    else if (finished) restartTest(test.id)
    navigate(`/test/${test.id}`)
  }

  const action = !progress ? 'Start' : inProgress ? 'Resume' : 'Retake'
  const answered = progress ? answeredCount(progress) : 0

  return (
    <article aria-labelledby={titleId} className="rounded-card bg-panel p-5">
      {(showType || showTopic) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {showType && <TypeBadge type="test" />}
          {showTopic && <TopicTag topicId={test.topicId} />}
        </div>
      )}
      <h3 id={titleId} className="text-base font-semibold leading-snug">
        {test.title}
      </h3>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <PersonAvatar id={test.authorId} size={24} />
        {mine ? 'Made by you' : `by ${personName(test.authorId)}`}
      </p>
      <p className="mt-1 text-sm text-muted">
        {plural(test.questions.length, 'question')} · {takenLabel(taken)}
        {mine && taken > 0 && <> · {plural(taken, 'credit')} earned</>}
      </p>

      {inProgress && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-muted">
            {progress.round === 'retry' ? 'Retrying wrong answers: ' : ''}
            {answered} of {progress.order.length} answered
          </p>
          <ProgressBar value={answered} max={progress.order.length} label={`Progress in ${test.title}`} />
        </div>
      )}
      {finished && progress.lastFullScore && (
        <p className="mt-3 text-sm font-medium">
          Your last score: {progress.lastFullScore.correct} of {progress.lastFullScore.total}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={open} className={btn.small}>
          {action}
          <span className="sr-only"> {test.title}</span>
        </button>
      </div>
    </article>
  )
}
