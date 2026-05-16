'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatRupiah, isValidPhone } from '@/lib/utils'
import Swal from 'sweetalert2'
import { Banknote, QrCode } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | ''>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/produk')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!phone.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nomor HP wajib diisi', confirmButtonColor: '#16a34a' })
      return
    }
    if (!isValidPhone(phone)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format nomor HP tidak valid',
        text: 'Gunakan format 08xx atau 62xx',
        confirmButtonColor: '#16a34a',
      })
      return
    }
    if (!paymentMethod) {
      Swal.fire({ icon: 'warning', title: 'Pilih metode pembayaran', confirmButtonColor: '#16a34a' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim() || null,
          customerPhone: phone.trim(),
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan')
      }

      // Get full order details from API to save locally and show status
      let fullOrder = null
      try {
        const detailRes = await fetch(`/api/orders/${data.transactionId}`)
        if (detailRes.ok) {
          fullOrder = await detailRes.json()
        }
      } catch (e) {
        // ignore fetch detail error; we'll still store minimal info
      }

      // Save to localStorage for "Cek pesanan"
      try {
        const key = 'my_orders'
        const existing = JSON.parse(localStorage.getItem(key) || '[]') as any[]
        const toSave = fullOrder || { transactionId: data.transactionId, totalPrice: data.totalPrice, createdAt: new Date().toISOString(), paymentStatus: 'PENDING', itemStatus: 'PREPARING' }
        const found = existing.find((o) => o.transactionId === toSave.transactionId)
        if (!found) {
          existing.unshift(toSave)
          if (existing.length > 50) existing.pop()
          localStorage.setItem(key, JSON.stringify(existing))
        } else {
          // update entry
          const updated = existing.map((o) => (o.transactionId === toSave.transactionId ? toSave : o))
          localStorage.setItem(key, JSON.stringify(updated))
        }
      } catch (e) {
        // ignore storage errors
      }

      // Show QRIS modal if needed
      if (paymentMethod === 'QRIS' && data.qrisImageUrl) {
        await Swal.fire({
          title: 'Scan QRIS untuk Bayar',
          html: `
            <img src="${data.qrisImageUrl}" alt="QRIS" class="mx-auto max-w-[240px] rounded-lg" />
            <p class="mt-3 text-sm text-gray-600">Tunjukkan bukti transfer ke kasir untuk konfirmasi</p>
          `,
          confirmButtonText: 'Sudah Bayar / Nanti',
          confirmButtonColor: '#16a34a',
        })
      }

      // Notify user and redirect to success page
      await Swal.fire({
        icon: 'success',
        title: 'Pesanan berhasil dibuat',
        html: `<p>Transaction ID: <strong>${data.transactionId}</strong></p><p>Simpan ID ini untuk melihat status pesanan di halaman Cek Pesanan.</p>`,
        confirmButtonColor: '#16a34a',
      })

      clearCart()
      router.push(`/pesanan-berhasil?id=${data.transactionId}`)
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
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Customer info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Informasi Pemesan</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nama <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Opsional — boleh dikosongkan"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xx atau 62xx"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'CASH', label: 'Cash', icon: Banknote, desc: 'Bayar di kasir' },
              { value: 'QRIS', label: 'QRIS', icon: QrCode, desc: 'Scan QR code' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value as 'CASH' | 'QRIS')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <Icon
                  className={`w-8 h-8 ${paymentMethod === value ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span
                  className={`font-bold text-base ${paymentMethod === value ? 'text-green-700' : 'text-gray-700'}`}
                >
                  {label}
                </span>
                <span className="text-xs text-gray-400">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Ringkasan Pesanan</h2>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity} {item.unit}
                </span>
                <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-green-600">{formatRupiah(getTotal())}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold text-lg py-4 rounded-xl transition-colors"
        >
          {loading ? 'Memproses...' : 'Buat Pesanan'}
        </button>
      </form>
    </div>
  )
}
