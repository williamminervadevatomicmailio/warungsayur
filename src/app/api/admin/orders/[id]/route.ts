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
 * PUT /api/admin/orders/[id]
 * Update order status
 */
export async function PUT(request: NextRequest, context: { params: any }) {
  try {
    await requireAdmin()

    const { id } = await context.params
    const body = await request.json()
    const { paymentStatus, itemStatus } = body

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(paymentStatus && { paymentStatus }),
        ...(itemStatus && { itemStatus }),
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Delete order
 */
export async function DELETE(request: NextRequest, context: { params: any }) {
  try {
    await requireAdmin()

    const { id } = await context.params

    // fetch order and items first
    const orderWithItems = await prisma.order.findUnique({
      where: { id },
      select: {
        transactionId: true,
        items: { select: { productId: true, quantity: true } },
      },
    })

    if (!orderWithItems) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // restore stock for each item and delete order in a transaction
    const ops: any[] = []
    for (const it of orderWithItems.items) {
      ops.push(
        prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } })
      )
    }
    ops.push(prisma.order.delete({ where: { id } }))

    await prisma.$transaction(ops)

    return NextResponse.json({ success: true, transactionId: orderWithItems.transactionId || null })
  } catch (error) {
    console.error('Failed to delete order:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
