'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import type { Product } from '@prisma/client'

interface Props {
  productId?: string
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductForm({ productId, product, onSuccess, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [stock, setStock] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || '')
      setCategory(product.category)
      setPrice(product.price.toString())
      setUnit(product.unit)
      setStock(product.stock.toString())
      setTags(product.tags.join(', '))
      setImageUrl(product.imageUrl || '')
      setIsActive(product.isActive)
    }
  }, [product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !category || !price || !unit || !stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap isi semua field yang diperlukan',
        confirmButtonColor: '#16a34a',
      })
      return
    }

    setLoading(true)

    try {
      const method = productId ? 'PUT' : 'POST'
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          category,
          price: parseFloat(price),
          unit,
          stock: parseInt(stock),
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
          imageUrl: imageUrl || null,
          isActive,
        }),
      })

      if (!res.ok) {
        throw new Error('Gagal menyimpan produk')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: productId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan',
        confirmButtonColor: '#16a34a',
      })

      onSuccess()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan',
        confirmButtonColor: '#16a34a',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {productId ? 'Edit Produk' : 'Tambah Produk Baru'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Bayam Segar"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Sayuran">Sayuran</option>
            <option value="Bumbu & Rempah">Bumbu & Rempah</option>
            <option value="Olahan">Olahan</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Rp 0"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Satuan *</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="kg, ikat, pcs, bks, dll"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="hijau, segar, lokal"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi produk (opsional)"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Active status */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Produk Aktif</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : productId ? 'Perbarui' : 'Tambahkan'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
