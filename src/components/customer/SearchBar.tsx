'use client'

import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce the onChange so search fires 300ms after user stops typing
  const debouncedChange = useRef(
    debounce((val: unknown) => onChange(val as string), 300)
  ).current

  // Keep local input in sync with external value
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value
    }
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Cari sayuran, bumbu, warna..."
        defaultValue={value}
        onChange={(e) => debouncedChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder:text-gray-400"
        style={{ fontSize: '16px' }} // prevent iOS zoom
        aria-label="Cari produk"
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            if (inputRef.current) inputRef.current.value = ''
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
          aria-label="Hapus pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
