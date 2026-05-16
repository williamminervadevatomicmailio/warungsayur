import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signToken, getCookieName } from '@/lib/auth'
import { cookies } from 'next/headers'

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Get admin credentials from settings
    const adminUsernameSetting = await prisma.setting.findUnique({
      where: { key: 'admin_username' },
    })
    const adminPasswordSetting = await prisma.setting.findUnique({
      where: { key: 'admin_password_hash' },
    })

    if (!adminUsernameSetting || !adminPasswordSetting) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    // Verify credentials
    if (username !== adminUsernameSetting.value) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, adminPasswordSetting.value)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create token
    const token = signToken({ username })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    })

    return NextResponse.json({ success: true, username })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
