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

  useEffect(() => {
    setEditingInstructions(false)
    setEditingNotes(false)
    setCheckedIngredients(new Set())
    if (recipe) {
      setInstructionsText(recipe.instructions)
      setNotesText(recipe.notes)
    }
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
      return next
    })
  }, [])

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

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end md:items-center justify-center transition-all duration-350
        ${recipe ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      style={{ background: 'rgba(23, 37, 42, 0.35)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full max-w-[600px] max-h-[92vh] md:max-h-[85vh] overflow-y-auto recipe-scroll
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
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10 cursor-pointer" style={{ background: 'var(--color-cream)' }} onClick={onClose}>
              <span className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(23,37,42,0.12)' }} />
            </div>

            {/* Header with gradient accent */}
            <div className="px-6 pt-2 pb-5" style={{ borderBottom: '1px solid rgba(23,37,42,0.06)' }}>
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
              {/* Ingredients */}
              <SectionTitle icon="🧂" title="מרכיבים" />
              <ul className="list-none mb-8">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-3 py-3 px-3 cursor-pointer rounded-lg transition-all duration-250 hover:bg-cream-dark/50
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
                      className="shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-200"
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
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>

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
      className="flex items-center gap-2 mb-3.5"
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
      className="inline-flex items-center gap-1.5 px-4 py-2 border-none rounded-lg font-heebo text-[0.82rem] font-medium cursor-pointer mt-3 transition-all duration-200 hover:opacity-80 active:scale-95"
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
