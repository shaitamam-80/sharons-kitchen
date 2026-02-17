import { useState, useEffect, useCallback } from 'react'
import type { Recipe } from '@/types/recipe'

interface RecipeModalProps {
  recipe: Recipe | null
  onClose: () => void
  onSaveInstructions: (id: number, instructions: string) => void
  onSaveNotes: (id: number, notes: string) => void
  onToast: (msg: string) => void
}

export default function RecipeModal({ recipe, onClose, onSaveInstructions, onSaveNotes, onToast }: RecipeModalProps) {
  const [editingInstructions, setEditingInstructions] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [instructionsText, setInstructionsText] = useState('')
  const [notesText, setNotesText] = useState('')
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  // Reset state when recipe changes
  useEffect(() => {
    setEditingInstructions(false)
    setEditingNotes(false)
    setCheckedIngredients(new Set())
    if (recipe) {
      setInstructionsText(recipe.instructions)
      setNotesText(recipe.notes)
    }
  }, [recipe])

  // Close on Escape
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
      return next
    })
  }, [])

  const handleSaveInstructions = () => {
    if (recipe) {
      onSaveInstructions(recipe.id, instructionsText)
      setEditingInstructions(false)
      onToast('הוראות ההכנה נשמרו ✓')
    }
  }

  const handleSaveNotes = () => {
    if (recipe) {
      onSaveNotes(recipe.id, notesText)
      setEditingNotes(false)
      onToast('הערות נשמרו ✓')
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end md:items-center justify-center transition-all duration-350
        ${recipe ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      style={{ background: 'rgba(61, 43, 31, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`bg-cream w-full max-w-[600px] max-h-[90vh] md:max-h-[85vh] overflow-y-auto transition-transform duration-400
          rounded-t-[24px] md:rounded-[24px] md:mb-5`}
        style={{
          transform: recipe ? 'translateY(0)' : 'translateY(100%)',
          WebkitOverflowScrolling: 'touch',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {recipe && (
          <>
            {/* Handle */}
            <div className="flex justify-center p-3 sticky top-0 bg-cream z-10 cursor-pointer" onClick={onClose}>
              <span className="w-10 h-1 rounded-sm bg-brown/15" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-brown/[0.06]">
              <h2 className="font-suez text-[1.5rem] text-terracotta-dark mb-2">{recipe.name}</h2>
              <div className="flex gap-3 flex-wrap">
                {recipe.temp && (
                  <span className="flex items-center gap-1.5 text-[0.85rem] text-brown-light bg-white px-3 py-1.5 rounded-lg">
                    🌡️ {recipe.temp}°
                  </span>
                )}
                {recipe.time && (
                  <span className="flex items-center gap-1.5 text-[0.85rem] text-brown-light bg-white px-3 py-1.5 rounded-lg">
                    ⏱️ {recipe.time}
                  </span>
                )}
                {recipe.source && (
                  <span className="flex items-center gap-1.5 text-[0.85rem] text-brown-light bg-white px-3 py-1.5 rounded-lg">
                    👩‍🍳 {recipe.source}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-10 max-md:px-5">
              {/* Ingredients */}
              <h3 className="font-suez text-[1.1rem] text-brown mb-3 flex items-center gap-2">🧂 מרכיבים</h3>
              <ul className="list-none mb-7">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className={`py-2.5 px-3 border-b border-brown/[0.04] text-[0.92rem] flex items-center gap-2.5 transition-colors duration-200 rounded-[6px] cursor-pointer hover:bg-terracotta/[0.04]
                      ${checkedIngredients.has(i) ? 'opacity-40 line-through' : ''}`}
                    onClick={() => toggleIngredient(i)}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${checkedIngredients.has(i) ? 'bg-sage' : 'bg-gold'}`} />
                    {ing}
                  </li>
                ))}
              </ul>

              {/* Instructions */}
              <h3 className="font-suez text-[1.1rem] text-brown mb-3 flex items-center gap-2">📝 הוראות הכנה</h3>
              <div>
                {editingInstructions ? (
                  <>
                    <textarea
                      className="w-full min-h-[150px] p-3.5 border-2 border-gold-light rounded-[10px] font-heebo text-[0.9rem] leading-[1.7] text-brown bg-white resize-y outline-none focus:border-terracotta transition-colors"
                      dir="rtl"
                      value={instructionsText}
                      onChange={e => setInstructionsText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2.5">
                      <button
                        className="px-6 py-2.5 bg-sage text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer hover:bg-[#7A8D6E] transition-colors"
                        onClick={handleSaveInstructions}
                      >
                        שמירה
                      </button>
                      <button
                        className="px-6 py-2.5 bg-cream-dark text-brown-light border-none rounded-[10px] font-heebo text-[0.85rem] cursor-pointer hover:bg-[#E8DDD0] transition-colors"
                        onClick={() => { setEditingInstructions(false); setInstructionsText(recipe.instructions) }}
                      >
                        ביטול
                      </button>
                    </div>
                  </>
                ) : recipe.instructions ? (
                  <>
                    <div className="text-[0.9rem] leading-[1.8] text-brown-light whitespace-pre-wrap">{recipe.instructions}</div>
                    <button
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-terracotta text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer mt-3 hover:bg-terracotta-dark transition-colors"
                      onClick={() => setEditingInstructions(true)}
                    >
                      ✏️ עריכה
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 bg-white rounded-[10px] border-2 border-dashed border-brown/10">
                    <div className="text-[2rem] mb-1">📝</div>
                    <p className="text-[0.85rem] text-gold mt-2">עדיין לא נוספו הוראות הכנה</p>
                    <button
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-terracotta text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer mt-4 hover:bg-terracotta-dark transition-colors"
                      onClick={() => setEditingInstructions(true)}
                    >
                      ✏️ הוסיפי הוראות
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(recipe.notes || editingNotes) ? (
                <div className="mt-7">
                  <h3 className="font-suez text-[1.1rem] text-brown mb-3 flex items-center gap-2">💡 הערות וטיפים</h3>
                  {editingNotes ? (
                    <>
                      <textarea
                        className="w-full min-h-[150px] p-3.5 border-2 border-gold-light rounded-[10px] font-heebo text-[0.9rem] leading-[1.7] text-brown bg-white resize-y outline-none focus:border-terracotta transition-colors"
                        dir="rtl"
                        value={notesText}
                        onChange={e => setNotesText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2.5">
                        <button
                          className="px-6 py-2.5 bg-sage text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer hover:bg-[#7A8D6E] transition-colors"
                          onClick={handleSaveNotes}
                        >
                          שמירה
                        </button>
                        <button
                          className="px-6 py-2.5 bg-cream-dark text-brown-light border-none rounded-[10px] font-heebo text-[0.85rem] cursor-pointer hover:bg-[#E8DDD0] transition-colors"
                          onClick={() => { setEditingNotes(false); setNotesText(recipe.notes) }}
                        >
                          ביטול
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[0.9rem] leading-[1.8] text-brown-light whitespace-pre-wrap">{recipe.notes}</div>
                      <button
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-terracotta text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer mt-3 hover:bg-terracotta-dark transition-colors"
                        onClick={() => setEditingNotes(true)}
                      >
                        ✏️ עריכה
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-5">
                  <button
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold text-white border-none rounded-[10px] font-heebo text-[0.85rem] font-medium cursor-pointer hover:bg-gold-light transition-colors"
                    onClick={() => setEditingNotes(true)}
                  >
                    💡 הוסיפי הערות וטיפים
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
