import { useRef, useEffect } from 'react'

interface HeaderProps {
  totalRecipes: number
  search: string
  onSearchChange: (value: string) => void
}

export default function Header({ totalRecipes, search, onSearchChange }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const len = inputRef.current.value.length
      inputRef.current.setSelectionRange(len, len)
    }
  }, [search])

  return (
    <header className="sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, var(--color-terracotta) 0%, var(--color-terracotta-dark) 100%)' }}>
      <div className="max-w-[900px] mx-auto px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-suez text-[1.8rem] text-cream" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)', letterSpacing: '-0.5px' }}>
              🍰 המטבח של שרון
            </h1>
            <p className="text-[0.8rem] text-cream/70 font-light mt-0.5">ספר המתכונים האישי</p>
          </div>
          <span className="bg-white/15 text-cream px-3 py-1 rounded-[20px] text-[0.75rem] font-medium backdrop-blur-sm">
            {totalRecipes} מתכונים
          </span>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full py-3 pr-4 pl-11 border-none rounded-[10px] bg-white/95 font-heebo text-[0.95rem] text-brown outline-none transition-all duration-300 placeholder:text-gold focus:bg-white focus:shadow-md"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            placeholder="חיפוש מתכון, מרכיב..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-[1.1rem]">🔍</span>
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-cream-dark border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-[0.75rem] text-brown-light"
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
