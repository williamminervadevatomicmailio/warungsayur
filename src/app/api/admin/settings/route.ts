import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, hashPassword, verifyPassword } from '@/lib/auth'
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
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      ...restSettings
    } = body as Record<string, string>

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 })
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'New password and confirmation do not match' }, { status: 400 })
      }

      const adminPasswordSetting = await prisma.setting.findUnique({
        where: { key: 'admin_password_hash' },
      })

      if (!adminPasswordSetting) {
        return NextResponse.json({ error: 'Admin password is not configured' }, { status: 500 })
      }

      const isValidPassword = await verifyPassword(currentPassword, adminPasswordSetting.value)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
      }

      const hashedPassword = await hashPassword(newPassword)
      await prisma.setting.upsert({
        where: { key: 'admin_password_hash' },
        update: { value: hashedPassword },
        create: { key: 'admin_password_hash', value: hashedPassword },
      })
    }

    for (const [key, value] of Object.entries(restSettings)) {
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
