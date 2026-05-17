'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import Swal from 'sweetalert2'

interface OrderData {
  transactionId: string
  customerName: string | null
  customerPhone: string
  paymentMethod: string
  paymentStatus: string
  itemStatus: string
  totalPrice: number
  createdAt: string
  items: Array<{
    productNameSnapshot: string
    quantity: number
    unitSnapshot: string
    priceSnapshot: number
  }>
}

export default function CekPesananClient({ initialId }: { initialId?: string }) {
  const idFromParams = initialId || ''
  const [transactionId, setTransactionId] = useState(idFromParams)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(!!idFromParams)
  const [error, setError] = useState('')
  const [savedOrders, setSavedOrders] = useState<OrderData[]>([])

  useEffect(() => {
    if (idFromParams) {
      handleSearch(idFromParams)
    }
    // load saved orders from localStorage
    try {
      const raw = localStorage.getItem('my_orders')
      if (raw) {
        const parsed = JSON.parse(raw) as OrderData[]
        setSavedOrders(parsed)
      }
    } catch (e) {
      console.error('Failed to read saved orders', e)
    }
  }, [idFromParams])

  useEffect(() => {
    if (!savedOrders || savedOrders.length === 0) return

    let mounted = true
    ;(async () => {
      const key = 'my_orders'
      const existing = [...savedOrders]
      let changed = false
      const toCheck = existing.slice(0, 20)
      for (const so of toCheck) {
        try {
          const res = await fetch(`/api/orders/${so.transactionId}`)
          if (res.status === 404) {
            const idx = existing.findIndex((o) => o.transactionId === so.transactionId)
            if (idx !== -1) {
              existing.splice(idx, 1)
              changed = true
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (mounted && changed) {
        try {
          localStorage.setItem(key, JSON.stringify(existing))
        } catch (e) {
          // ignore
        }
        setSavedOrders(existing)
      }
    })()

    return () => {
      mounted = false
    }
  }, [savedOrders])

  async function handleSearch(id?: string) {
    const idToSearch = id || transactionId

    if (!idToSearch.trim()) {
      setError('Masukkan Transaction ID')
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/${idToSearch}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError('Pesanan tidak ditemukan. Periksa kembali Transaction ID Anda.')
          try {
            const key = 'my_orders'
            const existing = JSON.parse(localStorage.getItem(key) || '[]') as any[]
            const updated = existing.filter((o) => o.transactionId !== idToSearch)
            localStorage.setItem(key, JSON.stringify(updated))
            setSavedOrders(updated)
          } catch (e) {
            // ignore
          }
        } else {
          setError('Gagal mengambil data pesanan')
        }
        return
      }

      const data = await res.json()
      setOrder(data)
      try {
        const key = 'my_orders'
        const existing = JSON.parse(localStorage.getItem(key) || '[]') as any[]
        const found = existing.find((o) => o.transactionId === data.transactionId)
        if (found) {
          const updated = existing.map((o) => (o.transactionId === data.transactionId ? data : o))
          localStorage.setItem(key, JSON.stringify(updated))
          setSavedOrders(updated)
        } else {
          existing.unshift(data)
          if (existing.length > 50) existing.pop()
          localStorage.setItem(key, JSON.stringify(existing))
          setSavedOrders(existing)
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSearch()
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '🟡 Menunggu Pembayaran'
      case 'CONFIRMED':
        return '🟡 Menunggu Konfirmasi'
      case 'LUNAS':
        return '🟢 Lunas'
      default:
        return status
    }
  }

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return '🟡 Sedang Disiapkan'
      case 'READY':
        return '🟢 Siap Diambil'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <Link href="/produk" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cek Status Pesanan</h1>
        <p className="text-gray-500 text-sm mb-6">Masukkan Transaction ID untuk melihat status pesanan Anda</p>

        {savedOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Pesanan Anda</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Transaction ID</th>
                    <th className="pb-2">Waktu</th>
                    <th className="pb-2">Pembayaran</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {savedOrders.map((so) => (
                    <tr key={so.transactionId} className="border-t border-gray-100">
                      <td className="py-2 font-mono">{so.transactionId}</td>
                      <td className="py-2">{formatDate(so.createdAt)}</td>
                      <td className="py-2">{so.paymentStatus}</td>
                      <td className="py-2">{so.itemStatus}</td>
                      <td className="py-2">
                        <button
                          className="text-green-600 font-semibold"
                          onClick={() => handleSearch(so.transactionId)}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
              placeholder="Contoh: SYR-20260516-ABC123"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
              style={{ fontSize: '16px' }}
              aria-label="Transaction ID"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-2">Status Pembayaran</p>
                <p className="text-base font-semibold text-gray-800">{getPaymentStatusLabel(order.paymentStatus)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-2">Status Barang</p>
                <p className="text-base font-semibold text-gray-800">{getItemStatusLabel(order.itemStatus)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Informasi Pesanan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono font-semibold text-gray-800">{order.transactionId}</span>
                </div>
                {order.customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama Pemesan</span>
                    <span className="font-semibold text-gray-800">{order.customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor HP</span>
                  <span className="font-semibold text-gray-800">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waktu Pesanan</span>
                  <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode Bayar</span>
                  <span className="font-semibold text-gray-800">
                    {order.paymentMethod === 'CASH' ? '💵 Cash' : '📱 QRIS'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Detail Pesanan</h2>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600">
                      {item.productNameSnapshot} × {item.quantity} {item.unitSnapshot}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatRupiah(item.priceSnapshot * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-green-600">{formatRupiah(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-gray-700">
              {order.paymentStatus === 'PENDING' && (
                <p>
                  {order.paymentMethod === 'QRIS'
                    ? '📱 Silakan scan QRIS di warung untuk menyelesaikan pembayaran'
                    : '💵 Silakan datang ke warung dan lakukan pembayaran'}
                </p>
              )}
              {order.paymentStatus === 'LUNAS' && order.itemStatus === 'PREPARING' && (
                <p>✨ Pesanan Anda sedang disiapkan. Tunggu beberapa saat lagi.</p>
              )}
              {order.itemStatus === 'READY' && (
                <p>🎉 Pesanan Anda siap diambil! Silakan datang ke warung.</p>
              )}
            </div>

            <Link
              href="/produk"
              className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Belanja Lagi
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
