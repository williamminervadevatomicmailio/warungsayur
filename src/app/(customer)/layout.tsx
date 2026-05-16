'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, Search } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

  const navItems = [
    { href: '/produk', label: 'Produk', icon: Package },
    { href: '/keranjang', label: 'Keranjang', icon: ShoppingCart, badge: totalItems },
    { href: '/cek-pesanan', label: 'Cek Pesanan', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/produk" className="flex items-center gap-2 min-h-0 min-w-0">
            <span className="text-2xl">🥬</span>
            <span className="font-bold text-green-600 text-lg leading-tight">Warung Sayur</span>
          </Link>
          <Link
            href="/keranjang"
            className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-green-50 transition-colors"
            aria-label="Keranjang belanja"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
