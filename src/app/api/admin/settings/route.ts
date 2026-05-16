import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
}

/**
 * GET /api/admin/settings
 * Get admin settings
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const settings = await prisma.setting.findMany()

    // Convert to object
    const settingsObj = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    )

    return NextResponse.json(settingsObj)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/settings
 * Update admin settings
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
