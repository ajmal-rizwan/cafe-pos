import { useEffect, useState } from 'react'
import { syncMenu } from '../db/seed'
import { ReportsScreen } from '../features/reports'
import { TillScreen } from '../features/till'

type Screen = 'till' | 'reports'

// App shell: gets the local database ready, then shows the till.
// The till stays mounted while reports are open, so an order being built
// isn't lost when someone checks the numbers.
export function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<Screen>('till')

  useEffect(() => {
    syncMenu().then(() => setReady(true))
  }, [])

  if (!ready) return null
  return (
    <>
      <div className="screen" hidden={screen !== 'till'}>
        <TillScreen onOpenReports={() => setScreen('reports')} />
      </div>
      {screen === 'reports' && (
        <div className="screen">
          <ReportsScreen onBack={() => setScreen('till')} />
        </div>
      )}
    </>
  )
}
