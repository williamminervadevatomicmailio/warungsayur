'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
      setLoading(false)
    }
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/produk', label: 'Produk', icon: Package },
    { href: '/admin/pesanan', label: 'Pesanan', icon: ShoppingCart },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥬</span>
          <div>
            <h1 className="font-bold text-green-600 text-lg">Warung Sayur</h1>
          </div>
        </div>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen((s) => !s)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-64`}>
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <span className="text-2xl">🥬</span>
          <div>
            <h1 className="font-bold text-green-600 text-lg">Warung Sayur</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="m-4 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 w-[calc(100%-2rem)]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{loading ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </aside>

      {/* Overlay for mobile when sidebar open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
