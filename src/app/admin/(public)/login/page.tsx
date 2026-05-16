'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Lengkapi Data',
        text: 'Username dan password harus diisi',
        confirmButtonColor: '#16a34a',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        throw new Error('Username atau password salah')
      }

      router.push('/admin')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan',
        confirmButtonColor: '#16a34a',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-4xl">🥬</span>
            <h1 className="text-2xl font-bold text-green-600">Warung Sayur</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Admin Panel</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Masukkan kredensial admin</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ fontSize: '16px' }}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ fontSize: '16px' }}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Default: username: <strong>admin</strong> | password: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
