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
    <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-4 flex items-center justify-between z-[150] shadow-lg">
      <span className="text-[0.85rem] text-brown">
        התקיני את <strong className="text-terracotta">המטבח של שרון</strong> על הטלפון
      </span>
      <button
        className="px-5 py-2.5 bg-terracotta text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer"
        onClick={handleInstall}
      >
        התקנה
      </button>
      <button
        className="bg-transparent border-none text-brown-light text-[1.2rem] cursor-pointer p-1"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  )
}
