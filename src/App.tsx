import { useState, useCallback } from 'react'
import { useRecipeStore } from '@/hooks/useRecipeStore'
import Header from '@/components/Header'
import CategoryBar from '@/components/CategoryBar'
import RecipeGrid from '@/components/RecipeGrid'
import RecipeModal from '@/components/RecipeModal'
import Toast from '@/components/Toast'
import InstallBanner from '@/components/InstallBanner'

export default function App() {
  const store = useRecipeStore()
  const [toastMessage, setToastMessage] = useState('')

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
  }, [])

  const hideToast = useCallback(() => {
    setToastMessage('')
  }, [])

  return (
    <>
      <Header
        totalRecipes={store.recipes.length}
        search={store.search}
        onSearchChange={store.setSearch}
        changesCount={store.changesCount}
        onExport={store.exportChanges}
        onToast={showToast}
      />

      <CategoryBar
        categories={store.categories}
        activeCategory={store.activeCategory}
        recipes={store.recipes}
        onSelect={store.setActiveCategory}
      />

      <main className="max-w-[900px] mx-auto px-4 pt-5 pb-[100px] relative z-[1]">
        <RecipeGrid
          filteredRecipes={store.filteredRecipes}
          groupedRecipes={store.groupedRecipes}
          categories={store.categories}
          activeCategory={store.activeCategory}
          search={store.search}
          onOpenRecipe={store.openRecipe}
        />
      </main>

      <RecipeModal
        recipe={store.selectedRecipe}
        onClose={store.closeRecipe}
        onSaveInstructions={store.saveInstructions}
        onSaveNotes={store.saveNotes}
        onToast={showToast}
      />

      <Toast message={toastMessage} onHide={hideToast} />
      <InstallBanner />
    </>
  )
}
