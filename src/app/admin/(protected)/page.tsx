'use client'

import { useEffect, useState } from 'react'
import { BarChart3, ShoppingCart, Package, Settings } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface StatsData {
  period: string
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  chartData: Record<string, { revenue: number; orders: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [period])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Period selector */}
      <div className="flex gap-2">
        {[
          { value: 'daily', label: 'Harian' },
          { value: 'weekly', label: 'Mingguan' },
          { value: 'monthly', label: 'Bulanan' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === value
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : stats ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatRupiah(stats.totalRevenue)}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-100" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Pesanan</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-100" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pesanan Lunas</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completedOrders}</p>
                </div>
                <Package className="w-12 h-12 text-emerald-100" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pesanan Pending</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingOrders}</p>
                </div>
                <Settings className="w-12 h-12 text-orange-100" />
              </div>
            </div>
          </div>

          {/* Chart data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tren Penjualan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-gray-600">Waktu</th>
                    <th className="text-right py-2 px-4 text-gray-600">Pesanan</th>
                    <th className="text-right py-2 px-4 text-gray-600">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.chartData).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100 hover:bg-green-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{key}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{value.orders}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatRupiah(value.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
