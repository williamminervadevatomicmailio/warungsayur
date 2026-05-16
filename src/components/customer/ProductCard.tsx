'use client'

import Image from 'next/image'
import type { Product } from '@prisma/client'
import { useCartStore } from '@/store/cart'
import { formatRupiah } from '@/lib/utils'
import { Plus, Minus } from 'lucide-react'
import Swal from 'sweetalert2'

const PLACEHOLDER_IMAGE = '/images/placeholder-sayur.svg'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((i) => i.productId === product.id)
  const quantity = cartItem?.quantity ?? 0
  const outOfStock = product.stock === 0
  const imageSrc = product.imageUrl?.trim() || PLACEHOLDER_IMAGE
  const needsUnoptimized = imageSrc !== PLACEHOLDER_IMAGE

  function handleAdd() {
    if (outOfStock) return
    if (quantity >= product.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stok Terbatas',
        text: `Stok ${product.name} hanya ${product.stock} ${product.unit}, ya!`,
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'Mengerti',
      })
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      stock: product.stock,
    })
  }

  function handleDecrease() {
    updateQuantity(product.id, quantity - 1)
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${
        outOfStock ? 'opacity-70' : ''
      }`}
    >
      {/* Product image */}
      <div className="relative w-full aspect-square bg-gray-50">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          unoptimized={needsUnoptimized}
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 200px"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
          }}
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Sisa: {product.stock} {product.unit}
        </p>
        <p className="text-green-600 font-bold text-base mt-1">
          {formatRupiah(product.price)}
          <span className="text-gray-400 font-normal text-xs">/{product.unit}</span>
        </p>

        {/* Add to cart controls */}
        <div className="mt-2">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="w-full flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          ) : (
            <div className="flex items-center justify-between bg-green-50 rounded-xl px-1">
              <button
                onClick={handleDecrease}
                className="w-10 h-10 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-green-700 text-lg min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="w-10 h-10 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Tambah jumlah"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
