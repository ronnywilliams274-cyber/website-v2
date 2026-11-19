import { useEffect, useState } from 'react'

let push = () => {}
export const toast = (msg) => push(msg)

export default function Toast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    push = (m) => { setMsg(m); clearTimeout(t); t = setTimeout(() => setMsg(null), 2600) }
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`toast ${msg ? 'is-on' : ''}`} role="status" aria-live="polite">
      {msg}
    </div>
  )
}
