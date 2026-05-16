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
 * GET /api/admin/orders
 * List all orders
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

