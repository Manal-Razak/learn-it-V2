import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'
import { btn } from '../components/styles'

export default function NotFound() {
  return (
    <div className="pt-10">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        icon="search"
        title="We can’t find that page"
        titleAs="h2"
        action={
          <Link to="/" className={btn.small}>
            Go to Home
          </Link>
        }
      >
        The link may be old, or the item was deleted. Everything you made is still saved on this device.
      </EmptyState>
    </div>
  )
}
