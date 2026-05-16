import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/products/search?q=keyword
 * Search products by name, category, or tags (fuzzy matching)
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')?.toLowerCase().trim()

    if (!q || q.length < 1) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q] } },
        ],
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        tags: true,
        imageUrl: true,
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to search products:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}
