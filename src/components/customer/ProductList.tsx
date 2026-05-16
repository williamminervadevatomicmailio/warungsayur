'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Product } from '@prisma/client'
import ProductCard from './ProductCard'
import SearchBar from './SearchBar'
import CategoryFilter from './CategoryFilter'

interface Props {
  initialProducts: Product[]
}

const CATEGORIES = ['Semua', 'Sayuran', 'Bumbu & Rempah', 'Olahan']

export default function ProductList({ initialProducts }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))

      const matchCategory = category === 'Semua' || p.category === category

      return matchSearch && matchCategory
    })
  }, [initialProducts, search, category])

  const handleSearch = useCallback((val: string) => setSearch(val), [])

  return (
    <div className="px-4 py-4">
      {/* Search bar */}
      <SearchBar value={search} onChange={handleSearch} />

      {/* Category filter */}
      <CategoryFilter
        categories={CATEGORIES}
        active={category}
        onChange={setCategory}
      />

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">😔</span>
          <p className="text-lg font-medium">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
