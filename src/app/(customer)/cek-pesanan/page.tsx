import React, { Suspense } from 'react'
import CekPesananClient from './CekPesananClient'

// ✅ searchParams harus async di Next.js 13+
export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const params = await searchParams
  const initialId = params?.id || ''

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    }>
      <CekPesananClient initialId={initialId} />
    </Suspense>
  )
}