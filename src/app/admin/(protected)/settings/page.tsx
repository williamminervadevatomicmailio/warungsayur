'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'

interface Settings {
  admin_username?: string
  admin_password_hash?: string
  qris_image_url?: string
  cash_enabled?: string
  qris_enabled?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cashEnabled, setCashEnabled] = useState(true)
  const [qrisEnabled, setQrisEnabled] = useState(true)
  const [qrisImageUrl, setQrisImageUrl] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setCashEnabled(data.cash_enabled !== 'false')
        setQrisEnabled(data.qris_enabled !== 'false')
        setQrisImageUrl(data.qris_image_url || '')
        setAdminUsername(data.admin_username || '')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (newPassword && newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password tidak cocok',
        text: 'Pastikan password baru dan konfirmasi password sama.',
        confirmButtonColor: '#16a34a',
      })
      return
    }

    if (newPassword && !currentPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password saat ini diperlukan',
        text: 'Masukkan password saat ini untuk mengganti password.',
        confirmButtonColor: '#16a34a',
      })
      return
    }

    setSaving(true)

    try {
      const body: Record<string, string> = {
        cash_enabled: cashEnabled ? 'true' : 'false',
        qris_enabled: qrisEnabled ? 'true' : 'false',
        qris_image_url: qrisImageUrl,
        admin_username: adminUsername,
      }

      if (newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
        body.confirmPassword = confirmPassword
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Gagal menyimpan pengaturan')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Pengaturan berhasil disimpan',
        confirmButtonColor: '#16a34a',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err instanceof Error ? err.message : 'Gagal menyimpan pengaturan',
        confirmButtonColor: '#16a34a',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Metode Pembayaran</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={cashEnabled}
              onChange={(e) => setCashEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <div>
              <p className="font-semibold text-gray-800">💵 Cash</p>
              <p className="text-xs text-gray-500">Pembayaran tunai di warung</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={qrisEnabled}
              onChange={(e) => setQrisEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <div>
              <p className="font-semibold text-gray-800">📱 QRIS</p>
              <p className="text-xs text-gray-500">Pembayaran digital melalui QRIS</p>
            </div>
          </label>
        </div>
      </div>

      {/* QRIS Settings */}
      {qrisEnabled && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Gambar QRIS</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar QRIS</label>
              <input
                type="url"
                value={qrisImageUrl}
                onChange={(e) => setQrisImageUrl(e.target.value)}
                placeholder="https://example.com/qris.png"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {qrisImageUrl && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center">
                  <img
                    src={qrisImageUrl}
                    alt="QRIS"
                    className="max-w-xs h-auto rounded"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Credentials */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Akun Admin</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username Admin</label>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswordFields((prev) => !prev)}
            className="text-left w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {showPasswordFields ? 'Sembunyikan opsi ganti password' : 'Ganti password admin'}
          </button>

          {showPasswordFields && (
            <div className="space-y-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
                    aria-label={showCurrentPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
                      aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password baru"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
                      aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">Masukkan password saat ini hanya saat mengganti password baru.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  )
}
