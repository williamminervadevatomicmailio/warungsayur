'use client'

import { useState, useEffect } from 'react'
import { Save, Upload } from 'lucide-react'
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
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cash_enabled: cashEnabled ? 'true' : 'false',
          qris_enabled: qrisEnabled ? 'true' : 'false',
          qris_image_url: qrisImageUrl,
        }),
      })

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Pengaturan berhasil disimpan',
          confirmButtonColor: '#16a34a',
        })
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menyimpan pengaturan',
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
