import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { PracticeTest } from '../types'
import { useApp } from '../state/context'
import { ME_ID, TEST_COMPLETION_CREDITS } from '../data/seed'
import { TOPICS, getTopic, topicName } from '../data/topics'
import { newId } from '../lib/ids'
import { personName } from '../lib/people'
import { LETTERS, plural } from '../lib/text'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { FixedBottom } from '../components/FixedBottom'
import { Header } from '../components/Header'
import { useGoBack } from '../lib/useGoBack'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { FieldError, LoadingButton, TypeBadge } from '../components/ui'
import { btn, field } from '../components/styles'
import NotFound from './NotFound'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 4
const LOADING_MS = 600

interface DraftQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number | null
  explanation: string
}

interface Draft {
  title: string
  topicId: string
  questions: DraftQuestion[]
  resourceIds: string[]
}

function emptyQuestion(): DraftQuestion {
  return { id: newId('q'), prompt: '', options: ['', ''], correctIndex: null, explanation: '' }
}

function fromTest(test: PracticeTest): Draft {
  return {
    title: test.title,
    topicId: test.topicId,
    resourceIds: test.resourceIds,
    questions: test.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.length >= MIN_OPTIONS ? q.options : [...q.options, ...Array(MIN_OPTIONS - q.options.length).fill('')],
      correctIndex: q.correctIndex >= 0 ? q.correctIndex : null,
      explanation: q.explanation,
    })),
  }
}

/** Drafts keep everything as typed; -1 means "no correct answer marked yet". */
function toDraftTest(d: Draft, id: string): PracticeTest {
  return {
    id,
    title: d.title.trim() || 'Untitled test',
    topicId: d.topicId,
    authorId: ME_ID,
    takenBy: 0,
    resourceIds: d.resourceIds,
    status: 'draft',
    createdAt: new Date().toISOString(),
    questions: d.questions.map((q) => ({ ...q, correctIndex: q.correctIndex ?? -1 })),
  }
}

/** Published tests drop empty answers (validation guarantees the rest is complete). */
function toPublishedTest(d: Draft, id: string): PracticeTest {
  return {
    ...toDraftTest(d, id),
    title: d.title.trim(),
    status: 'published',
    questions: d.questions.map((q) => {
      const kept = q.options.map((text, i) => ({ text: text.trim(), i })).filter((o) => o.text)
      return {
        id: q.id,
        prompt: q.prompt.trim(),
        options: kept.map((o) => o.text),
        correctIndex: kept.findIndex((o) => o.i === q.correctIndex),
        explanation: q.explanation.trim(),
      }
    }),
  }
}

/** Error messages keyed by the id of the field to focus. */
function validate(d: Draft): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!d.title.trim()) errors['test-title'] = 'Give your test a title.'
  d.questions.forEach((q, qi) => {
    const n = qi + 1
    if (!q.prompt.trim()) errors[`${q.id}-prompt`] = `Write the text for question ${n}.`
    const filled = q.options.filter((o) => o.trim()).length
    if (filled < MIN_OPTIONS) errors[`${q.id}-opt-0`] = `Question ${n} needs at least ${MIN_OPTIONS} answers.`
    else if (q.correctIndex === null || !q.options[q.correctIndex]?.trim())
      errors[`${q.id}-correct-0`] = `Mark the correct answer for question ${n}.`
    if (!q.explanation.trim())
      errors[`${q.id}-explanation`] = `Add an explanation for question ${n}, so others learn from their mistakes.`
  })
  return errors
}

export default function CreateTest() {
  const { testId } = useParams()
  const [params] = useSearchParams()
  const { state, getTest } = useApp()

  // Captured once: after publishing, the draft stops being a draft but the success screen must stay.
  const [setup] = useState(() => {
    if (testId) {
      const existing = getTest(testId)
      if (!existing || existing.authorId !== ME_ID || existing.status !== 'draft') return null
      return { id: existing.id, draft: fromTest(existing) }
    }
    const requested = params.get('topic')
    const topicId = requested && getTopic(requested) ? requested : (state.learning[0] ?? TOPICS[0].id)
    return { id: newId('t'), draft: { title: '', topicId, questions: [emptyQuestion()], resourceIds: [] } }
  })

  if (!setup) return <NotFound />
  return <TestEditor id={setup.id} initial={setup.draft} />
}

function TestEditor({ id, initial }: { id: string; initial: Draft }) {
  const { saveDraft, publishTest, showToast, resources, getResource } = useApp()
  const navigate = useNavigate()
  const goBack = useGoBack('/practice')

  const [draft, setDraft] = useState<Draft>(initial)
  const [showErrors, setShowErrors] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<'editing' | 'publishing' | 'published'>('editing')
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)

  const [initialJson] = useState(() => JSON.stringify(initial))
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const addQuestionRef = useRef<HTMLButtonElement>(null)
  const attachRef = useRef<HTMLButtonElement>(null)
  const focusAfterRender = useRef<string | null>(null)

  const errors = showErrors ? validate(draft) : {}
  const errorEntries = Object.entries(errors)
  const dirty = JSON.stringify(draft) !== initialJson

  useEffect(() => {
    if (attempt > 0) summaryRef.current?.focus()
  }, [attempt])

  useEffect(() => {
    if (status === 'published') successRef.current?.focus()
  }, [status])

  useEffect(() => {
    if (!focusAfterRender.current) return
    document.getElementById(focusAfterRender.current)?.focus()
    focusAfterRender.current = null
  })

  // ---------- Editing helpers ----------

  function patchQuestion(qid: string, patch: (q: DraftQuestion) => DraftQuestion) {
    setDraft((d) => ({ ...d, questions: d.questions.map((q) => (q.id === qid ? patch(q) : q)) }))
  }

  function addQuestion() {
    const q = emptyQuestion()
    focusAfterRender.current = `${q.id}-prompt`
    setDraft((d) => ({ ...d, questions: [...d.questions, q] }))
  }

  function removeQuestion(qid: string) {
    setDraft((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== qid) }))
    addQuestionRef.current?.focus()
  }

  function removeOption(qid: string, index: number) {
    patchQuestion(qid, (q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== index),
      correctIndex:
        q.correctIndex === null || q.correctIndex === index
          ? null
          : q.correctIndex > index
            ? q.correctIndex - 1
            : q.correctIndex,
    }))
    focusAfterRender.current = `${qid}-opt-0`
  }

  function toggleResource(resourceId: string) {
    setDraft((d) => ({
      ...d,
      resourceIds: d.resourceIds.includes(resourceId)
        ? d.resourceIds.filter((r) => r !== resourceId)
        : [...d.resourceIds, resourceId],
    }))
  }

  // ---------- Actions ----------

  function handleBack() {
    if (dirty && status === 'editing') setLeaveOpen(true)
    else goBack()
  }

  function saveAsDraft() {
    saveDraft(toDraftTest(draft, id))
    setLeaveOpen(false)
    showToast('Draft saved. Find it under Your tests.')
    navigate('/practice')
  }

  function publish(e: FormEvent) {
    e.preventDefault()
    if (status !== 'editing') return
    if (Object.keys(validate(draft)).length > 0) {
      setShowErrors(true)
      setAttempt((a) => a + 1)
      return
    }
    setStatus('publishing')
    window.setTimeout(() => {
      publishTest(toPublishedTest(draft, id))
      setStatus('published')
    }, LOADING_MS)
  }

  // ---------- Success ----------

  if (status === 'published') {
    const topic = topicName(draft.topicId)
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center pb-8 text-center">
        <span className="grid size-20 animate-pop place-items-center rounded-full bg-sand text-deep">
          <Icon name="check" size={40} />
        </span>
        <h1 ref={successRef} tabIndex={-1} className="mt-5 text-2xl font-bold outline-none">
          Test published
        </h1>
        <p className="mt-2 max-w-xs text-sm text-haze">
          “{draft.title.trim()}” is now on the {topic} page and in Resources. You earn{' '}
          {plural(TEST_COMPLETION_CREDITS, 'credit')} each time another student completes it.
        </p>
        <div className="mt-8 grid w-full gap-3">
          <Link to={`/topics/${draft.topicId}?tab=tests`} className={btn.primary}>
            View on the {topic} page
          </Link>
          <Link to="/practice" className={btn.ghost}>
            Back to Practice
          </Link>
        </div>
      </div>
    )
  }

  // ---------- Form ----------

  const describedBy = (fieldId: string, hintId?: string) =>
    [hintId, errors[fieldId] ? `${fieldId}-error` : undefined].filter(Boolean).join(' ') || undefined

  const topicResources = resources.filter((r) => r.topicId === draft.topicId)
  const otherResources = resources.filter((r) => r.topicId !== draft.topicId)

  return (
    <div>
      <Header title="Create a practice test" onBack={handleBack} />

      <form onSubmit={publish} noValidate className="mt-3 space-y-5">
        {errorEntries.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-card bg-deep p-5 ring-2 ring-salmon">
            <h2 className="font-semibold text-salmon">
              Fix {errorEntries.length === 1 ? 'this' : `these ${errorEntries.length} things`} before publishing
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
              {errorEntries.map(([fieldId, message]) => (
                <li key={fieldId}>
                  <a
                    href={`#${fieldId}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(fieldId)?.focus()
                    }}
                    className="underline underline-offset-4"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4 rounded-card bg-panel p-5">
          <div>
            <label htmlFor="test-title" className={field.label}>
              Title
            </label>
            <input
              id="test-title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Eigenvalues in 5 questions"
              aria-invalid={!!errors['test-title']}
              aria-describedby={describedBy('test-title')}
              className={field.input}
            />
            {errors['test-title'] && <FieldError id="test-title-error">{errors['test-title']}</FieldError>}
          </div>
          <div>
            <label htmlFor="test-topic" className={field.label}>
              Topic
            </label>
            <select
              id="test-topic"
              value={draft.topicId}
              onChange={(e) => setDraft((d) => ({ ...d, topicId: e.target.value }))}
              className={field.input}
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {draft.questions.map((q, qi) => {
          const n = qi + 1
          const legendId = `${q.id}-legend`
          const answersError = errors[`${q.id}-opt-0`] ?? errors[`${q.id}-correct-0`]
          const answersErrorId = errors[`${q.id}-opt-0`] ? `${q.id}-opt-0-error` : `${q.id}-correct-0-error`
          return (
            <section key={q.id} aria-labelledby={legendId} className="rounded-card bg-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id={legendId} className="text-base font-semibold">
                  Question {n}
                </h2>
                {draft.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    aria-label={`Remove question ${n}`}
                    className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-deep hover:text-ink"
                  >
                    <Icon name="trash" size={20} />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <label htmlFor={`${q.id}-prompt`} className={field.label}>
                  Question
                </label>
                <textarea
                  id={`${q.id}-prompt`}
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => patchQuestion(q.id, (x) => ({ ...x, prompt: e.target.value }))}
                  placeholder="e.g. What is det [3 2; 1 4]?"
                  aria-invalid={!!errors[`${q.id}-prompt`]}
                  aria-describedby={describedBy(`${q.id}-prompt`)}
                  className={`${field.input} resize-y`}
                />
                {errors[`${q.id}-prompt`] && (
                  <FieldError id={`${q.id}-prompt-error`}>{errors[`${q.id}-prompt`]}</FieldError>
                )}
              </div>

              <fieldset className="mt-4" aria-describedby={[`${q.id}-answers-hint`, answersError ? answersErrorId : ''].join(' ').trim()}>
                <legend className={field.label}>Answers</legend>
                <p id={`${q.id}-answers-hint`} className="-mt-0.5 mb-2.5 text-sm text-muted">
                  Select the circle next to the correct answer.
                </p>
                <div className="space-y-2">
                  {q.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`${q.id}-correct-${i}`}
                        name={`${q.id}-correct`}
                        checked={q.correctIndex === i}
                        onChange={() => patchQuestion(q.id, (x) => ({ ...x, correctIndex: i }))}
                        aria-label={`Answer ${LETTERS[i]} is the correct one`}
                        className="radio"
                      />
                      <input
                        id={`${q.id}-opt-${i}`}
                        value={option}
                        onChange={(e) =>
                          patchQuestion(q.id, (x) => ({
                            ...x,
                            options: x.options.map((o, j) => (j === i ? e.target.value : o)),
                          }))
                        }
                        aria-label={`Answer ${LETTERS[i]}`}
                        placeholder={`Answer ${LETTERS[i]}`}
                        className={`${field.inputBare} min-w-0 flex-1 ${q.correctIndex === i ? 'ring-2 ring-sand' : 'ring-1 ring-white/10'}`}
                      />
                      {q.options.length > MIN_OPTIONS && (
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, i)}
                          aria-label={`Remove answer ${LETTERS[i]} from question ${n}`}
                          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-deep hover:text-ink"
                        >
                          <Icon name="close" size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {q.options.length < MAX_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => {
                      focusAfterRender.current = `${q.id}-opt-${q.options.length}`
                      patchQuestion(q.id, (x) => ({ ...x, options: [...x.options, ''] }))
                    }}
                    className={`${btn.text} mt-2`}
                  >
                    <Icon name="plus" size={16} />
                    Add answer
                  </button>
                )}
                {answersError && <FieldError id={answersErrorId}>{answersError}</FieldError>}
              </fieldset>

              <div className="mt-4">
                <label htmlFor={`${q.id}-explanation`} className={field.label}>
                  Explanation
                </label>
                <p id={`${q.id}-explanation-hint`} className="-mt-0.5 mb-2 text-sm text-muted">
                  Shown after someone answers. Explain why the correct answer is right.
                </p>
                <textarea
                  id={`${q.id}-explanation`}
                  rows={3}
                  value={q.explanation}
                  onChange={(e) => patchQuestion(q.id, (x) => ({ ...x, explanation: e.target.value }))}
                  aria-invalid={!!errors[`${q.id}-explanation`]}
                  aria-describedby={describedBy(`${q.id}-explanation`, `${q.id}-explanation-hint`)}
                  className={`${field.input} resize-y`}
                />
                {errors[`${q.id}-explanation`] && (
                  <FieldError id={`${q.id}-explanation-error`}>{errors[`${q.id}-explanation`]}</FieldError>
                )}
              </div>
            </section>
          )
        })}

        <button ref={addQuestionRef} type="button" onClick={addQuestion} className={`${btn.ghost} w-full`}>
          <Icon name="plus" size={20} />
          Add question
        </button>

        <section aria-labelledby="attached-title" className="rounded-card bg-panel p-5">
          <h2 id="attached-title" className="text-base font-semibold">
            Resources
          </h2>
          <p className="mt-1 text-sm text-muted">Students see these as “Related resource” after answering.</p>
          {draft.resourceIds.length > 0 && (
            <ul className="mt-3 space-y-2">
              {draft.resourceIds.map((rid) => {
                const r = getResource(rid)
                if (!r) return null
                return (
                  <li key={rid} className="flex items-center gap-3 rounded-2xl bg-deep p-3 pl-4">
                    <span className="min-w-0 flex-1">
                      <TypeBadge type={r.type} />
                      <span className="mt-1 block text-sm font-semibold leading-snug">{r.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleResource(rid)}
                      aria-label={`Remove ${r.title}`}
                      className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-panel hover:text-ink"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <button ref={attachRef} type="button" onClick={() => setAttachOpen(true)} className={`${btn.ghost} mt-3 w-full`}>
            <Icon name="paperclip" size={20} />
            Attach resource
          </button>
        </section>

        <p className="flex items-start gap-2.5 rounded-2xl bg-deep p-4 text-sm">
          <Icon name="info" size={20} className="mt-px shrink-0 text-sand" />
          <span>
            You earn {plural(TEST_COMPLETION_CREDITS, 'credit')} each time another student completes your test. Writing
            the explanations also helps you understand the topic better.
          </span>
        </p>

        <FixedBottom className="bg-app/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_24px_-16px_rgba(20,14,40,0.9)]">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={saveAsDraft} className={btn.ghost}>
              Save draft
            </button>
            <LoadingButton type="submit" loading={status === 'publishing'} loadingText="Publishing…" className={btn.primary}>
              Publish test
            </LoadingButton>
          </div>
        </FixedBottom>
      </form>

      <Sheet open={attachOpen} onClose={() => setAttachOpen(false)} title="Attach a resource" returnFocusTo={attachRef}>
        {[
          { title: topicName(draft.topicId), items: topicResources },
          { title: 'Other topics', items: otherResources },
        ].map((group) => (
          <section key={group.title} className="mb-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">{group.title}</h3>
            {group.items.length === 0 ? (
              <p className="rounded-2xl bg-deep p-4 text-sm text-muted">
                No resources for this topic yet. You can share one from the Resources tab after saving your draft.
              </p>
            ) : (
              <ul className="space-y-2">
                {group.items.map((r) => {
                  const attached = draft.resourceIds.includes(r.id)
                  return (
                    <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-deep p-3 pl-4">
                      <span className="min-w-0 flex-1">
                        <TypeBadge type={r.type} />
                        <span className="mt-1 block text-sm font-semibold leading-snug">{r.title}</span>
                        <span className="block text-xs text-muted">by {personName(r.authorId)}</span>
                      </span>
                      <button
                        type="button"
                        aria-pressed={attached}
                        onClick={() => toggleResource(r.id)}
                        className={attached ? btn.small : btn.smallGhost}
                      >
                        {attached && <Icon name="check" size={16} />}
                        {attached ? 'Attached' : 'Attach'}
                        <span className="sr-only"> {r.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
        <button type="button" onClick={() => setAttachOpen(false)} className={`${btn.primary} w-full`}>
          Done
        </button>
      </Sheet>

      <ConfirmSheet
        open={leaveOpen}
        title="Leave without saving?"
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false)
          goBack()
        }}
        extra={
          <button type="button" onClick={saveAsDraft} className={`${btn.ghost} w-full`}>
            Save draft
          </button>
        }
      >
        Your test isn’t saved yet. Save it as a draft to finish it later.
      </ConfirmSheet>
    </div>
  )
}
