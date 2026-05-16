'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Copy, Search } from 'lucide-react'
import Swal from 'sweetalert2'

function SuccessContent() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('id') || ''

  function handleCopy() {
    navigator.clipboard.writeText(transactionId).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Disalin!',
        text: 'Transaction ID berhasil disalin',
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: '#16a34a',
      })
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Pesanan Berhasil!</h1>
      <p className="text-gray-500 mt-2 text-sm">
        Pesanan kamu sudah kami terima. Simpan ID transaksi berikut:
      </p>

      {/* Transaction ID */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 w-full max-w-xs">
        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
        <p className="text-xl font-bold text-green-700 tracking-wider">{transactionId}</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full border-2 border-green-500 text-green-600 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Salin ID Transaksi
        </button>

        <Link
          href={`/cek-pesanan?id=${transactionId}`}
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <Search className="w-5 h-5" />
          Cek Status Pesanan
        </Link>

        <Link
          href="/produk"
          className="text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
        >
          Kembali Belanja
        </Link>
      </div>
    </div>
  )
}

export default function PesananBerhasilPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]"><div className="skeleton w-64 h-64 rounded-2xl" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
