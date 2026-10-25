import { useNavigate } from 'react-router-dom'

/** Returns a function that goes back in app history, or to `fallback` when there is none. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }
}
