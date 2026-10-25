import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { PracticeTest, TestProgress } from '../types'
import { useApp } from '../state/context'
import { ME_ID, TEST_COMPLETION_CREDITS } from '../data/seed'
import { topicName } from '../data/topics'
import { personFirstName } from '../lib/people'
import { answeredCount, findQuestion, isCorrect, scoreRound, wrongIds } from '../lib/scoring'
import { LETTERS, plural } from '../lib/text'
import { useGoBack } from '../lib/useGoBack'
import { Icon } from '../components/Icon'
import { TicketCard } from '../components/TicketCard'
import { FieldError, PersonAvatar, ProgressBar } from '../components/ui'
import { btn } from '../components/styles'
import NotFound from './NotFound'

export default function TakeTest() {
  const { testId = '' } = useParams()
  const { state, getTest, startTest } = useApp()
  const test = getTest(testId)
  const available = !!test && test.status === 'published'
  const progress = state.progress[testId]

  // Direct links (e.g. from chat) start the test if it hasn't been started.
  useEffect(() => {
    if (available && !progress) startTest(testId)
  }, [available, progress, startTest, testId])

  if (!test || !available) return <NotFound />
  if (!progress) return null
  if (progress.finished) return <Results test={test} progress={progress} />
  return <QuestionView key={`${progress.round}-${progress.index}`} test={test} progress={progress} />
}

/** Chat draft for "Ask [author] about this". */
function askState(test: PracticeTest, questionNumber?: number) {
  const name = personFirstName(test.authorId)
  const about = questionNumber ? `question ${questionNumber} in “${test.title}”` : `your test “${test.title}”`
  return { draft: `Hi ${name}! I have a question about ${about}: ` }
}

function TopBar({ test, subtitle, exitLabel }: { test: PracticeTest; subtitle: string; exitLabel: string }) {
  const exit = useGoBack(`/topics/${test.topicId}?tab=tests`)
  return (
    <div className="flex items-center gap-3 pt-3">
      <button type="button" onClick={exit} aria-label={exitLabel} className={btn.icon}>
        <Icon name="close" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold">{test.title}</h1>
        <p className="text-xs font-medium text-haze">{subtitle}</p>
      </div>
    </div>
  )
}

function QuestionView({ test, progress }: { test: PracticeTest; progress: TestProgress }) {
  const { answerQuestion, nextQuestion, getResource } = useApp()
  const questionId = progress.order[progress.index]
  const question = findQuestion(test, questionId)
  const saved = progress.answers[questionId]
  const checked = saved !== undefined
  const [selected, setSelected] = useState<number | null>(null)
  const [missingAnswer, setMissingAnswer] = useState(false)
  const [justChecked, setJustChecked] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const feedbackRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the new question so screen readers read it.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (justChecked) feedbackRef.current?.focus()
  }, [justChecked])

  if (!question) return <NotFound />

  const position = progress.index + 1
  const total = progress.order.length
  const isLast = position >= total
  const chosen = checked ? saved : selected
  const correct = checked && saved === question.correctIndex
  const mine = test.authorId === ME_ID
  const author = personFirstName(test.authorId)
  const resource = getResource(question.resourceId ?? test.resourceIds[0] ?? '')
  const numberInTest = test.questions.findIndex((q) => q.id === question.id) + 1
  const headingId = `question-${question.id}`

  function check(e: FormEvent) {
    e.preventDefault()
    if (checked) return
    if (selected === null) {
      setMissingAnswer(true)
      return
    }
    answerQuestion(test.id, question!.id, selected)
    setJustChecked(true)
  }

  return (
    <div className="pb-8">
      <TopBar
        test={test}
        subtitle={progress.round === 'retry' ? 'Retrying wrong answers' : topicName(test.topicId)}
        exitLabel="Exit test (your progress is saved)"
      />

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold">
          Question {position} of {total}
        </p>
        <ProgressBar value={answeredCount(progress)} max={total} label="Test progress" />
      </div>

      <form onSubmit={check} noValidate>
        <fieldset
          aria-labelledby={headingId}
          aria-describedby={missingAnswer ? 'answer-error' : undefined}
          className="mt-5 rounded-card bg-panel p-5"
        >
          <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-lg font-semibold leading-snug outline-none">
            {question.prompt}
          </h2>
          {question.code && (
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-deep p-4 font-mono text-sm leading-relaxed text-ink">
              <code>{question.code}</code>
            </pre>
          )}

          <div className="mt-5 space-y-3">
            {question.options.map((option, i) => {
              const isChosen = chosen === i
              const isAnswer = i === question.correctIndex
              const look = !checked
                ? isChosen
                  ? 'bg-deep text-ink ring-2 ring-sand'
                  : 'bg-deep text-ink ring-1 ring-white/15 hover:ring-white/40'
                : isAnswer
                  ? 'bg-sky text-deep'
                  : isChosen
                    ? 'bg-salmon text-deep'
                    : 'bg-deep text-muted'
              const codeLike = /[[\](){}=]|^['"]/.test(option)
              return (
                <label
                  key={i}
                  className={`focus-ring-within flex items-center gap-3 rounded-2xl p-3.5 transition ${look} ${
                    checked ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    value={i}
                    checked={isChosen}
                    disabled={checked}
                    onChange={() => {
                      setSelected(i)
                      setMissingAnswer(false)
                    }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      checked && (isAnswer || isChosen) ? 'bg-deep/15' : isChosen ? 'bg-sand text-deep' : 'bg-panel'
                    }`}
                  >
                    {checked && isAnswer ? <Icon name="check" size={18} /> : checked && isChosen ? <Icon name="close" size={18} /> : LETTERS[i]}
                  </span>
                  <span className={`min-w-0 flex-1 break-words ${codeLike ? 'font-mono text-sm' : ''}`}>{option}</span>
                  {checked && isAnswer && <span className="shrink-0 text-xs font-bold">Correct answer</span>}
                  {checked && isChosen && !isAnswer && <span className="shrink-0 text-xs font-bold">Your answer</span>}
                </label>
              )
            })}
          </div>
          {missingAnswer && <FieldError id="answer-error">Choose an answer first.</FieldError>}
        </fieldset>

        {!checked && (
          <button type="submit" className={`${btn.primary} mt-5 w-full`}>
            Check answer
          </button>
        )}
      </form>

      {checked && (
        <>
          <section aria-labelledby="feedback-title" className="mt-4 rounded-card bg-panel p-5">
            <h2
              id="feedback-title"
              ref={feedbackRef}
              tabIndex={-1}
              className={`flex items-center gap-2 text-lg font-semibold outline-none ${correct ? 'text-sky' : 'text-salmon'}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-8 place-items-center rounded-full text-deep ${correct ? 'bg-sky' : 'bg-salmon'}`}
              >
                <Icon name={correct ? 'check' : 'close'} size={18} />
              </span>
              {correct ? 'Correct!' : 'Not quite'}
            </h2>
            {!correct && (
              <p className="mt-2 text-sm">
                The correct answer is{' '}
                <strong>
                  {LETTERS[question.correctIndex]}: {question.options[question.correctIndex]}
                </strong>
                .
              </p>
            )}

            <div className="mt-4 rounded-2xl bg-deep p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <PersonAvatar id={test.authorId} size={28} />
                {mine ? 'Your explanation' : `${author}’s explanation`}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>
            </div>

            {resource && (
              <Link
                to={`/resources/${resource.id}`}
                className="mt-3 flex items-center gap-3 rounded-2xl bg-deep p-4 ring-1 ring-white/10 transition hover:ring-white/30"
              >
                <Icon name={resource.type === 'link' ? 'link' : resource.type === 'pdf' ? 'file' : 'notes'} className="shrink-0 text-sand" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Related resource</span>
                  <span className="block font-semibold leading-snug">{resource.title}</span>
                </span>
                <Icon name="chevron-right" size={18} className="shrink-0" />
              </Link>
            )}

            {!mine && (
              <Link to={`/chat/${test.authorId}`} state={askState(test, numberInTest)} className={`${btn.ghost} mt-3 w-full`}>
                <Icon name="chat" size={20} />
                Ask {author} about this
              </Link>
            )}
          </section>

          <button type="button" onClick={() => nextQuestion(test.id)} className={`${btn.primary} mt-5 w-full`}>
            {isLast ? 'See my score' : 'Next question'}
            <Icon name="chevron-right" size={18} />
          </button>
        </>
      )}
    </div>
  )
}

function Results({ test, progress }: { test: PracticeTest; progress: TestProgress }) {
  const { retryWrong, restartTest } = useApp()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { correct, total } = scoreRound(test, progress)
  const wrong = wrongIds(test, progress)
  const isRetry = progress.round === 'retry'
  const mine = test.authorId === ME_ID
  const author = personFirstName(test.authorId)
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const message =
    wrong.length === 0
      ? 'Everything right. Nice work!'
      : pct >= 50
        ? 'Good progress. Retry the ones you missed to make them stick.'
        : 'Keep going: read the explanations, then retry the ones you missed.'

  return (
    <div className="pb-8">
      <TopBar test={test} subtitle={topicName(test.topicId)} exitLabel="Close results" />

      <TicketCard
        label={isRetry ? 'Retry round' : 'Test complete'}
        labelledBy="score-title"
        className="mt-5"
        footer={
          <p className="text-center text-sm font-semibold">
            {isRetry && progress.lastFullScore
              ? `First attempt: ${progress.lastFullScore.correct} of ${progress.lastFullScore.total} right`
              : mine
                ? 'This is your own test: no credits change hands.'
                : `${author} earns ${plural(TEST_COMPLETION_CREDITS, 'credit')} because you completed this test.`}
          </p>
        }
      >
        <div className="flex flex-col items-center text-center">
          <h2 id="score-title" ref={headingRef} tabIndex={-1} className="outline-none">
            <span className="sr-only">
              Your score: {correct} of {total} right
            </span>
            <span aria-hidden="true" className="block text-6xl font-extrabold leading-none tracking-tight">
              {correct}
              <span className="text-3xl font-bold text-deep/80"> / {total}</span>
            </span>
          </h2>
          <p className="mt-2 text-sm font-semibold">{pct}% correct</p>
          <p className="mt-1 text-sm text-deep/80">{message}</p>
        </div>
      </TicketCard>

      <div className="mt-5 grid gap-3">
        {wrong.length > 0 && (
          <button type="button" onClick={() => retryWrong(test.id)} className={btn.primary}>
            <Icon name="retry" size={20} />
            Retry wrong answers ({wrong.length})
          </button>
        )}
        <button type="button" onClick={() => restartTest(test.id)} className={btn.ghost}>
          Retake whole test
        </button>
        <Link to={`/topics/${test.topicId}?tab=tests`} className={btn.ghost}>
          Back to {topicName(test.topicId)}
        </Link>
      </div>

      <section aria-labelledby="answers-title" className="mt-8">
        <h2 id="answers-title" className="text-lg font-semibold">
          Your answers
        </h2>
        <ol className="mt-3 space-y-2">
          {progress.order.map((id) => {
            const q = findQuestion(test, id)
            if (!q) return null
            const ok = isCorrect(test, id, progress.answers[id])
            return (
              <li key={id} className="flex items-start gap-3 rounded-2xl bg-panel p-4">
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-deep ${ok ? 'bg-sky' : 'bg-salmon'}`}
                >
                  <Icon name={ok ? 'check' : 'close'} size={16} />
                </span>
                <span className="min-w-0 text-sm">
                  <span className="sr-only">{ok ? 'Right: ' : 'Wrong: '}</span>
                  {q.prompt}
                  {q.code && <code className="mt-1 block truncate font-mono text-xs text-muted">{q.code.split('\n')[0]}</code>}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {!mine && (
        <Link to={`/chat/${test.authorId}`} state={askState(test)} className={`${btn.ghost} mt-6 w-full`}>
          <Icon name="chat" size={20} />
          Ask {author} about this test
        </Link>
      )}
    </div>
  )
}
