import type { Match, Student } from '../types'

/**
 * "You can swap": they teach something you're learning AND want to learn
 * something you teach. "Can help you": they teach something you're learning.
 */
export function computeMatches(students: Student[], learning: string[], canTeach: string[]): Match[] {
  const matches: Match[] = []
  for (const student of students) {
    const theyTeachYou = student.canTeach.filter((t) => learning.includes(t))
    if (theyTeachYou.length === 0) continue
    const youTeachThem = canTeach.filter((t) => student.wantsToLearn.includes(t))
    matches.push({ student, kind: youTeachThem.length > 0 ? 'swap' : 'helper', theyTeachYou, youTeachThem })
  }
  return matches.sort(
    (a, b) =>
      b.theyTeachYou.length + b.youTeachThem.length - (a.theyTeachYou.length + a.youTeachThem.length) ||
      Number(b.student.online) - Number(a.student.online),
  )
}
