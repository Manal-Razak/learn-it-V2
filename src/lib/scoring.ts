import type { PracticeTest, Question, Score, TestProgress } from '../types'

export function findQuestion(test: PracticeTest, questionId: string): Question | undefined {
  return test.questions.find((q) => q.id === questionId)
}

export function isCorrect(test: PracticeTest, questionId: string, answer: number | undefined): boolean {
  const q = findQuestion(test, questionId)
  return !!q && answer === q.correctIndex
}

export function scoreRound(test: PracticeTest, progress: TestProgress): Score {
  const correct = progress.order.filter((id) => isCorrect(test, id, progress.answers[id])).length
  return { correct, total: progress.order.length }
}

export function wrongIds(test: PracticeTest, progress: TestProgress): string[] {
  return progress.order.filter((id) => !isCorrect(test, id, progress.answers[id]))
}

/** Questions answered in the current round. */
export function answeredCount(progress: TestProgress): number {
  return progress.order.filter((id) => progress.answers[id] !== undefined).length
}
