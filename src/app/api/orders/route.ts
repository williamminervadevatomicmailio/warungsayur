import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTransactionId } from '@/lib/utils'

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, paymentMethod, items } = body

    // Validate required fields
    if (!customerPhone || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate payment method
    if (!['CASH', 'QRIS'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Fetch products to verify stock and prices
    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
    }

    // Verify stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total price
    let totalPrice = 0
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!
      totalPrice += product.price * item.quantity
      return {
        productId: product.id,
        productNameSnapshot: product.name,
        quantity: item.quantity,
        unitSnapshot: product.unit,
        priceSnapshot: product.price,
      }
    })

    // Generate unique transaction ID
    let transactionId: string
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 10) {
      transactionId = generateTransactionId()
      const existing = await prisma.order.findUnique({
        where: { transactionId },
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique transaction ID' }, { status: 500 })
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        transactionId: transactionId!,
        customerName: customerName || null,
        customerPhone,
        paymentMethod,
        paymentStatus: 'PENDING',
        itemStatus: 'PREPARING',
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Get QRIS image URL if enabled
    let qrisImageUrl = null
    if (paymentMethod === 'QRIS') {
      const qrisSetting = await prisma.setting.findUnique({
        where: { key: 'qris_image_url' },
      })
      qrisImageUrl = qrisSetting?.value || null
    }

    return NextResponse.json({
      transactionId: order.transactionId,
      totalPrice: order.totalPrice,
      qrisImageUrl,
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders
 * List orders (public - just recent ones)
 */
export async function GET(request: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        transactionId: true,
        createdAt: true,
        paymentStatus: true,
        itemStatus: true,
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
