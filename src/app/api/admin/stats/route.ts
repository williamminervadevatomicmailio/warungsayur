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
 * GET /api/admin/stats?period=daily|weekly|monthly
 * Get sales statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const period = request.nextUrl.searchParams.get('period') || 'daily'
    const now = new Date()

    // Calculate date range
    let startDate: Date
    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'weekly') {
      const day = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - day)
      startDate.setHours(0, 0, 0, 0)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Fetch orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: { items: true },
    })

    // Calculate stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
    const completedOrders = orders.filter((o) => o.paymentStatus === 'LUNAS').length
    const pendingOrders = orders.filter((o) => o.paymentStatus !== 'LUNAS').length

    // Group by date for chart data
    const chartData: Record<string, { revenue: number; orders: number }> = {}

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
      let key: string

      if (period === 'daily') {
        key = `${date.getHours()}:00`
      } else if (period === 'weekly') {
        key = date.toLocaleDateString('id-ID', { weekday: 'short' })
      } else {
        key = date.getDate().toString()
      }

      if (!chartData[key]) {
        chartData[key] = { revenue: 0, orders: 0 }
      }
      chartData[key].revenue += order.totalPrice
      chartData[key].orders += 1
    })

    return NextResponse.json({
      period,
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      chartData,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
