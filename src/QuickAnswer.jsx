import { QUICK_ANSWERS } from './quickAnswers.js'

// A short "Quick answer" box at the top of a guide.
export default function QuickAnswer({ slug }) {
  const answer = QUICK_ANSWERS[slug]
  if (!answer) return null
  return (
    <aside className="quick-answer" aria-label="Quick answer">
      <strong>Quick answer</strong>
      <p>{answer}</p>
    </aside>
  )
}
