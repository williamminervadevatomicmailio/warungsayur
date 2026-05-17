'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import Swal from 'sweetalert2'
import ProductForm from '@/components/admin/ProductForm'
import { createRoot } from 'react-dom/client'
import type { Product } from '@prisma/client'

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // modal rendering handled via SweetAlert + react-dom
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Produk',
      text: 'Yakin ingin menghapus produk ini? Produk yang terhapus tidak bisa dikembalikan.',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
    })

    if (!confirmed.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Produk berhasil dihapus',
          confirmButtonColor: '#16a34a',
        })
        fetchProducts()
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menghapus produk',
        confirmButtonColor: '#16a34a',
      })
    }
  }

  function openProductModal(product?: Product) {
    let root: any = null
    Swal.fire({
      title: product ? 'Edit Produk' : 'Tambah Produk',
      html: '<div id="swal-root"></div>',
      showConfirmButton: false,
      width: 800,
      didOpen: () => {
        const container = document.getElementById('swal-root')
        if (container) {
          root = createRoot(container)
          root.render(
            <ProductForm
              productId={product?.id}
              product={product}
              onSuccess={() => {
                if (root) root.unmount()
                Swal.close()
                fetchProducts()
              }}
              onCancel={() => {
                if (root) root.unmount()
                Swal.close()
              }}
            />
          )
        }
      },
      willClose: () => {
        if (root) {
          try {
            root.unmount()
          } catch (e) {}
        }
      },
    })
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
        <button
          onClick={() => openProductModal()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>
      

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Nama</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Kategori</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Harga</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Stok</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 sm:px-6 font-medium text-gray-800 whitespace-nowrap">{product.name}</td>
                  <td className="px-4 py-4 sm:px-6 text-gray-600 whitespace-nowrap">{product.category}</td>
                  <td className="px-4 py-4 sm:px-6 font-semibold text-green-600 whitespace-nowrap">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.stock < 5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6 flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => openProductModal(product)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
