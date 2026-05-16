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
 * GET /api/admin/products
 * List all products (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, description, category, price, unit, stock, tags, imageUrl } = body

    if (!name || !category || price === undefined || !unit || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        category,
        price,
        unit,
        stock,
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl || null,
        isActive: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
