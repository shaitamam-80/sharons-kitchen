import { useRef, useEffect } from 'react'

interface HeaderProps {
  totalRecipes: number
  search: string
  onSearchChange: (value: string) => void
  changesCount: number
  onExport: () => Promise<number>
  onToast: (msg: string) => void
}

export default function Header({ totalRecipes, search, onSearchChange, changesCount, onExport, onToast }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const len = inputRef.current.value.length
      inputRef.current.setSelectionRange(len, len)
    }
  }, [search])

  return (
    <header className="sticky top-0 z-50 relative overflow-hidden">
      {/* Rich gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #943E24 0%, #BE5A38 40%, #C4924F 100%)',
        }}
      />
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[900px] mx-auto px-5 pt-6 pb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1
              className="font-suez text-[2rem] leading-none tracking-tight"
              style={{ color: '#FFF8F0', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              המטבח של שרון
            </h1>
            <p
              className="text-[0.8rem] mt-1.5 font-light tracking-wide"
              style={{ color: 'rgba(255,248,240,0.55)', fontFamily: 'var(--font-ui)' }}
            >
              ספר המתכונים האישי
            </p>
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            {changesCount > 0 && (
              <button
                className="border-none cursor-pointer font-heebo text-[0.72rem] font-medium px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95"
                style={{
                  background: 'rgba(255,248,240,0.2)',
                  color: '#FFF8F0',
                  backdropFilter: 'blur(8px)',
                }}
                onClick={async () => {
                  const count = await onExport()
                  onToast(`יוצאו ${count} שינויים`)
                }}
              >
                שלח שינויים ({changesCount})
              </button>
            )}
            <div
              className="px-3.5 py-1.5 rounded-full text-[0.72rem] font-medium"
              style={{
                background: 'rgba(255,248,240,0.12)',
                color: 'rgba(255,248,240,0.75)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {totalRecipes} מתכונים
            </div>
          </div>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full py-3.5 pr-5 pl-12 border-none rounded-2xl text-[0.95rem] outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,248,240,0.92)',
              color: 'var(--color-brown)',
              fontFamily: 'var(--font-body)',
              boxShadow: search
                ? '0 4px 20px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(190,90,56,0.2)'
                : '0 2px 12px rgba(0,0,0,0.08)',
            }}
            placeholder="חיפוש מתכון, מרכיב..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[1rem] opacity-40">🔍</span>
          {search && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-[0.7rem] transition-colors"
              style={{ background: 'rgba(44,29,19,0.08)', color: 'rgba(90,66,52,0.6)' }}
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
