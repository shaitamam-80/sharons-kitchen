import { useEffect } from 'react'

interface ToastProps {
  message: string
  onHide: () => void
}

export default function Toast({ message, onHide }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onHide, 2500)
    return () => clearTimeout(timer)
  }, [message, onHide])

  return (
    <div
      className={`fixed bottom-[30px] left-1/2 px-6 py-3.5 rounded-2xl text-[0.85rem] z-[300] whitespace-nowrap transition-all duration-300 font-heebo`}
      style={{
        background: 'var(--color-brown)',
        color: '#FAF9F6',
        boxShadow: '0 8px 32px rgba(23,37,42,0.25)',
        transform: message ? 'translate(-50%, 0)' : 'translate(-50%, 100px)',
        opacity: message ? 1 : 0,
      }}
    >
      {message}
    </div>
  )
}
