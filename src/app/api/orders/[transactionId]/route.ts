import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/orders/[transactionId]
 * Get order status by transaction ID
 */
export async function GET(request: NextRequest, context: { params: any }) {
  try {
    const { transactionId } = await context.params

    const order = await prisma.order.findUnique({
      where: { transactionId },
      include: {
        items: {
          select: {
            productNameSnapshot: true,
            quantity: true,
            unitSnapshot: true,
            priceSnapshot: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      transactionId: order.transactionId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      itemStatus: order.itemStatus,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
    })
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
