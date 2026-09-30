import './Toast.css'

// Small confirmation message at the bottom of the screen. Pair with useToast.
export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
