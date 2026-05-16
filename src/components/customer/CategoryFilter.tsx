'use client'

interface Props {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
