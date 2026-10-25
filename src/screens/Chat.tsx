import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Attachment, Student } from '../types'
import { useApp } from '../state/context'
import { ME_ID, QUICK_REPLIES } from '../data/seed'
import { firstName, getStudent } from '../data/students'
import { TOPICS, topicName } from '../data/topics'
import { newId } from '../lib/ids'
import { personName } from '../lib/people'
import { plural } from '../lib/text'
import { formatDay, formatTime } from '../lib/time'
import { AttachmentCard } from '../components/AttachmentCard'
import { Avatar } from '../components/Avatar'
import { BookingSheet } from '../components/BookingSheet'
import { FixedBottom } from '../components/FixedBottom'
import { useGoBack } from '../lib/useGoBack'
import { Icon, type IconName } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { FieldError, TopicTag, TypeBadge } from '../components/ui'
import { btn, field } from '../components/styles'
import NotFound from './NotFound'

const LINE_HEIGHT_PX = 24
const MAX_LINES = 4
const TEXTAREA_PADDING_PX = 20
const NOTICE_MS = 3000

type Picker = 'test' | 'resource' | 'link'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Chat() {
  const { peerId = '' } = useParams()
  const peer = getStudent(peerId)
  if (!peer) return <NotFound />
  return <ChatRoom key={peer.id} peer={peer} />
}

function ChatRoom({ peer }: { peer: Student }) {
  const { state, typing, sendMessage, sendQuickReply } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const goBack = useGoBack('/chat')
  const first = firstName(peer.name)

  // "Ask [author] about this" arrives with a prefilled draft in router state.
  const [initialDraft] = useState(() => (location.state as { draft?: string } | null)?.draft ?? '')
  const [text, setText] = useState(initialDraft)
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [picker, setPicker] = useState<Picker | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [composerHeight, setComposerHeight] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const bookRef = useRef<HTMLButtonElement>(null)
  const menuWrapRef = useRef<HTMLDivElement>(null)
  const firstMenuItemRef = useRef<HTMLButtonElement>(null)
  const noticeTimer = useRef<number | undefined>(undefined)
  const hasScrolled = useRef(false)

  const messages = state.chats[peer.id] ?? []
  const usedQuickReplies = state.usedQuickReplies[peer.id] ?? []
  const isTyping = !!typing[peer.id]
  const lastPeerMessage = [...messages].reverse().find((m) => m.from === 'peer')

  // Put the cursor at the end of a prefilled draft, and drop it from history so a reload doesn't refill it.
  const draftHandled = useRef(false)
  useEffect(() => {
    if (!initialDraft || draftHandled.current) return
    draftHandled.current = true
    const el = textareaRef.current
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
    navigate(location.pathname, { replace: true, state: null })
  }, [initialDraft, navigate, location.pathname])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  // Grow the textarea with its content, up to 4 lines, then scroll inside it.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    const max = LINE_HEIGHT_PX * MAX_LINES + TEXTAREA_PADDING_PX
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [text])

  // Keep the newest message visible above the composer. The composer's spacer
  // (from FixedBottom) means the page end is exactly the composer's top edge.
  const scrollToEnd = useCallback(() => {
    const smooth = hasScrolled.current && !prefersReducedMotion()
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    hasScrolled.current = true
  }, [])

  useEffect(() => {
    if (composerHeight > 0) scrollToEnd()
  }, [messages.length, isTyping, composerHeight, scrollToEnd])

  // Attach menu: close on outside click or Esc.
  useEffect(() => {
    if (!menuOpen) return
    firstMenuItemRef.current?.focus()
    const onPointerDown = (e: PointerEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        plusRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function flash(message: string) {
    setNotice(message)
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(''), NOTICE_MS)
  }

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const result = sendMessage(peer.id, text)
    if (result === 'sent') setText('')
    if (result === 'duplicate') {
      setText('')
      flash('You just sent that message, so it wasn’t sent again.')
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  function sendAttachment(attachment: Attachment) {
    const result = sendMessage(peer.id, '', attachment)
    setPicker(null)
    if (result === 'duplicate') flash('You just shared that, so it wasn’t sent again.')
  }

  function openPicker(kind: Picker) {
    setMenuOpen(false)
    setPicker(kind)
  }

  const menuItems: { kind: Picker; icon: IconName; label: string; hint: string }[] = [
    { kind: 'test', icon: 'practice', label: 'Practice test', hint: 'Share a test to practise together' },
    { kind: 'resource', icon: 'resources', label: 'Resource', hint: 'From the Resources library' },
    { kind: 'link', icon: 'paperclip', label: 'File or link', hint: 'Paste a link to a file or page' },
  ]

  return (
    <div>
      <header className="sticky top-0 z-20 -mx-4 flex items-center gap-2 bg-app/95 px-4 pb-3 pt-3 backdrop-blur">
        <button type="button" onClick={goBack} aria-label="Back to chats" className={btn.icon}>
          <Icon name="back" />
        </button>
        <Avatar spec={peer.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold leading-tight">{peer.name}</h1>
          <p className="truncate text-xs text-haze">Can teach: {peer.canTeach.map(topicName).join(', ')}</p>
        </div>
        <button ref={bookRef} type="button" onClick={() => setBookingOpen(true)} className={`${btn.small} shrink-0`}>
          Book session
        </button>
      </header>

      {messages.length === 0 && (
        <div className="mt-4 flex flex-col items-center rounded-card bg-panel p-6 text-center">
          <Avatar spec={peer.avatar} size={64} />
          <h2 className="mt-3 font-semibold">Say hi to {first}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted">
            You haven’t messaged {first} yet. Ask about {peer.canTeach.map(topicName).join(' or ')}, share a practice
            test with the + button, or tap a quick reply below.
          </p>
        </div>
      )}

      <ol aria-label={`Messages with ${peer.name}`} className="mt-2 space-y-3 pb-3">
        {messages.map((m, i) => {
          const day = formatDay(m.at)
          const showDay = i === 0 || formatDay(messages[i - 1].at) !== day
          const mine = m.from === 'me'
          return (
            <Fragment key={m.id}>
              {showDay && (
                <li className="pt-2 text-center text-xs font-semibold text-haze">
                  <span className="sr-only">Messages from </span>
                  {day}
                </li>
              )}
              {m.from === 'system' ? (
                <li className="flex justify-center">
                  <p className="flex items-center gap-2 rounded-full bg-deep px-4 py-2 text-center text-xs font-medium text-muted">
                    <Icon name="calendar" size={14} className="shrink-0 text-sand" />
                    {m.text}
                  </p>
                </li>
              ) : (
                <li className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[22px] px-4 py-3 ${
                      mine ? 'rounded-br-md bg-sand text-deep' : 'rounded-bl-md bg-panel text-ink'
                    }`}
                  >
                    <span className="sr-only">{mine ? 'You' : first}: </span>
                    {m.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.text}</p>}
                    {m.attachment && <AttachmentCard attachment={m.attachment} />}
                    <p className={`mt-1 text-right text-[11px] ${mine ? 'text-deep/75' : 'text-muted'}`}>
                      <span className="sr-only">Sent at </span>
                      {formatTime(m.at)}
                    </p>
                  </div>
                </li>
              )}
            </Fragment>
          )
        })}
        {isTyping && (
          <li className="flex justify-start">
            <div className="rounded-[22px] rounded-bl-md bg-panel px-4 py-4">
              <span className="sr-only">{first} is typing…</span>
              <span aria-hidden="true" className="flex gap-1.5">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-2 animate-typing rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </span>
            </div>
          </li>
        )}
      </ol>

      {/* Announce replies to screen reader users. */}
      <p className="sr-only" aria-live="polite">
        {lastPeerMessage && messages[messages.length - 1] === lastPeerMessage ? `${first}: ${lastPeerMessage.text}` : ''}
      </p>

      <FixedBottom
        onHeightChange={setComposerHeight}
        className="bg-app/95 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_24px_-16px_rgba(20,14,40,0.9)] backdrop-blur"
      >
        <div role="group" aria-label="Quick replies" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {QUICK_REPLIES.map((reply) => {
            const used = usedQuickReplies.includes(reply)
            return (
              <button
                key={reply}
                type="button"
                disabled={used}
                onClick={() => {
                  if (sendQuickReply(peer.id, reply) === 'duplicate') flash('You just sent that message.')
                }}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-deep px-4 text-sm font-medium text-ink ring-1 ring-white/25 transition hover:ring-white/50 disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted disabled:ring-white/10"
              >
                {used && <Icon name="check" size={14} />}
                {reply}
                {used && <span className="sr-only"> (already sent)</span>}
              </button>
            )
          })}
        </div>

        <form onSubmit={submit} className="flex items-end gap-2 px-4">
          <div ref={menuWrapRef} className="relative">
            <button
              ref={plusRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Attach a practice test, resource, file or link"
              aria-expanded={menuOpen}
              aria-controls="attach-menu"
              className="grid size-11 place-items-center rounded-full bg-deep text-sand ring-1 ring-white/15 transition hover:ring-white/40"
            >
              <Icon name={menuOpen ? 'close' : 'plus'} />
            </button>
            {menuOpen && (
              <div
                id="attach-menu"
                className="absolute bottom-full left-0 mb-2 w-64 animate-pop rounded-2xl bg-panel p-2 shadow-[0_16px_40px_-12px_rgba(10,6,25,0.9)] ring-1 ring-white/10"
              >
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Attach</p>
                <ul>
                  {menuItems.map((item, i) => (
                    <li key={item.kind}>
                      <button
                        ref={i === 0 ? firstMenuItemRef : undefined}
                        type="button"
                        onClick={() => openPicker(item.kind)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-deep"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-deep text-sand">
                          <Icon name={item.icon} size={18} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className="block text-xs text-muted">{item.hint}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <label htmlFor="chat-input" className="sr-only">
            Message {first}
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message ${first}`}
            aria-describedby="chat-hint"
            className="block min-h-11 min-w-0 flex-1 resize-none rounded-[22px] bg-deep px-4 py-2.5 text-[15px] leading-6 text-ink ring-1 ring-white/15 placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!text.trim()}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-sand text-deep transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="send" size={20} />
          </button>
        </form>
        <p id="chat-hint" className="sr-only">
          Press Enter to send. Press Shift and Enter for a new line.
        </p>
        <p role="status" className={`px-4 text-center text-xs text-haze ${notice ? 'pt-1.5' : ''}`}>
          {notice}
        </p>
      </FixedBottom>

      <Sheet open={picker === 'test'} onClose={() => setPicker(null)} title="Share a practice test" returnFocusTo={textareaRef}>
        <TestPicker peer={peer} onPick={(testId) => sendAttachment({ kind: 'test', testId })} />
      </Sheet>
      <Sheet open={picker === 'resource'} onClose={() => setPicker(null)} title="Share a resource" returnFocusTo={textareaRef}>
        <ResourcePicker peer={peer} onPick={(resourceId) => sendAttachment({ kind: 'resource', resourceId })} />
      </Sheet>
      <Sheet open={picker === 'link'} onClose={() => setPicker(null)} title="Share a file or link" returnFocusTo={textareaRef}>
        <LinkForm peer={peer} onSend={sendAttachment} />
      </Sheet>
      <BookingSheet peer={peer} open={bookingOpen} onClose={() => setBookingOpen(false)} returnFocusTo={bookRef} />
    </div>
  )
}

/** Topics relevant to this conversation: what the peer teaches or wants to learn. */
function relevance(peer: Student, topicId: string): number {
  return Number(peer.canTeach.includes(topicId) || peer.wantsToLearn.includes(topicId))
}

function TestPicker({ peer, onPick }: { peer: Student; onPick: (testId: string) => void }) {
  const { tests } = useApp()
  const sorted = [...tests].sort(
    (a, b) =>
      Number(b.authorId === ME_ID) - Number(a.authorId === ME_ID) || relevance(peer, b.topicId) - relevance(peer, a.topicId),
  )
  return (
    <ul className="space-y-2">
      {sorted.map((t) => (
        <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-deep p-3 pl-4">
          <span className="min-w-0 flex-1">
            <TopicTag topicId={t.topicId} />
            <span className="mt-1 block text-sm font-semibold leading-snug">{t.title}</span>
            <span className="block text-xs text-muted">
              {plural(t.questions.length, 'question')} · by {personName(t.authorId)}
            </span>
          </span>
          <button type="button" onClick={() => onPick(t.id)} className={btn.small}>
            Send
            <span className="sr-only"> {t.title}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function ResourcePicker({ peer, onPick }: { peer: Student; onPick: (resourceId: string) => void }) {
  const { resources, isSaved } = useApp()
  const sorted = [...resources].sort(
    (a, b) =>
      Number(b.authorId === ME_ID) - Number(a.authorId === ME_ID) ||
      Number(isSaved(b.id)) - Number(isSaved(a.id)) ||
      relevance(peer, b.topicId) - relevance(peer, a.topicId),
  )
  return (
    <ul className="space-y-2">
      {sorted.map((r) => (
        <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-deep p-3 pl-4">
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap gap-1.5">
              <TypeBadge type={r.type} />
              {isSaved(r.id) && (
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-sand ring-1 ring-sand/50">Saved</span>
              )}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-snug">{r.title}</span>
            <span className="block text-xs text-muted">
              {topicName(r.topicId)} · by {personName(r.authorId)}
            </span>
          </span>
          <button type="button" onClick={() => onPick(r.id)} className={btn.small}>
            Send
            <span className="sr-only"> {r.title}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function LinkForm({ peer, onSend }: { peer: Student; onSend: (attachment: Attachment) => void }) {
  const { state, addResource } = useApp()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [addToLibrary, setAddToLibrary] = useState(false)
  const [topicId, setTopicId] = useState(peer.canTeach.find((t) => state.learning.includes(t)) ?? state.learning[0] ?? TOPICS[0].id)
  const [showErrors, setShowErrors] = useState(false)

  let validUrl = false
  try {
    const parsed = new URL(url.trim())
    validUrl = parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    validUrl = false
  }
  const titleError = showErrors && !title.trim() ? 'Give the link a short title.' : ''
  const urlError = showErrors && !validUrl ? 'Use a full web address starting with https://' : ''

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !validUrl) {
      setShowErrors(true)
      document.getElementById(!title.trim() ? 'link-title' : 'link-url')?.focus()
      return
    }
    if (addToLibrary) {
      const id = newId('r')
      addResource({
        id,
        title: title.trim(),
        type: 'link',
        topicId,
        authorId: ME_ID,
        url: url.trim(),
        saves: 0,
        createdAt: new Date().toISOString(),
      })
      onSend({ kind: 'resource', resourceId: id })
    } else {
      onSend({ kind: 'link', title: title.trim(), url: url.trim() })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-muted">
        To share a file, upload it to Google Drive, OneDrive or similar first, then paste its share link here.
      </p>
      <div>
        <label htmlFor="link-title" className={field.label}>
          Title
        </label>
        <input
          id="link-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. My lecture notes, week 5"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'link-title-error' : undefined}
          className={field.input}
        />
        {titleError && <FieldError id="link-title-error">{titleError}</FieldError>}
      </div>
      <div>
        <label htmlFor="link-url" className={field.label}>
          Link
        </label>
        <input
          id="link-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          aria-invalid={!!urlError}
          aria-describedby={urlError ? 'link-url-error' : undefined}
          className={field.input}
        />
        {urlError && <FieldError id="link-url-error">{urlError}</FieldError>}
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={addToLibrary}
          onChange={(e) => setAddToLibrary(e.target.checked)}
          className="checkbox mt-0.5"
        />
        <span>
          <span className="block font-semibold">Also add it to the Resources library</span>
          <span className="block text-muted">So other students can find it too.</span>
        </span>
      </label>
      {addToLibrary && (
        <div>
          <label htmlFor="link-topic" className={field.label}>
            Topic
          </label>
          <select id="link-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field.input}>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button type="submit" className={`${btn.primary} w-full`}>
        <Icon name="send" size={18} />
        Send link
      </button>
    </form>
  )
}
