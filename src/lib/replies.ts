import type { Attachment, Resource, Session, Student } from '../types'
import { formatSlot } from './time'

interface ReplyContext {
  peer: Student
  /** Upcoming session with this peer, if the user booked one. */
  session?: Session
  /** A resource this peer could offer (their own, or on a topic they teach). */
  resource?: Resource
  /** The user sent an attachment (test, resource or link). */
  sentAttachment: boolean
}

export interface Reply {
  text: string
  attachment?: Attachment
}

const HELP = /\b(stuck|question|questions|help|confus\w*|explain|understand|unclear|lost|don'?t get)\b/
const RESOURCE = /\b(resources?|notes|material|pdf|links?|videos?|books?)\b/
const AVAILABILITY = /\b(free|time|times|when|available|availability|schedule|meet|tomorrow|today|tonight|weekend)\b/
const THANKS = /\b(thanks|thank|thx|ty|cheers|appreciate\w*)\b/

/**
 * Simulated peer reply, chosen by keyword so it responds to what the user
 * actually wrote. Replies never confirm a booking, time or arrangement the
 * user hasn't made themselves.
 */
export function pickReply(message: string, ctx: ReplyContext): Reply {
  const text = message.toLowerCase().replace(/’/g, "'")
  const offer = ctx.resource
    ? { attachment: { kind: 'resource', resourceId: ctx.resource.id } satisfies Attachment }
    : {}

  if (HELP.test(text)) {
    return ctx.resource
      ? { text: 'Happy to help! Which question or step is tripping you up? In the meantime, this might help:', ...offer }
      : { text: 'Happy to help! Tell me which step is tripping you up and I’ll explain it.' }
  }

  // "Thanks for the notes" is a thank-you, not a request for more notes.
  if (RESOURCE.test(text) && !THANKS.test(text)) {
    return ctx.resource
      ? { text: 'Sure! This one helped me a lot:', ...offer }
      : { text: 'I don’t have one saved for that yet. The Resources tab has what other students shared.' }
  }

  if (AVAILABILITY.test(text)) {
    return {
      text: `I’m usually free ${ctx.peer.availability}. If one of those times works for you, you can choose a slot with “Book session” at the top.`,
    }
  }

  if (THANKS.test(text)) {
    return { text: 'You’re welcome! 😊 Good luck with your practice.' }
  }

  if (ctx.sentAttachment && !text.trim()) {
    return { text: 'Thanks for sharing! I’ll have a look.' }
  }

  if (ctx.session) {
    return { text: `Let’s go through it in our session on ${formatSlot(ctx.session.startsAt)}.` }
  }
  return { text: 'Let’s go through it in a session. You can book one whenever it suits you.' }
}
