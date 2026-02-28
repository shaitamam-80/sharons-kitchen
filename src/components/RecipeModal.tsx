import { useState, useEffect, useCallback, useRef } from 'react'
import type { Recipe } from '@/types/recipe'
import { isGroupHeader, parseIngredient, scaleIngredientText } from '@/utils/ingredientParser'

interface RecipeModalProps {
  recipe: Recipe | null
  onClose: () => void
  onSaveInstructions: (id: number, instructions: string) => void
  onSaveNotes: (id: number, notes: string) => void
  onSaveIngredients: (id: number, ingredients: string[]) => void
  onToast: (msg: string) => void
}

const MULTIPLIERS = [0.5, 1, 2, 3] as const

export default function RecipeModal({ recipe, onClose, onSaveInstructions, onSaveNotes, onSaveIngredients, onToast }: RecipeModalProps) {
  const [editingInstructions, setEditingInstructions] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingIngredients, setEditingIngredients] = useState(false)
  const [instructionsText, setInstructionsText] = useState('')
  const [notesText, setNotesText] = useState('')
  const [ingredientsList, setIngredientsList] = useState<string[]>([])
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [multiplier, setMultiplier] = useState(1)
  const [showStickyName, setShowStickyName] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Reset state when recipe changes
  useEffect(() => {
    setEditingInstructions(false)
    setEditingNotes(false)
    setEditingIngredients(false)
    setMultiplier(1)
    setShowStickyName(false)
    if (recipe) {
      setInstructionsText(recipe.instructions)
      setNotesText(recipe.notes)
      setIngredientsList([...recipe.ingredients])
      // Restore checked state from sessionStorage
      try {
        const saved = sessionStorage.getItem(`sharons-kitchen-checked-${recipe.id}`)
        setCheckedIngredients(saved ? new Set(JSON.parse(saved)) : new Set())
      } catch {
        setCheckedIngredients(new Set())
      }
    }
  }, [recipe])

  // Sticky header intersection observer
  useEffect(() => {
    if (!recipe) return
    const container = scrollContainerRef.current
    const header = headerRef.current
    if (!container || !header) return

    const observer = new IntersectionObserver(
      ([entry]) => { setShowStickyName(!entry.isIntersecting) },
      { root: container, threshold: 0 }
    )
    observer.observe(header)
    return () => observer.disconnect()
  }, [recipe])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && recipe) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [recipe, onClose])

  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      if (recipe) {
        sessionStorage.setItem(
          `sharons-kitchen-checked-${recipe.id}`,
          JSON.stringify([...next])
        )
      }
      return next
    })
  }, [recipe])

  const handleSaveInstructions = () => {
    if (recipe) {
      onSaveInstructions(recipe.id, instructionsText)
      setEditingInstructions(false)
      onToast('הוראות ההכנה נשמרו')
    }
  }

  const handleSaveNotes = () => {
    if (recipe) {
      onSaveNotes(recipe.id, notesText)
      setEditingNotes(false)
      onToast('הערות נשמרו')
    }
  }

  const handleSaveIngredients = () => {
    if (recipe) {
      const cleaned = ingredientsList.filter(ing => ing.trim() !== '')
      onSaveIngredients(recipe.id, cleaned)
      setEditingIngredients(false)
      onToast('מרכיבים נשמרו')
    }
  }

  const handleCancelIngredients = () => {
    if (recipe) {
      setIngredientsList([...recipe.ingredients])
      setEditingIngredients(false)
    }
  }

  const updateIngredient = (index: number, value: string) => {
    setIngredientsList(prev => prev.map((item, i) => i === index ? value : item))
  }

  const removeIngredient = (index: number) => {
    setIngredientsList(prev => prev.filter((_, i) => i !== index))
  }

  const addIngredient = () => {
    setIngredientsList(prev => [...prev, ''])
  }

  const handlePrint = () => window.print()

  // Progress bar calculation (Sprint 2+3)
  const ingredients = recipe?.ingredients ?? []
  const countableIndices = ingredients.map((ing, i) => ({ ing, i })).filter(({ ing }) => !isGroupHeader(ing))
  const checkedCount = countableIndices.filter(({ i }) => checkedIngredients.has(i)).length
  const totalCountable = countableIndices.length
  const progressPct = totalCountable > 0 ? Math.round((checkedCount / totalCountable) * 100) : 0
  const allChecked = totalCountable > 0 && checkedCount === totalCountable

  return (
    <div
      className={`recipe-modal-overlay fixed inset-0 z-[200] flex items-end md:items-center justify-center transition-all duration-350
        ${recipe ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      style={{ background: 'rgba(23, 37, 42, 0.35)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={scrollContainerRef}
        className={`recipe-modal-content w-full max-w-[600px] max-h-[92vh] md:max-h-[85vh] overflow-y-auto recipe-scroll
          rounded-t-[22px] md:rounded-[22px] md:mb-5 transition-transform duration-400`}
        style={{
          background: 'var(--color-cream)',
          transform: recipe ? 'translateY(0)' : 'translateY(100%)',
          WebkitOverflowScrolling: 'touch',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {recipe && (
          <>
            {/* Sticky bar: drag handle + recipe name when scrolled (Sprint 5) */}
            <div
              className="sticky top-0 z-10 cursor-pointer"
              style={{
                background: 'var(--color-cream)',
                borderBottom: showStickyName ? '1px solid rgba(23,37,42,0.06)' : 'none',
              }}
              onClick={onClose}
            >
              <div className="flex justify-center pt-3 pb-1">
                <span className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(23,37,42,0.12)' }} />
              </div>
              {showStickyName && (
                <div className="px-6 pb-2 text-center">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.92rem',
                      color: 'var(--color-terracotta)',
                    }}
                  >
                    {recipe.name}
                  </span>
                </div>
              )}
            </div>

            {/* Header with gradient accent */}
            <div ref={headerRef} className="px-6 pt-2 pb-5" style={{ borderBottom: '1px solid rgba(23,37,42,0.06)' }}>
              <h2
                className="font-suez text-[1.5rem] leading-snug mb-3"
                style={{ color: 'var(--color-terracotta)' }}
              >
                {recipe.name}
              </h2>

              <div className="flex gap-2.5 flex-wrap">
                {recipe.temp && (
                  <MetaBadge icon="🌡️" text={`${recipe.temp}°`} />
                )}
                {recipe.time && (
                  <MetaBadge icon="⏱️" text={recipe.time} />
                )}
                {recipe.source && (
                  <MetaBadge icon="👩‍🍳" text={recipe.source} />
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-6 pb-12 max-md:px-5">
              {/* Ingredients section */}
              <div className="flex items-center justify-between mb-3.5">
                <SectionTitle icon="🧂" title="מרכיבים" />
                {!editingIngredients && (
                  <button
                    className="edit-button inline-flex items-center gap-1 px-3 py-1.5 border-none rounded-lg font-heebo text-[0.78rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95"
                    style={{ background: 'var(--color-terracotta)', color: '#FAF9F6' }}
                    onClick={() => setEditingIngredients(true)}
                  >
                    ✏️ עריכה
                  </button>
                )}
              </div>

              {/* Multiplier buttons (Sprint 4) */}
              {!editingIngredients && (
                <div className="flex gap-1.5 mb-4">
                  {MULTIPLIERS.map(m => (
                    <button
                      key={m}
                      className="px-3 py-1 border-none rounded-lg font-heebo text-[0.75rem] font-medium cursor-pointer transition-all duration-200"
                      style={{
                        background: multiplier === m ? 'var(--color-terracotta)' : 'var(--color-cream-dark)',
                        color: multiplier === m ? '#fff' : 'var(--color-brown-medium)',
                      }}
                      onClick={() => setMultiplier(m)}
                    >
                      ×{m}
                    </button>
                  ))}
                </div>
              )}

              {/* Progress bar (Sprint 2) — only shown when there are checked items */}
              {!editingIngredients && checkedCount > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brown-medium)', fontFamily: 'var(--font-ui)' }}>
                      {allChecked
                        ? '✓ כל המרכיבים מוכנים!'
                        : `מרכיבים (${checkedCount}/${totalCountable})`
                      }
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-brown-medium)', fontFamily: 'var(--font-ui)' }}>
                      {progressPct}%
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: '4px', background: 'var(--color-cream-dark)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        background: allChecked ? 'var(--color-terracotta)' : 'var(--color-sage)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Ingredients list or editor */}
              {editingIngredients ? (
                /* Ingredient editing mode (Sprint 1) */
                <div className="mb-8">
                  <div className="flex flex-col gap-2">
                    {ingredientsList.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ing}
                          onChange={e => updateIngredient(i, e.target.value)}
                          dir="rtl"
                          className="flex-1 px-3 py-2 rounded-lg outline-none transition-all duration-200"
                          style={{
                            border: '2px solid var(--color-gold-light)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.92rem',
                            color: 'var(--color-brown)',
                            background: '#FFFFFF',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta-light)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-gold-light)' }}
                        />
                        <button
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all duration-200 hover:opacity-100"
                          style={{ background: 'transparent', color: '#c44', fontSize: '1.1rem', opacity: 0.5 }}
                          onClick={() => removeIngredient(i)}
                          title="מחיקת מרכיב"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {/* Add new ingredient row */}
                    <button
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border-none cursor-pointer transition-all duration-200 hover:opacity-80"
                      style={{
                        background: 'var(--color-cream-dark)',
                        color: 'var(--color-brown-medium)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.85rem',
                        border: '2px dashed rgba(23,37,42,0.1)',
                      }}
                      onClick={addIngredient}
                    >
                      + הוסיפי מרכיב
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-6 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-85 active:scale-95"
                      style={{ background: 'var(--color-terracotta)', color: '#fff' }}
                      onClick={handleSaveIngredients}
                    >
                      💾 שמירה
                    </button>
                    <button
                      className="px-6 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] cursor-pointer transition-all duration-200 hover:opacity-80"
                      style={{ background: 'var(--color-cream-dark)', color: 'var(--color-brown-medium)' }}
                      onClick={handleCancelIngredients}
                    >
                      ↩ ביטול
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode with group headers (Sprint 3) and scaling (Sprint 4) */
                <ul className="list-none mb-8">
                  {ingredients.map((ing, i) => {
                    const isHeader = isGroupHeader(ing)
                    const parsed = parseIngredient(ing)

                    if (isHeader) {
                      return (
                        <li
                          key={i}
                          className="ingredient-header"
                          style={{
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            color: 'var(--color-terracotta)',
                            borderBottom: '1px solid rgba(43,122,120,0.15)',
                            paddingBottom: '6px',
                            paddingTop: i > 0 ? '12px' : '0',
                            paddingRight: '3px',
                            fontFamily: 'var(--font-body)',
                            listStyle: 'none',
                          }}
                        >
                          {ing.replace(/:$/, '')}
                        </li>
                      )
                    }

                    return (
                      <li
                        key={i}
                        className={`ingredient-item flex items-center gap-3 py-3 px-3 cursor-pointer rounded-lg transition-all duration-250 hover:bg-cream-dark/50
                          ${checkedIngredients.has(i) ? 'ingredient-struck' : ''}`}
                        style={{
                          borderBottom: '1px solid rgba(23,37,42,0.04)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.95rem',
                          color: 'var(--color-brown)',
                        }}
                        onClick={() => toggleIngredient(i)}
                      >
                        {/* Custom checkbox */}
                        <span
                          className="ingredient-checkbox shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-200"
                          style={{
                            border: checkedIngredients.has(i)
                              ? '2px solid var(--color-terracotta)'
                              : '2px solid rgba(23,37,42,0.15)',
                            background: checkedIngredients.has(i)
                              ? 'var(--color-terracotta)'
                              : 'transparent',
                            color: '#fff',
                            fontSize: '0.65rem',
                          }}
                        >
                          {checkedIngredients.has(i) && '✓'}
                        </span>
                        <span>{scaleIngredientText(parsed, multiplier)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* Instructions */}
              <SectionTitle icon="📝" title="הוראות הכנה" />
              <div className="mb-8">
                {editingInstructions ? (
                  <EditArea
                    value={instructionsText}
                    onChange={setInstructionsText}
                    onSave={handleSaveInstructions}
                    onCancel={() => { setEditingInstructions(false); setInstructionsText(recipe.instructions) }}
                  />
                ) : recipe.instructions ? (
                  <>
                    <div
                      className="whitespace-pre-wrap leading-[1.85]"
                      style={{ fontSize: '0.95rem', color: 'var(--color-brown-light)', fontFamily: 'var(--font-body)' }}
                    >
                      {recipe.instructions}
                    </div>
                    <EditButton onClick={() => setEditingInstructions(true)} />
                  </>
                ) : (
                  <EmptyState
                    text="עדיין לא נוספו הוראות הכנה"
                    buttonText="הוסיפי הוראות"
                    onClick={() => setEditingInstructions(true)}
                  />
                )}
              </div>

              {/* Notes */}
              {(recipe.notes || editingNotes) ? (
                <div>
                  <SectionTitle icon="💡" title="הערות וטיפים" />
                  {editingNotes ? (
                    <EditArea
                      value={notesText}
                      onChange={setNotesText}
                      onSave={handleSaveNotes}
                      onCancel={() => { setEditingNotes(false); setNotesText(recipe.notes) }}
                    />
                  ) : (
                    <>
                      <div
                        className="whitespace-pre-wrap leading-[1.85] p-4 rounded-xl"
                        style={{
                          fontSize: '0.92rem',
                          color: 'var(--color-brown-light)',
                          fontFamily: 'var(--font-body)',
                          background: 'rgba(43,122,120,0.05)',
                          borderRight: '3px solid var(--color-terracotta-light)',
                        }}
                      >
                        {recipe.notes}
                      </div>
                      <EditButton onClick={() => setEditingNotes(true)} />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95"
                    style={{ background: 'var(--color-cream-dark)', color: 'var(--color-brown-medium)' }}
                    onClick={() => setEditingNotes(true)}
                  >
                    💡 הוסיפי הערות וטיפים
                  </button>
                </div>
              )}

              {/* Print button (Sprint 6) */}
              <div className="mt-8 text-center">
                <button
                  className="print-button inline-flex items-center gap-2 px-5 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{ background: 'var(--color-cream-dark)', color: 'var(--color-brown-medium)' }}
                  onClick={handlePrint}
                >
                  🖨️ הדפסה
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h3
      className="flex items-center gap-2 mb-0"
      style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-brown)' }}
    >
      <span>{icon}</span>
      {title}
    </h3>
  )
}

function MetaBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[0.82rem] px-3 py-1.5 rounded-lg"
      style={{
        background: '#FFFFFF',
        color: 'var(--color-brown-light)',
        border: '1px solid rgba(23,37,42,0.05)',
      }}
    >
      <span className="text-[0.85rem]">{icon}</span>
      {text}
    </span>
  )
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="edit-button inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg font-heebo text-[0.82rem] font-medium cursor-pointer mt-3 transition-all duration-200 hover:opacity-80 active:scale-95"
      style={{ background: 'var(--color-terracotta)', color: '#FAF9F6' }}
      onClick={onClick}
    >
      ✏️ עריכה
    </button>
  )
}

function EditArea({ value, onChange, onSave, onCancel }: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <>
      <textarea
        className="w-full min-h-[150px] p-4 rounded-xl resize-y outline-none transition-all duration-200"
        style={{
          border: '2px solid var(--color-gold-light)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.92rem',
          lineHeight: 1.8,
          color: 'var(--color-brown)',
          background: '#FFFFFF',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta-light)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-gold-light)' }}
        dir="rtl"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2 mt-3">
        <button
          className="px-6 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-85 active:scale-95"
          style={{ background: 'var(--color-terracotta)', color: '#fff' }}
          onClick={onSave}
        >
          שמירה
        </button>
        <button
          className="px-6 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] cursor-pointer transition-all duration-200 hover:opacity-80"
          style={{ background: 'var(--color-cream-dark)', color: 'var(--color-brown-medium)' }}
          onClick={onCancel}
        >
          ביטול
        </button>
      </div>
    </>
  )
}

function EmptyState({ text, buttonText, onClick }: { text: string; buttonText: string; onClick: () => void }) {
  return (
    <div
      className="text-center py-8 px-6 rounded-xl"
      style={{
        background: '#FFFFFF',
        border: '2px dashed rgba(23,37,42,0.08)',
      }}
    >
      <div className="text-[2rem] mb-2">📝</div>
      <p className="text-[0.85rem] mb-4" style={{ color: 'var(--color-brown-medium)', fontFamily: 'var(--font-body)' }}>
        {text}
      </p>
      <button
        className="inline-flex items-center gap-1.5 px-5 py-2.5 border-none rounded-xl font-heebo text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:opacity-85 active:scale-95"
        style={{ background: 'var(--color-terracotta)', color: '#FAF9F6' }}
        onClick={onClick}
      >
        ✏️ {buttonText}
      </button>
    </div>
  )
}
