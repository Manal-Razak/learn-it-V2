/** "1 credit" / "3 credits" */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** Plain-language credit change: "2 credits earned" / "2 credits spent". */
export function creditChange(amount: number): string {
  const n = Math.abs(amount)
  return `${plural(n, 'credit')} ${amount >= 0 ? 'earned' : 'spent'}`
}

/** "No one has taken it yet" / "1 student took it" / "48 students took it" */
export function takenLabel(count: number): string {
  if (count === 0) return 'No one has taken it yet'
  return `${plural(count, 'student')} took it`
}

export const LETTERS = ['A', 'B', 'C', 'D']
