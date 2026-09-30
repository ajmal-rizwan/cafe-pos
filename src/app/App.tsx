import { useEffect, useState } from 'react'
import { syncMenu } from '../db/seed'
import { TillScreen } from '../features/till'

// App shell: gets the local database ready, then shows the till.
// Add a router here once there's a second screen (menu editor, reports).
export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    syncMenu().then(() => setReady(true))
  }, [])

  if (!ready) return null
  return <TillScreen />
}
