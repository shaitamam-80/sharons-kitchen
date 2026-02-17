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
      className={`fixed bottom-[30px] left-1/2 bg-brown text-white px-6 py-3 rounded-[10px] text-[0.85rem] z-[300] whitespace-nowrap transition-transform duration-300
        ${message ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[100px]'}`}
    >
      {message}
    </div>
  )
}
