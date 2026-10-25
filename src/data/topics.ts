import type { Pastel, Topic } from '../types'

export const TOPICS: Topic[] = [
  { id: 'linear-algebra', name: 'Linear algebra', color: 'lavender' },
  { id: 'statistics', name: 'Statistics', color: 'salmon' },
  { id: 'python-basics', name: 'Python basics', color: 'sky' },
  { id: 'calculus', name: 'Calculus', color: 'lavender' },
  { id: 'academic-writing', name: 'Academic writing', color: 'sand' },
  { id: 'microeconomics', name: 'Microeconomics', color: 'salmon' },
  { id: 'databases', name: 'Databases & SQL', color: 'sky' },
  { id: 'organic-chemistry', name: 'Organic chemistry', color: 'sand' },
]

export const PASTEL_HEX: Record<Pastel, string> = {
  sky: '#8FB8E8',
  lavender: '#B9A3F0',
  salmon: '#EFA3A0',
  sand: '#EDC48E',
}

/** Static class names so Tailwind can see them at build time. */
export const PASTEL_BG: Record<Pastel, string> = {
  sky: 'bg-sky',
  lavender: 'bg-lavender',
  salmon: 'bg-salmon',
  sand: 'bg-sand',
}

const topicById = new Map(TOPICS.map((t) => [t.id, t]))

export function getTopic(id: string): Topic | undefined {
  return topicById.get(id)
}

export function topicName(id: string): string {
  return topicById.get(id)?.name ?? id
}

export function topicColor(id: string): Pastel {
  return topicById.get(id)?.color ?? 'lavender'
}
