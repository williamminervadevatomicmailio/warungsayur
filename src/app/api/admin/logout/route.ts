import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/logout
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', { maxAge: 0 })
  return response
}
