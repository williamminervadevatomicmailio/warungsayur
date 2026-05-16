'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { formatRupiah } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function KeranjangPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Keranjang Kosong</h2>
        <p className="text-gray-400 mt-2 text-sm">
          Belum ada produk yang ditambahkan ke keranjang.
        </p>
        <Link
          href="/produk"
          className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Belanja Sekarang
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Keranjang Belanja</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex gap-3"
          >
            {/* Image */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
              <Image
                src={item.imageUrl || '/images/placeholder-sayur.svg'}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                {item.name}
              </p>
              <p className="text-green-600 font-bold text-base mt-1">
                {formatRupiah(item.price)}
                <span className="text-gray-400 font-normal text-xs">/{item.unit}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Subtotal: {formatRupiah(item.price * item.quantity)}
              </p>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center bg-green-50 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    aria-label="Kurangi"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-green-700 w-8 text-center text-base">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (item.quantity < item.stock) {
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    }}
                    className="w-9 h-9 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    aria-label="Tambah"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                  aria-label={`Hapus ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total & checkout */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-medium">Total Belanja</span>
          <span className="text-green-600 font-bold text-xl">{formatRupiah(getTotal())}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-xl text-center transition-colors"
        >
          Lanjut ke Checkout
        </Link>
      </div>
    </div>
  )
}
