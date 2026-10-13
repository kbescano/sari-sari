export interface Category {
  slug: string
  name: string
}

export function CategoryChips({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: Category[]
  activeSlug: string | null
  onSelect: (slug: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`h-touch-min rounded-2xl px-5 text-lg font-semibold transition-colors ${
          activeSlug === null ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = activeSlug === category.slug
        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => onSelect(category.slug)}
            className={`h-touch-min rounded-2xl px-5 text-lg font-semibold transition-colors ${
              isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
