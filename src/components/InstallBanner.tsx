import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-5 py-4 flex items-center justify-between z-[150]"
      style={{
        background: '#FFFBF5',
        boxShadow: '0 -4px 20px rgba(44,29,19,0.08)',
        borderTop: '1px solid rgba(44,29,19,0.05)',
      }}
    >
      <span className="text-[0.85rem]" style={{ color: 'var(--color-brown)', fontFamily: 'var(--font-body)' }}>
        התקיני את <strong style={{ color: 'var(--color-terracotta)' }}>המטבח של שרון</strong> על הטלפון
      </span>
      <button
        className="px-5 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 active:scale-95"
        style={{ background: 'var(--color-terracotta)', color: '#FFF8F0' }}
        onClick={handleInstall}
      >
        התקנה
      </button>
      <button
        className="bg-transparent border-none text-[1.1rem] cursor-pointer p-1 transition-opacity hover:opacity-60"
        style={{ color: 'var(--color-brown-medium)' }}
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  )
}
