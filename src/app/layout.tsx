import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Warung Sayur Digital',
  description: 'Pesan sayuran segar langsung dari warung kami',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-[family-name:var(--font-poppins)] bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
