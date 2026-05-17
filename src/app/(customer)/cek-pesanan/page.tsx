import React, { Suspense } from 'react'
import CekPesananClient from './CekPesananClient.tsx'

export default function Page({ searchParams }: { searchParams?: { id?: string } }) {
  const initialId = (searchParams && (searchParams as any).id) || ''

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <CekPesananClient initialId={initialId} />
    </Suspense>
  )
}
