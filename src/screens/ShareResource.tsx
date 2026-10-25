import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Resource, ResourceType } from '../types'
import { useApp } from '../state/context'
import { RESOURCE_TYPE_LABEL } from '../data/resources'
import { ME_ID } from '../data/seed'
import { TOPICS, getTopic, topicName } from '../data/topics'
import { newId } from '../lib/ids'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { Header } from '../components/Header'
import { useGoBack } from '../lib/useGoBack'
import { Icon, type IconName } from '../components/Icon'
import { FieldError, LoadingButton } from '../components/ui'
import { btn, field } from '../components/styles'

const LOADING_MS = 600
const TYPES: { id: ResourceType; icon: IconName }[] = [
  { id: 'pdf', icon: 'file' },
  { id: 'link', icon: 'link' },
  { id: 'notes', icon: 'notes' },
]

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ShareResource() {
  const [params] = useSearchParams()
  const { state, addResource } = useApp()
  const goBack = useGoBack('/resources')

  const requested = params.get('topic')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ResourceType>('link')
  const [topicId, setTopicId] = useState(requested && getTopic(requested) ? requested : (state.learning[0] ?? TOPICS[0].id))
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [status, setStatus] = useState<'editing' | 'sharing' | 'shared'>('editing')
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const successRef = useRef<HTMLHeadingElement>(null)

  const needsUrl = type !== 'notes'
  const errors: Record<string, string> = {}
  if (showErrors) {
    if (!title.trim()) errors['res-title'] = 'Give the resource a title.'
    if (needsUrl && !url.trim()) errors['res-url'] = `Paste the link to the ${type === 'pdf' ? 'PDF' : 'page'}.`
    else if (needsUrl && !isWebUrl(url)) errors['res-url'] = 'Use a full web address starting with https://'
    if (!needsUrl && !text.trim()) errors['res-text'] = 'Write your notes.'
  }
  const dirty = !!(title.trim() || url.trim() || text.trim())

  useEffect(() => {
    if (status === 'shared') successRef.current?.focus()
  }, [status])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (status !== 'editing') return
    const firstInvalid = !title.trim()
      ? 'res-title'
      : needsUrl
        ? isWebUrl(url) ? null : 'res-url'
        : text.trim() ? null : 'res-text'
    if (firstInvalid) {
      setShowErrors(true)
      document.getElementById(firstInvalid)?.focus()
      return
    }
    setStatus('sharing')
    window.setTimeout(() => {
      const resource: Resource = {
        id: newId('r'),
        title: title.trim(),
        type,
        topicId,
        authorId: ME_ID,
        url: needsUrl ? url.trim() : undefined,
        body: needsUrl ? undefined : text.trim(),
        saves: 0,
        createdAt: new Date().toISOString(),
      }
      addResource(resource)
      setSharedId(resource.id)
      setStatus('shared')
    }, LOADING_MS)
  }

  if (status === 'shared' && sharedId) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center pb-8 text-center">
        <span className="grid size-20 animate-pop place-items-center rounded-full bg-sand text-deep">
          <Icon name="check" size={40} />
        </span>
        <h1 ref={successRef} tabIndex={-1} className="mt-5 text-2xl font-bold outline-none">
          Resource shared
        </h1>
        <p className="mt-2 max-w-xs text-sm text-haze">
          “{title.trim()}” is now in the Resources library for {topicName(topicId)}.
        </p>
        <div className="mt-8 grid w-full gap-3">
          <Link to={`/resources/${sharedId}`} className={btn.primary}>
            View resource
          </Link>
          <Link to="/resources" className={btn.ghost}>
            Back to Resources
          </Link>
        </div>
      </div>
    )
  }

  const describedBy = (id: string, hint?: string) =>
    [hint, errors[id] ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className="pb-8">
      <Header title="Share a resource" onBack={() => (dirty ? setLeaveOpen(true) : goBack())} />

      <form onSubmit={submit} noValidate className="mt-3 space-y-5">
        <div className="space-y-5 rounded-card bg-panel p-5">
          <div>
            <label htmlFor="res-title" className={field.label}>
              Title
            </label>
            <input
              id="res-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My eigenvalue summary"
              aria-invalid={!!errors['res-title']}
              aria-describedby={describedBy('res-title')}
              className={field.input}
            />
            {errors['res-title'] && <FieldError id="res-title-error">{errors['res-title']}</FieldError>}
          </div>

          <fieldset>
            <legend className={field.label}>Type</legend>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <label
                  key={t.id}
                  className="focus-ring-within flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-deep px-2 text-sm font-semibold text-ink ring-1 ring-white/25 has-[:checked]:bg-sand has-[:checked]:text-deep has-[:checked]:ring-sand"
                >
                  <input
                    type="radio"
                    name="res-type"
                    value={t.id}
                    checked={type === t.id}
                    onChange={() => setType(t.id)}
                    className="sr-only"
                  />
                  <Icon name={t.icon} size={18} />
                  {RESOURCE_TYPE_LABEL[t.id]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="res-topic" className={field.label}>
              Topic
            </label>
            <select id="res-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field.input}>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {needsUrl ? (
            <div>
              <label htmlFor="res-url" className={field.label}>
                {type === 'pdf' ? 'Link to the PDF' : 'Web address'}
              </label>
              <p id="res-url-hint" className="-mt-0.5 mb-2 text-sm text-muted">
                {type === 'pdf'
                  ? 'Upload the file to Google Drive, OneDrive or your uni’s site first, then paste the share link.'
                  : 'Paste the full address of the page or video.'}
              </p>
              <input
                id="res-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                aria-invalid={!!errors['res-url']}
                aria-describedby={describedBy('res-url', 'res-url-hint')}
                className={field.input}
              />
              {errors['res-url'] && <FieldError id="res-url-error">{errors['res-url']}</FieldError>}
            </div>
          ) : (
            <div>
              <label htmlFor="res-text" className={field.label}>
                Notes
              </label>
              <textarea
                id="res-text"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write the explanation, steps or summary that helped you."
                aria-invalid={!!errors['res-text']}
                aria-describedby={describedBy('res-text')}
                className={`${field.input} resize-y`}
              />
              {errors['res-text'] && <FieldError id="res-text-error">{errors['res-text']}</FieldError>}
            </div>
          )}
        </div>

        <p className="flex items-start gap-2.5 rounded-2xl bg-deep p-4 text-sm">
          <Icon name="info" size={20} className="mt-px shrink-0 text-sand" />
          <span>Only share material you’re allowed to share, like your own notes or free resources.</span>
        </p>

        <LoadingButton type="submit" loading={status === 'sharing'} loadingText="Sharing…" className={`${btn.primary} w-full`}>
          Share resource
        </LoadingButton>
      </form>

      <ConfirmSheet
        open={leaveOpen}
        title="Leave without sharing?"
        confirmLabel="Leave and discard"
        cancelLabel="Keep editing"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false)
          goBack()
        }}
      >
        What you’ve typed will be lost.
      </ConfirmSheet>
    </div>
  )
}
