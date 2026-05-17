'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, Edit2 } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import Swal from 'sweetalert2'
import type { Order } from '@prisma/client'

interface OrderWithItems extends Order {
  items: Array<{
    productNameSnapshot: string
    quantity: number
    unitSnapshot: string
    priceSnapshot: number
  }>
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(
    id: string,
    paymentStatus?: string,
    itemStatus?: string
  ) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(paymentStatus && { paymentStatus }),
          ...(itemStatus && { itemStatus }),
        }),
      })

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Status pesanan berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: '#16a34a',
        })
        fetchOrders()
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memperbarui status',
        confirmButtonColor: '#16a34a',
      })
    }
  }

  async function handleDelete(id: string, transactionId: string) {
    const { value: inputId } = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Pesanan',
      input: 'text',
      inputPlaceholder: `Ketik "${transactionId}" untuk konfirmasi`,
      text: 'Yakin ingin menghapus pesanan ini?',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal',
    })

    if (inputId === transactionId) {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Pesanan berhasil dihapus',
            confirmButtonColor: '#16a34a',
          })
          fetchOrders()
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menghapus pesanan',
          confirmButtonColor: '#16a34a',
        })
      }
    }
  }

  const filtered = orders.filter((order) => {
    const matchSearch =
      order.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search)
    const matchStatus = filterStatus === 'all' || order.paymentStatus === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manajemen Pesanan</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Transaction ID atau No. HP..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Semua Status</option>
          <option value="PENDING">Menunggu Bayar</option>
          <option value="CONFIRMED">Menunggu Konfirmasi</option>
          <option value="LUNAS">Lunas</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Total</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Bayar</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Barang</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Waktu</th>
                <th className="px-4 py-3 sm:px-6 text-left font-semibold text-gray-800 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 sm:px-6 font-mono font-semibold text-gray-800 whitespace-nowrap">
                    {order.transactionId}
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <div className="text-gray-800">{order.customerName || 'Tanpa Nama'}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6 font-semibold text-green-600 whitespace-nowrap">
                    {formatRupiah(order.totalPrice)}
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="LUNAS">Lunas</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <select
                      value={order.itemStatus}
                      onChange={(e) => updateOrderStatus(order.id, undefined, e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 sm:px-6 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(order.id, order.transactionId)}
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
