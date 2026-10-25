import type { Resource, ResourceType } from '../types'

const CREATED = '2026-09-10T10:00:00.000Z'

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  pdf: 'PDF',
  link: 'Link',
  notes: 'Notes',
}

/**
 * Shared library (demo data). Links point to real, free learning resources;
 * the students who "shared" them are fictional. PDFs without a URL are
 * student-made demo files and show a text preview instead.
 */
export const SEED_RESOURCES: Resource[] = [
  {
    id: 'r-3b1b',
    title: 'Essence of linear algebra (video series)',
    type: 'link',
    topicId: 'linear-algebra',
    authorId: 'lena',
    url: 'https://www.3blue1brown.com/topics/linear-algebra',
    description:
      'Short animated videos that show what matrices and eigenvectors actually do. Watch chapters 13–14 before the eigenvalues test.',
    saves: 128,
    createdAt: CREATED,
  },
  {
    id: 'r-eigen-cheatsheet',
    title: 'Eigenvalues cheat sheet',
    type: 'pdf',
    topicId: 'linear-algebra',
    authorId: 'lena',
    description: 'One page with the recipe for finding eigenvalues and eigenvectors, plus quick checks.',
    body:
      '1. Write down A − λI.\n2. Solve det(A − λI) = 0 → these are the eigenvalues.\n3. For each λ, solve (A − λI)v = 0 → these are the eigenvectors.\n\nQuick checks\n• Sum of eigenvalues = trace (sum of the diagonal)\n• Product of eigenvalues = determinant\n• Triangular matrix → eigenvalues are on the diagonal\n• Eigenvalue 0 ⇔ A is not invertible',
    saves: 74,
    createdAt: CREATED,
  },
  {
    id: 'r-mit-1806',
    title: 'MIT 18.06 Linear Algebra (free course)',
    type: 'link',
    topicId: 'linear-algebra',
    authorId: 'marco',
    url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
    description: 'Gilbert Strang’s full lecture series with problem sets and solutions. Free on MIT OpenCourseWare.',
    saves: 91,
    createdAt: CREATED,
  },
  {
    id: 'r-det-tricks',
    title: 'Determinant tricks I wish I knew earlier',
    type: 'notes',
    topicId: 'linear-algebra',
    authorId: 'marco',
    body:
      '• 2×2: det [a b; c d] = ad − bc.\n• Swapping two rows flips the sign.\n• Multiplying one row by k multiplies det by k – so det(kA) = kⁿ det(A) for n×n.\n• Adding a multiple of one row to another doesn’t change det. Use this to get zeros!\n• det(AB) = det(A) det(B), det(Aᵀ) = det(A), det(A⁻¹) = 1 / det(A).\n• Triangular matrix → multiply the diagonal.',
    saves: 37,
    createdAt: CREATED,
  },
  {
    id: 'r-immersive',
    title: 'Immersive Linear Algebra (interactive book)',
    type: 'link',
    topicId: 'linear-algebra',
    authorId: 'aisha',
    url: 'https://immersivemath.com/ila/',
    description: 'A free online textbook with interactive 3D figures you can drag around.',
    saves: 45,
    createdAt: CREATED,
  },
  {
    id: 'r-openintro',
    title: 'OpenIntro Statistics (free textbook)',
    type: 'pdf',
    topicId: 'statistics',
    authorId: 'jonas',
    url: 'https://www.openintro.org/book/os/',
    description: 'A complete intro statistics textbook. The PDF is free to download (choose “$0” on the site).',
    saves: 88,
    createdAt: CREATED,
  },
  {
    id: 'r-pvalues',
    title: 'p-values explained in plain words',
    type: 'notes',
    topicId: 'statistics',
    authorId: 'jonas',
    body:
      'Imagine H₀ is true (e.g. “the new coffee doesn’t change exam scores”).\n\nThe p-value answers: “If that were true, how often would I see data at least as extreme as mine?”\n\n• Small p (below α, often 0.05) → your data would be surprising under H₀ → reject H₀.\n• Large p → your data fits H₀ fine → you don’t reject it (but you haven’t proven it either!).\n\nThe p-value is NOT the probability that H₀ is true.',
    saves: 52,
    createdAt: CREATED,
  },
  {
    id: 'r-seeing-theory',
    title: 'Seeing Theory: visual probability & statistics',
    type: 'link',
    topicId: 'statistics',
    authorId: 'sofia',
    url: 'https://seeing-theory.brown.edu/',
    description: 'Interactive visualisations of distributions, inference and regression from Brown University.',
    saves: 63,
    createdAt: CREATED,
  },
  {
    id: 'r-test-flowchart',
    title: 'Which statistical test? Decision flowchart',
    type: 'pdf',
    topicId: 'statistics',
    authorId: 'sofia',
    description: 'A one-page flowchart for picking the right test for your data.',
    body:
      'What is your outcome?\n→ Numeric\n   • 1 group vs a known value → one-sample t-test\n   • 2 independent groups → two-sample t-test\n   • Same people measured twice → paired t-test\n   • 3+ groups → ANOVA\n→ Categories (counts)\n   • Is there a relationship between two categorical variables? → chi-square test of independence\n→ Two numeric variables\n   • Relationship → correlation / linear regression',
    saves: 29,
    createdAt: CREATED,
  },
  {
    id: 'r-py-tutorial',
    title: 'The official Python tutorial',
    type: 'link',
    topicId: 'python-basics',
    authorId: 'priya',
    url: 'https://docs.python.org/3/tutorial/',
    description: 'Clear and free. Sections 3–5 cover everything in the lists, loops and functions tests.',
    saves: 77,
    createdAt: CREATED,
  },
  {
    id: 'r-py-collections',
    title: 'List vs tuple vs dict – when to use which',
    type: 'notes',
    topicId: 'python-basics',
    authorId: 'priya',
    body:
      'list [1, 2, 3] → ordered, can change. Use for a sequence of similar things.\ntuple (1, 2, 3) → ordered, can’t change. Use for fixed groups, e.g. coordinates.\ndict {"name": "Sam"} → look things up by key.\nset {1, 2, 3} → unique items, fast “is it in there?” checks.\n\nGotcha: y = x does NOT copy a list. Use x.copy() or list(x).',
    saves: 41,
    createdAt: CREATED,
  },
  {
    id: 'r-automate',
    title: 'Automate the Boring Stuff with Python (free online book)',
    type: 'link',
    topicId: 'python-basics',
    authorId: 'omar',
    url: 'https://automatetheboringstuff.com/',
    description: 'Beginner-friendly book with practical projects. Free to read online.',
    saves: 69,
    createdAt: CREATED,
  },
  {
    id: 'r-integration',
    title: 'Integration by parts – summary',
    type: 'notes',
    topicId: 'calculus',
    authorId: 'mia',
    body:
      '∫ u dv = uv − ∫ v du\n\nPick u with LIATE (first wins): Logarithms, Inverse trig, Algebraic, Trig, Exponentials.\n\nExample: ∫ x eˣ dx → u = x, dv = eˣ dx → x eˣ − ∫ eˣ dx = x eˣ − eˣ + C.',
    saves: 22,
    createdAt: CREATED,
  },
  {
    id: 'r-essay',
    title: 'Essay structure template',
    type: 'notes',
    topicId: 'academic-writing',
    authorId: 'hannah',
    body:
      'Introduction: context → your argument in one sentence → roadmap.\n\nEach body paragraph: claim → evidence → explanation → link back to your argument.\n\nConclusion: restate the argument in new words → why it matters. No new evidence here.',
    saves: 33,
    createdAt: CREATED,
  },
]
