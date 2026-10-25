import { ME_ID } from '../data/seed'
import { firstName, getStudent } from '../data/students'

/** Display name for an author id: "You" for the user. */
export function personName(id: string): string {
  if (id === ME_ID) return 'You'
  return getStudent(id)?.name ?? 'A student'
}

/** First name for an author id: "you" for the user. */
export function personFirstName(id: string): string {
  if (id === ME_ID) return 'you'
  const student = getStudent(id)
  return student ? firstName(student.name) : 'the author'
}
