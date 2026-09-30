import { useCallback, useEffect, useRef, useState } from 'react'

// Drives the <Toast> component: show(text) displays it for `duration` ms.
export function useToast(duration = 2500) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current)
      setMessage(text)
      timer.current = window.setTimeout(() => setMessage(null), duration)
    },
    [duration],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { message, show }
}
